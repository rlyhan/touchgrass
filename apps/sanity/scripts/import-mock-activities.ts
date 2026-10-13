// One-off import of the mock activities into Sanity, skipping slugs that already exist.
// Targets SANITY_PROJECT_ID / SANITY_DATASET from the root .env.local. Dry run by default.
// Run from apps/sanity: npx sanity exec scripts/import-mock-activities.ts --with-user-token -- --commit
import {getCliClient} from 'sanity/cli'
import {RECOMMENDATIONS} from '@touchgrass/mocks/recommendations'

process.loadEnvFile(new URL('../../../.env.local', import.meta.url))

const COMMIT = process.argv.includes('--commit')
const UPLOAD_CONCURRENCY = 8

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET
if (!projectId || !dataset) throw new Error('SANITY_PROJECT_ID and SANITY_DATASET must be set')

// getCliClient falls back to sanity.cli.ts (production) unless both of these are passed.
const client = getCliClient({apiVersion: '2025-01-01', projectId, dataset})

function randomKey() {
  return Math.random().toString(36).slice(2, 14)
}

async function uploadImage(url: string): Promise<string | undefined> {
  const response = await fetch(url)
  if (!response.ok) {
    console.warn(`Skipping image ${url} (${response.status})`)
    return undefined
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const photoId = new URL(url).pathname.split('/').pop() ?? 'image'
  const asset = await client.assets.upload('image', buffer, {
    filename: `${photoId}.jpg`,
    source: {name: 'unsplash', id: photoId, url},
  })
  return asset._id
}

async function main() {
  const existingSlugs = new Set(
    await client.fetch<string[]>(`*[_type == "activity" && defined(slug.current)].slug.current`),
  )
  const toImport = RECOMMENDATIONS.filter((activity) => !existingSlugs.has(activity.slug))
  const imageUrls = [...new Set(toImport.map((activity) => activity.imageUrl))]

  console.log(`Dataset: ${client.config().dataset}`)
  console.log(`${RECOMMENDATIONS.length} mocks, ${existingSlugs.size} activities already in Sanity`)
  console.log(`${toImport.length} to import, ${imageUrls.length} unique images to upload`)
  if (!COMMIT) {
    console.log('Dry run: pass --commit to write')
    return
  }

  const assetIdByUrl = new Map<string, string | undefined>()
  for (let i = 0; i < imageUrls.length; i += UPLOAD_CONCURRENCY) {
    const chunk = imageUrls.slice(i, i + UPLOAD_CONCURRENCY)
    const ids = await Promise.all(chunk.map(uploadImage))
    chunk.forEach((url, j) => assetIdByUrl.set(url, ids[j]))
    console.log(`Processed ${assetIdByUrl.size}/${imageUrls.length} images`)
  }

  const transaction = client.transaction()
  const missingImages: string[] = []
  for (const {slug, imageUrl, instructions, ...fields} of toImport) {
    const assetId = assetIdByUrl.get(imageUrl)
    if (!assetId) missingImages.push(slug)
    transaction.createIfNotExists({
      _id: `activity-${slug}`,
      _type: 'activity',
      ...fields,
      slug: {_type: 'slug', current: slug},
      imageUrl: assetId
        ? {_type: 'image', asset: {_type: 'reference', _ref: assetId}}
        : undefined,
      instructions: instructions?.map((step) => ({_type: 'instruction', _key: randomKey(), ...step})),
    })
  }
  await transaction.commit()
  console.log(`Created ${toImport.length} published activities`)
  if (missingImages.length) console.log(`Missing images, add in Studio: ${missingImages.join(', ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
