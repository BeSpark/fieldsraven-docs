import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"

const root = path.resolve(import.meta.dirname, "..")

const recipeCases = [
  {
    file: "example-features/shopify-quiz-profiles.md",
    call: "saveQuizProfile({ skin_type: 'balanced', goals: [] })",
    fallback: "FieldsRaven rejected the profile."
  },
  {
    file: "example-features/shopify-klaviyo-sync.md",
    call: "saveMarketingPreferences({ email_frequency: 'weekly', topic_guides: true, topic_new_products: false })",
    fallback: "FieldsRaven rejected the preferences."
  },
  {
    file: "example-features/wish-list.md",
    call: "saveWishlist([{ product_handle: 'linen-shirt' }])",
    fallback: "FieldsRaven rejected the wishlist update."
  },
  {
    file: "example-features/saved-product-configurations.md",
    call: "saveConfigurations([])",
    fallback: "FieldsRaven rejected the configuration update."
  },
  {
    file: "example-features/shopify-vehicle-garage.md",
    call: "saveGarage({ vehicles: [], selected_vehicle_id: null })",
    fallback: "FieldsRaven rejected the garage update."
  },
  {
    file: "example-features/customer-product-registration.md",
    call: "saveRegistrations([])",
    fallback: "FieldsRaven rejected the registration."
  }
]

const listCases = [
  {
    name: "wishlist",
    file: "example-features/wish-list.md",
    initialId: "fr-wishlist-initial",
    initialValue: [ { product_handle: "linen-shirt" }, { product_handle: "oak-side-table" } ],
    regionId: "fr-wishlist-region",
    submitId: "fr-wishlist-submit",
    listId: "fr-wishlist-list",
    statusId: "fr-wishlist-status",
    firstAction: "removeWishlistItem('linen-shirt')",
    overlappingAction: "removeWishlistItem('oak-side-table')",
    fallback: "FieldsRaven rejected the wishlist update."
  },
  {
    name: "saved configurations",
    file: "example-features/saved-product-configurations.md",
    initialId: "fr-configurations-initial",
    initialValue: [
      { id: "one", name: "Warm", product_handle: "rug", options: { color: "red" } },
      { id: "two", name: "Cool", product_handle: "rug", options: { color: "blue" } }
    ],
    regionId: "fr-configuration-region",
    submitId: "fr-configuration-submit",
    listId: "fr-configuration-list",
    statusId: "fr-configuration-status",
    firstAction: "removeConfiguration('one')",
    overlappingAction: "removeConfiguration('two')",
    fallback: "FieldsRaven rejected the configuration update."
  },
  {
    name: "vehicle garage",
    file: "example-features/shopify-vehicle-garage.md",
    initialId: "fr-garage-initial",
    initialValue: {
      vehicles: [
        { id: "one", year: 2020, make: "Volvo", model: "V60" },
        { id: "two", year: 2023, make: "Ford", model: "Bronco" }
      ],
      selected_vehicle_id: "one"
    },
    regionId: "fr-garage-region",
    submitId: "fr-garage-submit",
    listId: "fr-garage-list",
    statusId: "fr-garage-status",
    firstAction: "selectVehicle('two')",
    overlappingAction: "removeVehicle('one')",
    fallback: "FieldsRaven rejected the garage update."
  }
]

class FakeElement {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName.toUpperCase()
    this.id = id
    this.attributes = new Map()
    this.children = []
    this.disabled = false
    this.hidden = false
    this.listeners = new Map()
    this.formValues = new Map()
    this.href = ""
    this.elements = {}
    this._textContent = ""
  }

  get textContent() {
    return this._textContent
  }

  set textContent(value) {
    this._textContent = String(value)
    this.children = []
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || []
    listeners.push(listener)
    this.listeners.set(type, listeners)
  }

  async dispatch(type) {
    const event = { preventDefault() {}, target: this }
    return Promise.all((this.listeners.get(type) || []).map((listener) => listener(event)))
  }

  async click() {
    if (this.disabled) return []
    return this.dispatch("click")
  }

  append(...children) {
    this.children.push(...children)
  }

  replaceChildren(...children) {
    this._textContent = ""
    this.children = [ ...children ]
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null
  }

  querySelectorAll(selector) {
    assert.equal(selector, "button", `unsupported fake selector: ${selector}`)
    return descendants(this).filter((element) => element.tagName === "BUTTON")
  }

  focus() {}

  reset() {
    this.formValues.clear()
  }
}

function descendants(element) {
  return element.children.flatMap((child) => {
    if (!(child instanceof FakeElement)) return []
    return [ child, ...descendants(child) ]
  })
}

function elementText(element) {
  return element._textContent + element.children.map((child) => (
    child instanceof FakeElement ? elementText(child) : String(child)
  )).join("")
}

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8")
}

function codeFences(text) {
  return [ ...text.matchAll(/^```[^\n]*\n([\s\S]*?)^```$/gm) ].map((match) => match[1])
}

function recipeScript(file) {
  const fence = codeFences(read(file)).find((candidate) => candidate.includes("/apps/raven/create_metafield"))
  assert.ok(fence, `${file} needs a request fence`)
  const scripts = [ ...fence.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g) ]
  assert.ok(scripts.length > 0, `${file} needs an executable script`)
  return scripts.at(-1)[1]
}

function okResponse() {
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({ success: true })
  }
}

function rejectedResponse(message = { detail: "unsafe object" }) {
  return {
    ok: false,
    status: 422,
    headers: { get: () => "application/json" },
    json: async () => ({ message })
  }
}

function rateLimitedResponse() {
  return {
    ok: false,
    status: 429,
    headers: { get: () => "application/json" },
    json: async () => ({ message: "server wording must not replace the retry guidance" })
  }
}

function invalidJsonResponse() {
  return {
    ok: false,
    status: 500,
    headers: { get: () => "application/json" },
    json: async () => { throw new SyntaxError("bad JSON") }
  }
}

function createRuntime(file, { initialId, initialValue, fetchImpl } = {}) {
  const elements = new Map()
  const document = {
    createElement(tagName) {
      return new FakeElement(tagName)
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement(elementTag(id), id))
      return elements.get(id)
    }
  }

  if (initialId) document.getElementById(initialId).textContent = JSON.stringify(initialValue)
  for (const [ id, value ] of Object.entries(defaultInitialValues)) {
    if (!elements.has(id)) document.getElementById(id).textContent = JSON.stringify(value)
  }

  class FakeFormData {
    constructor(form) {
      this.values = form.formValues
    }

    get(name) {
      const value = this.values.get(name)
      return Array.isArray(value) ? value[0] : (value ?? "")
    }

    getAll(name) {
      const value = this.values.get(name)
      return Array.isArray(value) ? value : (value == null ? [] : [ value ])
    }
  }

  const window = {
    FR_CUSTOM__CUSTOMER_QUIZ_PROFILE: requestConfig,
    FR_CUSTOM__CUSTOMER_MARKETING_PREFERENCES: requestConfig,
    FR_CUSTOM__CUSTOMER_WISHLIST: requestConfig,
    FR_CUSTOM__CUSTOMER_SAVED_CONFIGURATIONS: requestConfig,
    FR_CUSTOM__CUSTOMER_VEHICLE_GARAGE: requestConfig,
    FR_CUSTOM__CUSTOMER_PRODUCT_REGISTRATIONS: requestConfig,
    dispatchEvent() {}
  }
  const context = vm.createContext({
    console,
    crypto: { randomUUID: () => "generated-id" },
    CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail } },
    Date,
    document,
    Error,
    fetch: fetchImpl || (async () => okResponse()),
    FormData: FakeFormData,
    JSON,
    Number,
    TypeError,
    window
  })

  vm.runInContext(recipeScript(file), context, { filename: file })
  return { context, document, elements }
}

function elementTag(id) {
  if (id.includes("form")) return "form"
  if (id.includes("submit")) return "button"
  if (id.includes("list")) return "ul"
  if (id.includes("region")) return "section"
  return "div"
}

function mutatingButtons(runtime) {
  return [ ...runtime.elements.values(), ...[ ...runtime.elements.values() ].flatMap(descendants) ]
    .filter((element) => element.tagName === "BUTTON")
    .filter((element) => element.id.includes("submit") || /^(Remove|Select)/.test(elementText(element)))
}

const requestConfig = { ravenId: "raven-1", resourceId: "customer-1", ravenMac: "signed-mac" }
const defaultInitialValues = {
  "fr-quiz-profile-initial": {},
  "fr-preferences-initial": {},
  "fr-wishlist-initial": [],
  "fr-configurations-initial": [],
  "fr-garage-initial": { vehicles: [], selected_vehicle_id: null },
  "fr-registrations-initial": []
}

test("wishlist executes initial render, object-shaped add, duplicate prevention, and removal", async () => {
  const requests = []
  const runtime = createRuntime("example-features/wish-list.md", {
    initialId: "fr-wishlist-initial",
    initialValue: [ { product_handle: "linen-shirt" }, { product_handle: "oak-side-table" } ],
    fetchImpl: async (url, options) => {
      requests.push({ url, options })
      return okResponse()
    }
  })
  const form = runtime.document.getElementById("fr-wishlist-form")
  const list = runtime.document.getElementById("fr-wishlist-list")
  const status = runtime.document.getElementById("fr-wishlist-status")

  assert.deepEqual(list.children.map(elementText), [ "linen-shirt Remove linen-shirt", "oak-side-table Remove oak-side-table" ])

  form.formValues.set("product_handle", "walnut-desk")
  await form.dispatch("submit")

  assert.equal(requests.length, 1)
  assert.deepEqual(savedValue(requests[0]), [
    { product_handle: "linen-shirt" },
    { product_handle: "oak-side-table" },
    { product_handle: "walnut-desk" }
  ])
  assert.match(status.textContent, /Added.*accepted and queued/)

  await form.dispatch("submit")

  assert.equal(requests.length, 1, "duplicate handles must not issue a write")
  assert.equal(status.textContent, "That product is already in your wishlist.")

  const remove = descendants(list).find((element) => elementText(element) === "Remove linen-shirt")
  await remove.click()

  assert.equal(requests.length, 2)
  assert.deepEqual(savedValue(requests[1]), [
    { product_handle: "oak-side-table" },
    { product_handle: "walnut-desk" }
  ])
})

test("wishlist renders shopper handles as text in encoded product links", () => {
  const unsafeHandle = '\"><img src=x onerror=alert(1)>'
  const runtime = createRuntime("example-features/wish-list.md", {
    initialId: "fr-wishlist-initial",
    initialValue: [ { product_handle: unsafeHandle } ]
  })
  const list = runtime.document.getElementById("fr-wishlist-list")
  const links = descendants(list).filter((element) => element.tagName === "A")

  assert.equal(links.length, 1, "the enhanced wishlist must preserve a product destination")
  assert.equal(links[0].textContent, unsafeHandle, "shopper-controlled handles must remain text")
  assert.equal(links[0].href, `/products/${encodeURIComponent(unsafeHandle)}`)
})

test("Klaviyo preference recipe saves stable scalar topic properties", async () => {
  const requests = []
  const runtime = createRuntime("example-features/shopify-klaviyo-sync.md", {
    initialId: "fr-preferences-initial",
    initialValue: {},
    fetchImpl: async (url, options) => {
      requests.push({ url, options })
      return okResponse()
    }
  })
  const form = runtime.document.getElementById("fr-preferences-form")

  form.formValues.set("email_frequency", "weekly")
  form.formValues.set("topic_guides", "true")
  await form.dispatch("submit")

  assert.equal(requests.length, 1)
  assert.deepEqual(savedValue(requests[0]), {
    email_frequency: "weekly",
    topic_guides: true,
    topic_new_products: false
  })
})

for (const recipe of recipeCases) {
  test(`${recipe.file} uses its fallback unless a rejected message is a string`, async () => {
    const objectRuntime = createRuntime(recipe.file, { fetchImpl: async () => rejectedResponse() })
    await assert.rejects(vm.runInContext(recipe.call, objectRuntime.context), { message: recipe.fallback })

    const nullRuntime = createRuntime(recipe.file, { fetchImpl: async () => rejectedResponse(null) })
    await assert.rejects(vm.runInContext(recipe.call, nullRuntime.context), { message: recipe.fallback })

    const stringRuntime = createRuntime(recipe.file, {
      fetchImpl: async () => rejectedResponse("The field value is invalid.")
    })
    await assert.rejects(vm.runInContext(recipe.call, stringRuntime.context), {
      message: "The field value is invalid."
    })

    const rateRuntime = createRuntime(recipe.file, { fetchImpl: async () => rateLimitedResponse() })
    await assert.rejects(vm.runInContext(recipe.call, rateRuntime.context), /Too many requests/)

    const invalidRuntime = createRuntime(recipe.file, { fetchImpl: async () => invalidJsonResponse() })
    await assert.rejects(vm.runInContext(recipe.call, invalidRuntime.context), /invalid JSON/)
  })
}

test("Quick Start uses a safe string-message boundary", async () => {
  const script = codeFences(read("quick-start.md")).find((fence) => fence.includes("saveFavouriteColour"))
  const context = vm.createContext({
    Error,
    fetch: async () => rejectedResponse(),
    JSON,
    String,
    window: { FR_CUSTOM__CUSTOMER_FAVOURITE_COLOUR: requestConfig }
  })
  vm.runInContext(script, context, { filename: "quick-start.md" })

  await assert.rejects(vm.runInContext("saveFavouriteColour('green')", context), {
    message: "FieldsRaven rejected the request."
  })
})

test("Quick Start distinguishes rate limiting and invalid JSON", async () => {
  const script = codeFences(read("quick-start.md")).find((fence) => fence.includes("saveFavouriteColour"))
  const contextFor = (fetch) => {
    const context = vm.createContext({
      Error,
      fetch,
      JSON,
      String,
      window: { FR_CUSTOM__CUSTOMER_FAVOURITE_COLOUR: requestConfig }
    })
    vm.runInContext(script, context, { filename: "quick-start.md" })
    return context
  }

  await assert.rejects(
    vm.runInContext("saveFavouriteColour('green')", contextFor(async () => rateLimitedResponse())),
    /Too many requests/
  )
  await assert.rejects(
    vm.runInContext("saveFavouriteColour('green')", contextFor(async () => invalidJsonResponse())),
    { message: "Unexpected invalid JSON response." }
  )
})

for (const listCase of listCases) {
  test(`${listCase.name} serializes mutations and disables every mutating control`, async () => {
    const pending = []
    const runtime = createRuntime(listCase.file, {
      initialId: listCase.initialId,
      initialValue: listCase.initialValue,
      fetchImpl: () => new Promise((resolve) => pending.push(resolve))
    })

    const first = vm.runInContext(listCase.firstAction, runtime.context)
    await Promise.resolve()

    assert.equal(pending.length, 1)
    assert.equal(runtime.document.getElementById(listCase.regionId).getAttribute("aria-busy"), "true")
    assert.ok(mutatingButtons(runtime).every((button) => button.disabled), "all mutation controls should be disabled")

    const overlapping = vm.runInContext(listCase.overlappingAction, runtime.context)
    await Promise.resolve()

    assert.equal(pending.length, 1, "an overlapping full-value write must not start")

    pending[0](okResponse())
    await Promise.all([ first, overlapping ])

    assert.equal(runtime.document.getElementById(listCase.regionId).getAttribute("aria-busy"), "false")
    assert.equal(runtime.document.getElementById(listCase.submitId).disabled, false)
  })

  test(`${listCase.name} restores controls and state after a rejected mutation`, async () => {
    const runtime = createRuntime(listCase.file, {
      initialId: listCase.initialId,
      initialValue: listCase.initialValue,
      fetchImpl: async () => rejectedResponse()
    })
    const before = runtime.document.getElementById(listCase.listId).children.map(elementText)

    await vm.runInContext(listCase.firstAction, runtime.context)

    assert.deepEqual(runtime.document.getElementById(listCase.listId).children.map(elementText), before)
    assert.equal(runtime.document.getElementById(listCase.statusId).textContent, listCase.fallback)
    assert.equal(runtime.document.getElementById(listCase.regionId).getAttribute("aria-busy"), "false")
    assert.equal(runtime.document.getElementById(listCase.submitId).disabled, false)
    assert.ok(mutatingButtons(runtime).filter((button) => /^Remove/.test(elementText(button)))
      .every((button) => !button.disabled))
  })
}

function savedValue(request) {
  return JSON.parse(JSON.parse(request.options.body).raven.value)
}
