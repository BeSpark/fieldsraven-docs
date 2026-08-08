---
description: Save customer marketing preferences to Shopify and optionally map them to Klaviyo profile properties.
---

# Shopify Klaviyo preference sync

This recipe saves a current preference object to `custom.marketing_preferences`. When Klaviyo sync is enabled on the Raven, FieldsRaven can map the object's keys to custom Klaviyo profile properties after the Shopify write is accepted.

Create a customer-owned Raven with namespace `custom`, key `marketing_preferences`, and type `json`. Copy its Liquid configuration from **Get Code** so the page defines `window.FR_CUSTOM__CUSTOMER_MARKETING_PREFERENCES`. Configure the Klaviyo mapping in FieldsRaven only after the Shopify shape is working.

See the [Shopify-to-Klaviyo implementation story](https://fieldsraven.app/use-cases/shopify-klaviyo-sync) and [Quick Start](../quick-start.md) for the request contract.

{% hint style="warning" %}
**Read [Klaviyo](../klaviyo.md) before enabling the mapping.** Several conditions make a
sync silently not happen — the customer's Klaviyo profile must already exist and match by
email, the submission must resolve a customer email, and a Raven with *needs approval* on
does not sync until the submission is approved. None of them surface on the storefront.
{% endhint %}

## Complete direct recipe

The example preference names are illustrative. Match them to the consent and preference model approved for your store.

```liquid
{% if customer %}
  {% assign saved_marketing_preferences = customer.metafields.custom.marketing_preferences.value %}
  <script type="application/json" id="fr-preferences-initial">
    {% if saved_marketing_preferences != blank %}{{ saved_marketing_preferences | json }}{% else %}{}{% endif %}
  </script>

  <form id="fr-preferences-form">
    <fieldset>
      <legend>Marketing preferences</legend>

      <label for="fr-preferences-frequency">Email frequency</label>
      <select id="fr-preferences-frequency" name="email_frequency" required>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="product-launches">Product launches only</option>
      </select>

      <fieldset>
        <legend>Topics</legend>
        <label for="fr-preferences-topic-guides">
          <input id="fr-preferences-topic-guides" type="checkbox" name="topic_guides" value="true">
          Guides
        </label>
        <label for="fr-preferences-topic-new-products">
          <input id="fr-preferences-topic-new-products" type="checkbox" name="topic_new_products" value="true">
          New products
        </label>
      </fieldset>
    </fieldset>

    <button id="fr-preferences-submit" type="submit">Save preferences</button>
    <p id="fr-preferences-status" aria-live="polite"></p>
  </form>

  <section aria-labelledby="fr-preferences-current-heading">
    <h2 id="fr-preferences-current-heading">Current preferences</h2>
    <p id="fr-preferences-current"></p>
  </section>

  <script>
    const preferencesForm = document.getElementById("fr-preferences-form")
    const preferencesButton = document.getElementById("fr-preferences-submit")
    const preferencesStatus = document.getElementById("fr-preferences-status")
    const preferencesOutput = document.getElementById("fr-preferences-current")
    let savedPreferences = JSON.parse(document.getElementById("fr-preferences-initial").textContent)

    function renderPreferences() {
      const topics = []
      if (savedPreferences.topic_guides) topics.push("guides")
      if (savedPreferences.topic_new_products) topics.push("new products")
      preferencesOutput.textContent = savedPreferences.email_frequency
        ? `Email frequency: ${savedPreferences.email_frequency}; topics: ${topics.join(", ") || "none"}.`
        : "No marketing preferences have been saved yet."
    }

    async function readPreferencesResponse(response) {
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

    async function saveMarketingPreferences(preferencesPayload) {
      const config = window.FR_CUSTOM__CUSTOMER_MARKETING_PREFERENCES

      try {
        const response = await fetch("/apps/raven/create_metafield", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raven: {
            raven_id: config.ravenId,
            resource_id: config.resourceId,
            raven_mac: config.ravenMac,
            value: JSON.stringify(preferencesPayload)
          } })
        })

        if (response.status === 429) throw new Error("Too many requests. Wait a moment and try again.")
        const result = await readPreferencesResponse(response)
        if (!response.ok) {
          const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the preferences."
          throw new Error(message)
        }
        return result
      } catch (error) {
        if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.")
        throw error
      }
    }

    preferencesForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      preferencesButton.disabled = true
      preferencesButton.setAttribute("aria-busy", "true")
      preferencesStatus.textContent = "Saving…"

      const formData = new FormData(preferencesForm)
      const preferencesPayload = {
        email_frequency: formData.get("email_frequency"),
        topic_guides: formData.get("topic_guides") === "true",
        topic_new_products: formData.get("topic_new_products") === "true"
      }

      try {
        await saveMarketingPreferences(preferencesPayload)
        savedPreferences = preferencesPayload
        renderPreferences()
        preferencesStatus.textContent = "Saved. FieldsRaven accepted and queued the preference update."
      } catch (error) {
        preferencesStatus.textContent = error.message
      } finally {
        preferencesButton.disabled = false
        preferencesButton.setAttribute("aria-busy", "false")
      }
    })

    renderPreferences()
  </script>
{% else %}
  <p><a href="/account/login">Log in</a> to manage your marketing preferences.</p>
{% endif %}
```

## Shopify and Klaviyo boundaries

The JSON object is the Shopify source shape. If Klaviyo sync is enabled, configure FieldsRaven so scalar keys such as `email_frequency`, `topic_guides`, and `topic_new_products` become the intended custom profile properties. FieldsRaven preserves those scalar names; arrays would instead be flattened into numbered properties such as `topics_1` and `topics_2`, which makes them a poor fit for stable preference flags. Changing these keys later also changes the mapping contract.

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify or Klaviyo synchronization has completed. Do not show a “synced to Klaviyo” confirmation from this response alone. The merchant owns consent language and the storefront UI; FieldsRaven owns request validation, queueing, and the configured optional integration.

The Storefront Kit is optional. This complete direct request does not depend on it.
