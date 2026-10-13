import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const shared = {
  projectId: '93cev0va',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
}

export default defineConfig([
  {
    ...shared,
    name: 'default',
    title: 'Touchgrass',
    basePath: '/production',
    dataset: 'production',
  },
  {
    ...shared,
    name: 'qa',
    title: 'Touchgrass (QA)',
    basePath: '/qa',
    dataset: 'qa',
  },
])
