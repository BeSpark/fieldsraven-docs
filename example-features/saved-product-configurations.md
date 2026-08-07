---
description: Save, update, remove, and reopen customer product configurations from one JSON metafield.
---

# Saved product configurations

This recipe stores customer-named designs in `custom.saved_configurations`. Every entry has a stable id, name, product handle, and merchant-defined options object. Create a customer-owned JSON Raven and paste **Get Code** so the page defines `window.FR_CUSTOM__CUSTOMER_SAVED_CONFIGURATIONS`.

Read the [saved-product-configuration implementation story](https://fieldsraven.app/use-cases/saved-product-configurations) and [Quick Start](../quick-start.md) before adapting the code to a configurator.

## Complete direct recipe

The single `color` option is illustrative. Replace it with the fields your configurator owns.

```liquid
{% if customer %}
  {% assign saved_configurations_metafield = customer.metafields.custom.saved_configurations.value %}
  <script type="application/json" id="fr-configurations-initial">
    {% if saved_configurations_metafield != blank %}{{ saved_configurations_metafield | json }}{% else %}[]{% endif %}
  </script>

  <section id="fr-configuration-region" aria-labelledby="fr-configuration-list-heading" aria-busy="false">
    <h2 id="fr-configuration-list-heading">Saved configurations</h2>

    <form id="fr-configuration-form">
      <input id="fr-configuration-id" name="configuration_id" type="hidden">

      <label for="fr-configuration-name">Configuration name</label>
      <input id="fr-configuration-name" name="name" type="text" required>

      <label for="fr-configuration-product">Product handle</label>
      <input id="fr-configuration-product" name="product_handle" type="text" required>

      <label for="fr-configuration-color">Color option</label>
      <input id="fr-configuration-color" name="color" type="text" required>

      <button id="fr-configuration-submit" type="submit">Save configuration</button>
      <p id="fr-configuration-status" aria-live="polite"></p>
    </form>

    <p id="fr-configuration-empty">No configurations are saved yet.</p>
    <ul id="fr-configuration-list"></ul>
  </section>

  <script>
    const configurationForm = document.getElementById("fr-configuration-form")
    const configurationButton = document.getElementById("fr-configuration-submit")
    const configurationStatus = document.getElementById("fr-configuration-status")
    const configurationList = document.getElementById("fr-configuration-list")
    const configurationEmpty = document.getElementById("fr-configuration-empty")
    const configurationRegion = document.getElementById("fr-configuration-region")
    let configurations = JSON.parse(document.getElementById("fr-configurations-initial").textContent)
    let configurationSaving = false

    function renderConfigurations() {
      configurationList.replaceChildren()
      configurationEmpty.hidden = configurations.length > 0

      for (const configuration of configurations) {
        const row = document.createElement("li")
        const summary = document.createElement("span")
        const open = document.createElement("button")
        const edit = document.createElement("button")
        const remove = document.createElement("button")

        summary.textContent = `${configuration.name} — ${configuration.product_handle} — ${configuration.options.color}`
        open.type = "button"
        open.textContent = `Open ${configuration.name}`
        open.disabled = configurationSaving
        open.addEventListener("click", () => {
          window.dispatchEvent(new CustomEvent("fieldsraven:open-configuration", {
            detail: { configuration }
          }))
        })
        edit.type = "button"
        edit.textContent = `Edit ${configuration.name}`
        edit.disabled = configurationSaving
        edit.addEventListener("click", () => editConfiguration(configuration))
        remove.type = "button"
        remove.textContent = `Remove ${configuration.name}`
        remove.disabled = configurationSaving
        remove.addEventListener("click", () => removeConfiguration(configuration.id))
        row.append(summary, " ", open, " ", edit, " ", remove)
        configurationList.append(row)
      }
    }

    function setConfigurationBusy(busy) {
      configurationSaving = busy
      configurationRegion.setAttribute("aria-busy", String(busy))
      configurationButton.disabled = busy
      for (const button of configurationList.querySelectorAll("button")) button.disabled = busy
    }

    function editConfiguration(configuration) {
      configurationForm.elements.configuration_id.value = configuration.id
      configurationForm.elements.name.value = configuration.name
      configurationForm.elements.product_handle.value = configuration.product_handle
      configurationForm.elements.color.value = configuration.options.color
      configurationForm.elements.name.focus()
    }

    async function readConfigurationResponse(response) {
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

    async function saveConfigurations(nextConfigurations) {
      const config = window.FR_CUSTOM__CUSTOMER_SAVED_CONFIGURATIONS

      try {
        const response = await fetch("/apps/raven/create_metafield", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raven: {
            raven_id: config.ravenId,
            resource_id: config.resourceId,
            raven_mac: config.ravenMac,
            value: JSON.stringify(nextConfigurations)
          } })
        })

        if (response.status === 429) throw new Error("Too many requests. Wait a moment and try again.")
        const result = await readConfigurationResponse(response)
        if (!response.ok) {
          const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the configuration update."
          throw new Error(message)
        }
        return result
      } catch (error) {
        if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.")
        throw error
      }
    }

    async function persistConfigurations(nextConfigurations, successMessage) {
      if (configurationSaving) return false

      setConfigurationBusy(true)
      configurationStatus.textContent = "Saving…"

      try {
        await saveConfigurations(nextConfigurations)
        configurations = nextConfigurations
        renderConfigurations()
        configurationForm.reset()
        configurationStatus.textContent = successMessage
        return true
      } catch (error) {
        configurationStatus.textContent = error.message
        return false
      } finally {
        setConfigurationBusy(false)
      }
    }

    async function removeConfiguration(configurationId) {
      const nextConfigurations = configurations.filter((configuration) => configuration.id !== configurationId)
      await persistConfigurations(nextConfigurations, "Removed. FieldsRaven accepted and queued the configuration update.")
    }

    configurationForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      const formData = new FormData(configurationForm)
      const configurationId = formData.get("configuration_id") || crypto.randomUUID()
      const nextConfiguration = {
        id: configurationId,
        name: formData.get("name").trim(),
        product_handle: formData.get("product_handle").trim(),
        options: { color: formData.get("color").trim() }
      }
      const existingIndex = configurations.findIndex((configuration) => configuration.id === configurationId)
      const nextConfigurations = existingIndex >= 0
        ? configurations.map((configuration) => configuration.id === configurationId ? nextConfiguration : configuration)
        : [...configurations, nextConfiguration]

      await persistConfigurations(nextConfigurations, "Saved. FieldsRaven accepted and queued the configuration update.")
    })

    renderConfigurations()
  </script>
{% else %}
  <p><a href="/account/login">Log in</a> to save product configurations.</p>
{% endif %}
```

## Configurator ownership and concurrency

The `fieldsraven:open-configuration` event is a handoff point. The merchant's configurator owns the event listener, product UI, validation, and the logic that applies `event.detail.configuration.options`; FieldsRaven does not reopen or render the product.

Every save, update, or removal sends a copied full array and swaps local state only after acceptance. The recipe marks the configuration region busy and disables its action buttons while a request is in flight, preventing overlapping writes from the same page. Rejected requests leave the current array and DOM unchanged. Full-array writes are still last-write-wins across stale tabs, so decide how your theme handles that separate concurrency boundary.

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify or optional downstream processing has completed.

The Storefront Kit is optional. This complete direct request does not depend on it.
