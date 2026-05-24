import { strict as assert } from "node:assert"
import { test } from "node:test"

import { pt } from "@touchgrass/mocks/recommendations"

test("pt() wraps a single paragraph into one portable text block", () => {
  const [block] = pt("Hello world.")

  assert.ok(block)
  assert.equal(block._type, "block")
  assert.equal(block.style, "normal")
  assert.deepEqual(block.markDefs, [])
  const children = block.children as Array<{ _type: string; text: string; marks: string[] }>
  assert.equal(children.length, 1)
  assert.equal(children[0]?._type, "span")
  assert.equal(children[0]?.text, "Hello world.")
  assert.deepEqual(children[0]?.marks, [])
})

test("pt() produces one block per paragraph with unique _keys", () => {
  const blocks = pt("First.", "Second.", "Third.")

  assert.equal(blocks.length, 3)
  const keys = blocks.map((b) => b._key)
  assert.equal(new Set(keys).size, 3, "block _keys must be unique")
  const texts = blocks.map((b) => {
    const children = b.children as Array<{ text: string }>
    return children[0]?.text
  })
  assert.deepEqual(texts, ["First.", "Second.", "Third."])
})

test("pt() returns an empty array when called with no paragraphs", () => {
  assert.deepEqual(pt(), [])
})
