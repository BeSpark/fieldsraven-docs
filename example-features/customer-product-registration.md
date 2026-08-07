---
description: Append validated product registrations to a customer-owned Shopify JSON metafield.
---

# Shopify product registration

This bare-bones recipe keeps a cumulative array of registrations in `custom.product_registrations`. Create a customer-owned Raven with type `json` and **metaobject sync disabled**, then paste its **Get Code** Liquid so the page defines `window.FR_CUSTOM__CUSTOMER_PRODUCT_REGISTRATIONS`.

The product handles, serials, and dates below are illustrative. See the [multi-region product-registration implementation story](https://fieldsraven.app/use-cases/shopify-product-registration) and [Quick Start](../quick-start.md) for the shared request contract.

## Complete direct recipe

```liquid
{% if customer %}
  {% assign saved_product_registrations = customer.metafields.custom.product_registrations.value %}
  <script type="application/json" id="fr-registrations-initial">
    {% if saved_product_registrations != blank %}{{ saved_product_registrations | json }}{% else %}[]{% endif %}
  </script>

  <form id="fr-registration-form">
    <fieldset>
      <legend>Register a product</legend>

      <label for="fr-registration-product">Product handle</label>
      <input id="fr-registration-product" name="product_handle" type="text" autocomplete="off" required>

      <label for="fr-registration-serial">Serial number</label>
      <input id="fr-registration-serial" name="serial" type="text" autocomplete="off" required>

      <label for="fr-registration-date">Purchase date</label>
      <input id="fr-registration-date" name="purchase_date" type="date" required>
    </fieldset>

    <button id="fr-registration-submit" type="submit">Register product</button>
    <p id="fr-registration-status" aria-live="polite"></p>
  </form>

  <section aria-labelledby="fr-registration-list-heading">
    <h2 id="fr-registration-list-heading">Registered products</h2>
    <p id="fr-registration-empty">No products are registered yet.</p>
    <ul id="fr-registration-list"></ul>
  </section>

  <script>
    const registrationForm = document.getElementById("fr-registration-form")
    const registrationButton = document.getElementById("fr-registration-submit")
    const registrationStatus = document.getElementById("fr-registration-status")
    const registrationList = document.getElementById("fr-registration-list")
    const registrationEmpty = document.getElementById("fr-registration-empty")
    let registrations = JSON.parse(document.getElementById("fr-registrations-initial").textContent)

    function renderRegistrations() {
      registrationList.replaceChildren()
      registrationEmpty.hidden = registrations.length > 0

      for (const registration of registrations) {
        const item = document.createElement("li")
        item.textContent = `${registration.product_handle} — ${registration.serial} — purchased ${registration.purchase_date}`
        registrationList.append(item)
      }
    }

    async function readRegistrationResponse(response) {
      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error("FieldsRaven returned a non-JSON response. Please try again.")
      }

      try {
        return await response.json()
      } catch (error) {
        throw new Error("FieldsRaven returned invalid JSON. Please try again.")
      }
    }

    async function saveRegistrations(nextRegistrations) {
      const config = window.FR_CUSTOM__CUSTOMER_PRODUCT_REGISTRATIONS

      try {
        const response = await fetch("/apps/raven/create_metafield", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raven: {
            raven_id: config.ravenId,
            resource_id: config.resourceId,
            raven_mac: config.ravenMac,
            value: JSON.stringify(nextRegistrations)
          } })
        })

        if (response.status === 429) throw new Error("Too many requests. Wait a moment and try again.")
        const result = await readRegistrationResponse(response)
        if (!response.ok) {
          const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the registration."
          throw new Error(message)
        }
        return result
      } catch (error) {
        if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.")
        throw error
      }
    }

    registrationForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      const formData = new FormData(registrationForm)
      const serial = formData.get("serial").trim()
      const productHandle = formData.get("product_handle").trim()
      const purchaseDate = formData.get("purchase_date")

      if (!productHandle || !serial || !purchaseDate) {
        registrationStatus.textContent = "Complete every field before submitting."
        return
      }
      if (registrations.some((registration) => registration.serial.toLowerCase() === serial.toLowerCase())) {
        registrationStatus.textContent = "That serial number is already registered."
        return
      }

      const nextRegistrations = [...registrations, {
        product_handle: productHandle,
        serial,
        purchase_date: purchaseDate,
        registered_at: new Date().toISOString()
      }]

      registrationButton.disabled = true
      registrationButton.setAttribute("aria-busy", "true")
      registrationStatus.textContent = "Saving…"

      try {
        await saveRegistrations(nextRegistrations)
        registrations = nextRegistrations
        renderRegistrations()
        registrationForm.reset()
        registrationStatus.textContent = "Saved. FieldsRaven accepted and queued the registration update."
      } catch (error) {
        registrationStatus.textContent = error.message
      } finally {
        registrationButton.disabled = false
        registrationButton.setAttribute("aria-busy", "false")
      }
    })

    renderRegistrations()
  </script>
{% else %}
  <p><a href="/account/login">Log in</a> to register a product.</p>
{% endif %}
```

## Data shape and metaobjects

The cumulative array is written back in full, so concurrent stale tabs are last-write-wins. The example prevents a duplicate serial in the current browser state, but a merchant with stronger uniqueness requirements should validate serials in a system designed for that rule.

Keep metaobject sync disabled for this cumulative-array Raven. If every registration must become a metaobject, use a separate event-shaped Raven that submits one registration object and map that object to a configured metaobject definition. Do not enable metaobject sync on the cumulative array.

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify or optional downstream processing has completed. The browser updates its local list only after acceptance.

The Storefront Kit is optional. This complete direct request does not depend on it.
