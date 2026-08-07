import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "..")

const recipes = [
  {
    file: "example-features/shopify-quiz-profiles.md",
    summaryTitle: "Shopify quiz profiles",
    publicUrl: "https://docs.fieldsraven.app/example-features/shopify-quiz-profiles",
    marketingPath: "/use-cases/shopify-quiz-profiles",
    namespaceKey: "custom.quiz_profile",
    globalName: "FR_CUSTOM__CUSTOMER_QUIZ_PROFILE",
    payloadExpression: "profilePayload",
    stateAssignment: "currentProfile = profilePayload"
  },
  {
    file: "example-features/shopify-klaviyo-sync.md",
    summaryTitle: "Shopify Klaviyo sync",
    publicUrl: "https://docs.fieldsraven.app/example-features/shopify-klaviyo-sync",
    marketingPath: "/use-cases/shopify-klaviyo-sync",
    namespaceKey: "custom.marketing_preferences",
    globalName: "FR_CUSTOM__CUSTOMER_MARKETING_PREFERENCES",
    payloadExpression: "preferencesPayload",
    stateAssignment: "savedPreferences = preferencesPayload"
  },
  {
    file: "example-features/wish-list.md",
    summaryTitle: "Shopify customer wishlist",
    publicUrl: "https://docs.fieldsraven.app/example-features/wish-list",
    marketingPath: "/use-cases/shopify-customer-wishlist",
    namespaceKey: "custom.wishlist",
    globalName: "FR_CUSTOM__CUSTOMER_WISHLIST",
    payloadExpression: "nextWishlist",
    stateAssignment: "wishlist = nextWishlist"
  },
  {
    file: "example-features/saved-product-configurations.md",
    summaryTitle: "Saved product configurations",
    publicUrl: "https://docs.fieldsraven.app/example-features/saved-product-configurations",
    marketingPath: "/use-cases/saved-product-configurations",
    namespaceKey: "custom.saved_configurations",
    globalName: "FR_CUSTOM__CUSTOMER_SAVED_CONFIGURATIONS",
    payloadExpression: "nextConfigurations",
    stateAssignment: "configurations = nextConfigurations"
  },
  {
    file: "example-features/shopify-vehicle-garage.md",
    summaryTitle: "Shopify vehicle garage",
    publicUrl: "https://docs.fieldsraven.app/example-features/shopify-vehicle-garage",
    marketingPath: "/use-cases/shopify-vehicle-garage",
    namespaceKey: "custom.vehicle_garage",
    globalName: "FR_CUSTOM__CUSTOMER_VEHICLE_GARAGE",
    payloadExpression: "nextGarage",
    stateAssignment: "garage = nextGarage"
  },
  {
    file: "example-features/customer-product-registration.md",
    summaryTitle: "Shopify product registration",
    publicUrl: "https://docs.fieldsraven.app/example-features/customer-product-registration",
    marketingPath: "/use-cases/shopify-product-registration",
    namespaceKey: "custom.product_registrations",
    globalName: "FR_CUSTOM__CUSTOMER_PRODUCT_REGISTRATIONS",
    payloadExpression: "nextRegistrations",
    stateAssignment: "registrations = nextRegistrations"
  }
]

function read(relativePath) {
  const absolutePath = path.join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} is missing`)
  return readFileSync(absolutePath, "utf8")
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length
}

function codeFences(text) {
  return [...text.matchAll(/^```[^\n]*\n([\s\S]*?)^```$/gm)].map((match) => match[1])
}

function canonicalRequestFence(text, file) {
  const matches = codeFences(text).filter((fence) => fence.includes("/apps/raven/create_metafield"))
  assert.equal(matches.length, 1, `${file} must have exactly one canonical current-endpoint code fence`)
  return matches[0]
}

function assertBalancedLiquid(text, file) {
  assert.equal(
    count(text, /{%\s*if\b/g),
    count(text, /{%\s*endif\s*%}/g),
    `${file} has unbalanced Liquid if blocks`
  )
}

function assertLabelAssociations(text, file) {
  const labelTargets = [...text.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["']/g)].map((match) => match[1])
  assert.ok(labelTargets.length > 0, `${file} needs explicit labels`)

  for (const target of labelTargets) {
    assert.match(text, new RegExp(`\\bid=["']${target}["']`), `${file} label target ${target} is missing`)
  }
}

test("verifier runs on the pinned Node version", () => {
  assert.equal(process.version, "v22.22.1")
})

for (const recipe of recipes) {
  test(`${recipe.file} implements the complete direct-request recipe contract`, () => {
    const text = read(recipe.file)
    const fence = canonicalRequestFence(text, recipe.file)
    const scriptBodies = [...fence.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    const recipeScript = scriptBodies.at(-1)?.[1]

    assert.match(text, /{%\s*if customer\s*%}/, `${recipe.file} needs a customer guard`)
    assert.equal(count(text, /^#\s+/gm), 1, `${recipe.file} needs exactly one page heading`)
    assertBalancedLiquid(text, recipe.file)
    assert.equal(count(text, /^```/gm) % 2, 0, `${recipe.file} has unbalanced code fences`)
    assertLabelAssociations(text, recipe.file)
    assert.ok(recipeScript, `${recipe.file} needs an executable script`)
    assert.doesNotThrow(() => new Function(recipeScript), `${recipe.file} contains invalid JavaScript`)
    assert.match(text, /<button\b[^>]*\btype=["']submit["']/, `${recipe.file} needs a real submit button`)
    assert.match(text, /aria-live=["']polite["']/, `${recipe.file} needs a polite status region`)
    assert.match(fence, /setAttribute\(["']aria-busy["'],\s*(?:["']true["']|String\(busy\))\)/)
    assert.match(fence, /setAttribute\(["']aria-busy["'],\s*(?:["']false["']|String\(busy\))\)/)

    assert.match(text, new RegExp(recipe.namespaceKey.replace(".", "\\.")))
    assert.match(fence, new RegExp(`window\\.${recipe.globalName}\\b`))
    assert.match(fence, /fetch\(["']\/apps\/raven\/create_metafield["']/)
    assert.match(fence, /method:\s*["']PUT["']/)
    assert.match(fence, /body:\s*JSON\.stringify\(\{\s*raven:\s*\{/)
    assert.match(fence, /raven_id:\s*config\.ravenId/)
    assert.match(fence, /resource_id:\s*config\.resourceId/)
    assert.match(fence, /raven_mac:\s*config\.ravenMac/)
    assert.match(
      fence,
      new RegExp(`value:\\s*JSON\\.stringify\\(${recipe.payloadExpression}\\)`),
      `${recipe.file} must stringify the local next payload at the request boundary`
    )

    assert.match(fence, /response\.status\s*===\s*429/)
    assert.match(fence, /response\.headers\.get\(["']content-type["']\)/)
    assert.match(fence, /response\.ok/)
    assert.match(fence, /rejected/i)
    assert.match(fence, /catch\s*\(/)
    assert.match(fence, /network/i)
    assert.match(text, /accepted and queued/i)
    assert.match(text, /does not (prove|mean)[^.]*completed/i)

    const requestIndex = fence.indexOf("await save")
    const mutationIndex = fence.indexOf(recipe.stateAssignment)
    assert.ok(requestIndex >= 0, `${recipe.file} must await its save helper`)
    assert.ok(
      mutationIndex > requestIndex,
      `${recipe.file} must mutate local state only after the request is accepted`
    )

    const key = recipe.namespaceKey.split(".")[1]
    assert.match(text, new RegExp(`customer\\.metafields\\.custom\\.${key}\\.value`))
    assert.match(text, new RegExp(`https://fieldsraven\\.app${recipe.marketingPath}`))
    assert.match(text, /\]\(\.\.\/quick-start\.md\)/)
    assert.ok(
      text.indexOf("The Storefront Kit is optional") > text.indexOf("/apps/raven/create_metafield"),
      `${recipe.file} must put its optional-kit note after the complete direct request`
    )

    assert.doesNotMatch(text, /create_update_metafield|raven-mac-gen|YOUR_RAVEN_ID|FieldsRaven\.send/)
    assert.doesNotMatch(text, /href=["']#(?:["'])|>\s*click here\s*</i)

    for (const link of text.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
      assert.ok(link[1].startsWith("https://"), `${recipe.file} has a non-HTTPS external link: ${link[1]}`)
    }

    const ids = [...text.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1])
    assert.equal(ids.length, new Set(ids).size, `${recipe.file} contains duplicate DOM ids`)
  })
}

test("SUMMARY and the Example features index map all six recipes exactly once", () => {
  const summary = read("SUMMARY.md")
  const index = read("example-features/README.md")

  for (const recipe of recipes) {
    const escapedFile = recipe.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    assert.equal(
      count(summary, new RegExp(`\\]\\(${escapedFile}\\)`, "g")),
      1,
      `SUMMARY.md must link ${recipe.file} exactly once`
    )
    assert.equal(
      count(index, new RegExp(`\\]\\(${path.basename(escapedFile)}\\)`, "g")),
      1,
      `example-features/README.md must link ${recipe.file} exactly once`
    )
  }

  const competingDirectories = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /use.?cases/i.test(entry.name))
    .map((entry) => entry.name)
  assert.deepEqual(competingDirectories, [], "do not create a competing use-cases documentation tree")
})

test("each recipe preserves its use-case-specific data and ownership boundaries", () => {
  const quiz = read("example-features/shopify-quiz-profiles.md")
  assert.match(quiz, /last-write-wins/i)
  assert.match(quiz, /separate event/i)

  const klaviyo = read("example-features/shopify-klaviyo-sync.md")
  assert.match(klaviyo, /keys such as.*custom profile properties/is)
  assert.doesNotMatch(klaviyo, /nearly 100,000|100,000 sync/i)

  const wishlist = read("example-features/wish-list.md")
  assert.doesNotMatch(wishlist, /all_products\[/)
  assert.match(
    wishlist,
    /<a\s+href=["']\/products\/{{\s*saved_item\.product_handle\s*\|\s*url_encode\s*}}["']>\s*{{\s*saved_item\.product_handle\s*\|\s*escape\s*}}\s*<\/a>/,
    "the direct product link must encode its path and escape its shopper-controlled label"
  )
  assert.match(wishlist, /already in your wishlist/i)
  assert.match(wishlist, /removeWishlistItem/)

  const klaviyoFence = canonicalRequestFence(klaviyo, "example-features/shopify-klaviyo-sync.md")
  assert.match(klaviyoFence, /topic_guides:\s*formData\.get\(["']topic_guides["']\)\s*===\s*["']true["']/)
  assert.match(klaviyoFence, /topic_new_products:\s*formData\.get\(["']topic_new_products["']\)\s*===\s*["']true["']/)
  assert.doesNotMatch(klaviyoFence, /getAll\(["']topics["']\)/)

  const configurations = read("example-features/saved-product-configurations.md")
  assert.match(configurations, /fieldsraven:open-configuration/)
  assert.match(configurations, /editConfiguration/)
  assert.match(configurations, /removeConfiguration/)

  const garage = read("example-features/shopify-vehicle-garage.md")
  assert.match(garage, /selected_vehicle_id/)
  assert.match(garage, /compatibility rules, fitment data, and product filtering belong to the merchant theme/i)

  const registration = read("example-features/customer-product-registration.md")
  assert.match(registration, /already registered/i)
  assert.match(registration, /metaobject sync disabled/i)
  assert.match(registration, /separate event-shaped Raven/i)

  for (const recipe of recipes.filter((entry) => entry.file !== "example-features/customer-product-registration.md")) {
    assert.doesNotMatch(read(recipe.file), /metaobject sync/i, `${recipe.file} must not prescribe metaobject sync`)
  }
})

test("recipe sources map to the six exact extensionless public URLs", () => {
  assert.deepEqual(
    Object.fromEntries(recipes.map((recipe) => [ recipe.file, recipe.publicUrl ])),
    {
      "example-features/shopify-quiz-profiles.md": "https://docs.fieldsraven.app/example-features/shopify-quiz-profiles",
      "example-features/shopify-klaviyo-sync.md": "https://docs.fieldsraven.app/example-features/shopify-klaviyo-sync",
      "example-features/wish-list.md": "https://docs.fieldsraven.app/example-features/wish-list",
      "example-features/saved-product-configurations.md": "https://docs.fieldsraven.app/example-features/saved-product-configurations",
      "example-features/shopify-vehicle-garage.md": "https://docs.fieldsraven.app/example-features/shopify-vehicle-garage",
      "example-features/customer-product-registration.md": "https://docs.fieldsraven.app/example-features/customer-product-registration"
    }
  )
})

test("Quick Start teaches the direct string-value boundary before the optional kit", () => {
  const text = read("quick-start.md")
  const endpointIndex = text.indexOf("/apps/raven/create_metafield")
  const optionalKitIndex = text.indexOf("Storefront Kit is optional")

  assert.ok(endpointIndex >= 0, "Quick Start needs the current endpoint")
  assert.ok(optionalKitIndex > endpointIndex, "Quick Start must teach the direct request before the optional kit")
  assert.match(text, /value parameter is always a string/i)
  assert.match(text, /value:\s*JSON\.stringify\(payload\)/)
  assert.match(text, /accepted and queued/i)
  assert.match(text, /does not (prove|mean)[^.]*completed/i)
  assert.doesNotMatch(text, /create_update_metafield|raven-mac-gen|YOUR_RAVEN_ID|FieldsRaven\.send/)
})
