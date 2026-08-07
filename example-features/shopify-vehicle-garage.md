---
description: Add, select, and remove customer vehicles in one Shopify JSON metafield.
---

# Shopify vehicle garage

This recipe stores one object in `custom.vehicle_garage`: a `vehicles` array plus `selected_vehicle_id`. Create a customer-owned Raven with type `json`, then paste **Get Code** so the page defines `window.FR_CUSTOM__CUSTOMER_VEHICLE_GARAGE`.

The sample vehicle details are illustrative. Read the [vehicle-garage implementation story](https://fieldsraven.app/use-cases/shopify-vehicle-garage) and [Quick Start](../quick-start.md) for the shared request boundary.

## Complete direct recipe

```liquid
{% if customer %}
  {% assign saved_vehicle_garage = customer.metafields.custom.vehicle_garage.value %}
  <script type="application/json" id="fr-garage-initial">
    {% if saved_vehicle_garage != blank %}{{ saved_vehicle_garage | json }}{% else %}{"vehicles":[],"selected_vehicle_id":null}{% endif %}
  </script>

  <section id="fr-garage-region" aria-labelledby="fr-garage-list-heading" aria-busy="false">
    <h2 id="fr-garage-list-heading">Your garage</h2>

    <form id="fr-garage-form">
      <fieldset>
        <legend>Add a vehicle</legend>

        <label for="fr-garage-year">Year</label>
        <input id="fr-garage-year" name="year" type="number" inputmode="numeric" min="1900" max="2100" required>

        <label for="fr-garage-make">Make</label>
        <input id="fr-garage-make" name="make" type="text" autocomplete="off" required>

        <label for="fr-garage-model">Model</label>
        <input id="fr-garage-model" name="model" type="text" autocomplete="off" required>
      </fieldset>

      <button id="fr-garage-submit" type="submit">Add vehicle</button>
      <p id="fr-garage-status" aria-live="polite"></p>
    </form>

    <p id="fr-garage-empty">No vehicles are saved yet.</p>
    <ul id="fr-garage-list"></ul>
  </section>

  <script>
    const garageForm = document.getElementById("fr-garage-form")
    const garageButton = document.getElementById("fr-garage-submit")
    const garageStatus = document.getElementById("fr-garage-status")
    const garageList = document.getElementById("fr-garage-list")
    const garageEmpty = document.getElementById("fr-garage-empty")
    const garageRegion = document.getElementById("fr-garage-region")
    let garage = JSON.parse(document.getElementById("fr-garage-initial").textContent)
    let garageSaving = false

    function renderGarage() {
      garageList.replaceChildren()
      garageEmpty.hidden = garage.vehicles.length > 0

      for (const vehicle of garage.vehicles) {
        const row = document.createElement("li")
        const summary = document.createElement("span")
        const select = document.createElement("button")
        const remove = document.createElement("button")
        const selected = garage.selected_vehicle_id === vehicle.id

        summary.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}${selected ? " — selected" : ""}`
        select.type = "button"
        select.textContent = selected ? `${vehicle.make} ${vehicle.model} is selected` : `Select ${vehicle.make} ${vehicle.model}`
        select.disabled = selected || garageSaving
        select.addEventListener("click", () => selectVehicle(vehicle.id))
        remove.type = "button"
        remove.textContent = `Remove ${vehicle.make} ${vehicle.model}`
        remove.disabled = garageSaving
        remove.addEventListener("click", () => removeVehicle(vehicle.id))
        row.append(summary, " ", select, " ", remove)
        garageList.append(row)
      }
    }

    function setGarageBusy(busy) {
      garageSaving = busy
      garageRegion.setAttribute("aria-busy", String(busy))
      garageButton.disabled = busy
      renderGarage()
    }

    async function readGarageResponse(response) {
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

    async function saveGarage(nextGarage) {
      const config = window.FR_CUSTOM__CUSTOMER_VEHICLE_GARAGE

      try {
        const response = await fetch("/apps/raven/create_metafield", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raven: {
            raven_id: config.ravenId,
            resource_id: config.resourceId,
            raven_mac: config.ravenMac,
            value: JSON.stringify(nextGarage)
          } })
        })

        if (response.status === 429) throw new Error("Too many requests. Wait a moment and try again.")
        const result = await readGarageResponse(response)
        if (!response.ok) {
          const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the garage update."
          throw new Error(message)
        }
        return result
      } catch (error) {
        if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.")
        throw error
      }
    }

    async function persistGarage(nextGarage, successMessage) {
      if (garageSaving) return false

      setGarageBusy(true)
      garageStatus.textContent = "Saving…"

      try {
        await saveGarage(nextGarage)
        garage = nextGarage
        renderGarage()
        garageStatus.textContent = successMessage
        return true
      } catch (error) {
        garageStatus.textContent = error.message
        return false
      } finally {
        setGarageBusy(false)
      }
    }

    async function selectVehicle(vehicleId) {
      const nextGarage = { ...garage, selected_vehicle_id: vehicleId }
      await persistGarage(nextGarage, "Selected. FieldsRaven accepted and queued the garage update.")
    }

    async function removeVehicle(vehicleId) {
      const nextVehicles = garage.vehicles.filter((vehicle) => vehicle.id !== vehicleId)
      const nextGarage = {
        vehicles: nextVehicles,
        selected_vehicle_id: garage.selected_vehicle_id === vehicleId ? null : garage.selected_vehicle_id
      }
      await persistGarage(nextGarage, "Removed. FieldsRaven accepted and queued the garage update.")
    }

    garageForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      const formData = new FormData(garageForm)
      const vehicle = {
        id: crypto.randomUUID(),
        year: Number(formData.get("year")),
        make: formData.get("make").trim(),
        model: formData.get("model").trim()
      }
      const nextGarage = {
        vehicles: [...garage.vehicles, vehicle],
        selected_vehicle_id: garage.selected_vehicle_id || vehicle.id
      }

      await persistGarage(nextGarage, "Added. FieldsRaven accepted and queued the garage update.")
      if (garage === nextGarage) garageForm.reset()
    })

    renderGarage()
  </script>
{% else %}
  <p><a href="/account/login">Log in</a> to manage your garage.</p>
{% endif %}
```

## Fitment and replacement behavior

FieldsRaven stores and queues the object. Compatibility rules, fitment data, and product filtering belong to the merchant theme or its fitment service. The selected id lives in the same object, so selection persists with the vehicle list.

Every action sends a copied next object and changes local state only after acceptance. The recipe marks the garage region busy and disables add, select, and remove controls while persistence is in flight, so same-page actions cannot race. Rejected requests leave the current garage and DOM untouched. Full-object writes remain last-write-wins across stale tabs.

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify or optional downstream processing has completed.

The Storefront Kit is optional. This complete direct request does not depend on it.
