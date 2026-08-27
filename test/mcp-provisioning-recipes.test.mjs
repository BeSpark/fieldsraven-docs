import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "..")
const plannedVersionGate = "Requires FieldsRaven 0.34.0 or later."

const guides = [
  {
    file: "mcp/recipes/wishlist.md",
    title: "Wishlist",
    key: "wishlist",
    valueType: "list.product_reference",
    optionalToggle: "has_metafield_definition"
  },
  {
    file: "mcp/recipes/registration-form.md",
    title: "Registration form",
    key: "registrations",
    valueType: "json"
  },
  {
    file: "mcp/recipes/store-review-with-approval.md",
    title: "Store review with approval",
    key: "store_review",
    valueType: "json",
    optionalToggle: "needs_approval"
  },
  {
    file: "mcp/recipes/birthday-with-klaviyo.md",
    title: "Birthday with Klaviyo",
    key: "birthday",
    valueType: "single_line_text_field",
    optionalToggle: "klaviyo_sync"
  }
]

function read(relativePath) {
  const absolutePath = path.join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} is missing`)
  return readFileSync(absolutePath, "utf8")
}

function jsonFences(text) {
  return [ ...text.matchAll(/^```json\n([\s\S]*?)^```[ \t]*$/gm) ].map((match) => match[1])
}

test("MCP provisioning recipes are navigable, gated for the planned release, and use parseable payloads", () => {
  const summary = read("SUMMARY.md")
  const workflows = read("mcp/workflows.md")

  for (const guide of guides) {
    const text = read(guide.file)

    assert.match(summary, new RegExp(`\\[${guide.title}\\]\\(${guide.file}\\)`))
    assert.match(workflows, new RegExp(`\\[${guide.title}\\]\\(recipes/${path.basename(guide.file)}\\)`))
    assert.match(text, new RegExp(guide.key))
    assert.match(text, new RegExp(guide.valueType.replace(".", "\\.")))
    assert.match(text, /Manage token/i)
    assert.match(text, /logged in/i)
    assert.match(text, /submission\.receipt/)
    assert.match(text, /raven\.identity\.slug/)
    assert.match(text, /expected_revision/)
    assert.match(text, /idempotency/i)
    assert.match(text, /deactivate/i)
    assert.match(text, new RegExp(plannedVersionGate.replace(".", "\\.")))

    const payloads = jsonFences(text)
    assert.ok(payloads.length > 0, `${guide.file} needs at least one JSON payload`)
    for (const payload of payloads) assert.doesNotThrow(() => JSON.parse(payload), `${guide.file} has invalid JSON`)

    if (guide.optionalToggle) {
      assert.match(text, new RegExp(guide.optionalToggle))
      assert.match(text, /optional/i)
      assert.match(text, /not live-exercised[\s\S]{0,80}designated test[\s\S]{0,80}for this release/i)
      assert.match(text, /prerequisite|risk/i)
    }
  }
})

test("provisioning recipes preserve the recipe-specific safety boundaries", () => {
  const wishlist = read("mcp/recipes/wishlist.md")
  const registration = read("mcp/recipes/registration-form.md")
  const review = read("mcp/recipes/store-review-with-approval.md")
  const birthday = read("mcp/recipes/birthday-with-klaviyo.md")

  assert.match(wishlist, /numeric product ids, never GIDs/i)
  assert.match(wishlist, /one-slot wishlist/i)
  assert.match(registration, /shop-level flag the MCP cannot set/i)
  assert.match(registration, /Do not put it in this payload/i)
  assert.match(review, /AWAITING_APPROVAL/)
  assert.match(review, /human approval/i)
  assert.match(birthday, /two-beat/i)
  assert.match(birthday, /fresh submission after enabling sync/i)
  assert.match(birthday, /KLAVIYO_SYNCED|KLAVIYO_SYNC_FAILED/)
})

test("create conflicts branch on code and use the response object for that outcome", () => {
  const workflows = read("mcp/workflows.md")

  assert.match(workflows, /CONFIGURATION_CONFLICT/)
  assert.match(workflows, /IDEMPOTENCY_CONFLICT/)
  assert.match(workflows, /branch on `code`, not `outcome`/i)
  assert.match(workflows, /current_raven\.identity\.slug/)
  assert.match(workflows, /current_raven\.revision/)
  assert.match(workflows, /do not retry the create/i)

  for (const guide of guides) {
    const text = read(guide.file)
    assert.match(text, /For `applied` or `existing`, read `raven\.identity\.slug` and `raven\.revision`/)
    assert.match(text, /for `conflict` or\s+`partial`, read `current_raven\.identity\.slug` and `current_raven\.revision`/)
  }
})
