---
description: Save a customer's structured quiz answers to one Shopify JSON metafield.
---

# Shopify quiz profiles

Use this recipe to replace a customer's current quiz profile in `custom.quiz_profile`. The values below are illustrative; use questions and option values that match your storefront.

Create a customer-owned Raven with namespace `custom`, key `quiz_profile`, and type `json`. Then copy its Liquid configuration from **Get Code**. It defines `window.FR_CUSTOM__CUSTOMER_QUIZ_PROFILE` with the Raven id, signed customer id, and HMAC.

Read [FieldsRaven's quiz-profile implementation story](https://fieldsraven.app/use-cases/shopify-quiz-profiles) for the product boundary, or review [Quick Start](../quick-start.md) before adapting the request.

## Complete direct recipe

Paste the Raven's generated Liquid configuration immediately before this code.

```liquid
{% if customer %}
  {% assign saved_quiz_profile = customer.metafields.custom.quiz_profile.value %}
  <script type="application/json" id="fr-quiz-profile-initial">
    {% if saved_quiz_profile != blank %}{{ saved_quiz_profile | json }}{% else %}{}{% endif %}
  </script>

  <form id="fr-quiz-profile-form">
    <fieldset>
      <legend>Your profile</legend>

      <label for="fr-quiz-skin-type">Skin type</label>
      <select id="fr-quiz-skin-type" name="skin_type" required>
        <option value="">Choose one</option>
        <option value="dry">Dry</option>
        <option value="balanced">Balanced</option>
        <option value="oily">Oily</option>
      </select>

      <fieldset>
        <legend>Goals</legend>
        <label for="fr-quiz-goal-hydration">
          <input id="fr-quiz-goal-hydration" type="checkbox" name="goals" value="hydration">
          Hydration
        </label>
        <label for="fr-quiz-goal-texture">
          <input id="fr-quiz-goal-texture" type="checkbox" name="goals" value="texture">
          Smoother texture
        </label>
      </fieldset>
    </fieldset>

    <button id="fr-quiz-submit" type="submit">Save profile</button>
    <p id="fr-quiz-status" aria-live="polite"></p>
  </form>

  <section aria-labelledby="fr-quiz-current-heading">
    <h2 id="fr-quiz-current-heading">Current saved profile</h2>
    <p id="fr-quiz-current"></p>
  </section>

  <script>
    const quizProfileForm = document.getElementById("fr-quiz-profile-form")
    const quizProfileButton = document.getElementById("fr-quiz-submit")
    const quizProfileStatus = document.getElementById("fr-quiz-status")
    const quizProfileOutput = document.getElementById("fr-quiz-current")
    let currentProfile = JSON.parse(document.getElementById("fr-quiz-profile-initial").textContent)

    function renderQuizProfile() {
      const goals = Array.isArray(currentProfile.goals) ? currentProfile.goals.join(", ") : "none yet"
      quizProfileOutput.textContent = currentProfile.skin_type
        ? `Skin type: ${currentProfile.skin_type}; goals: ${goals}.`
        : "No quiz profile has been saved yet."
    }

    async function readQuizResponse(response) {
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

    async function saveQuizProfile(profilePayload) {
      const config = window.FR_CUSTOM__CUSTOMER_QUIZ_PROFILE

      try {
        const response = await fetch("/apps/raven/create_metafield", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raven: {
            raven_id: config.ravenId,
            resource_id: config.resourceId,
            raven_mac: config.ravenMac,
            value: JSON.stringify(profilePayload)
          } })
        })

        if (response.status === 429) throw new Error("Too many requests. Wait a moment and try again.")
        const result = await readQuizResponse(response)
        if (!response.ok) {
          const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the profile."
          throw new Error(message)
        }
        return result
      } catch (error) {
        if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.")
        throw error
      }
    }

    quizProfileForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      quizProfileButton.disabled = true
      quizProfileButton.setAttribute("aria-busy", "true")
      quizProfileStatus.textContent = "Saving…"

      const formData = new FormData(quizProfileForm)
      const profilePayload = {
        skin_type: formData.get("skin_type"),
        goals: formData.getAll("goals")
      }

      try {
        await saveQuizProfile(profilePayload)
        currentProfile = profilePayload
        renderQuizProfile()
        quizProfileStatus.textContent = "Saved. FieldsRaven accepted and queued the profile update."
      } catch (error) {
        quizProfileStatus.textContent = error.message
      } finally {
        quizProfileButton.disabled = false
        quizProfileButton.setAttribute("aria-busy", "false")
      }
    })

    renderQuizProfile()
  </script>
{% else %}
  <p><a href="/account/login">Log in</a> to save your quiz profile.</p>
{% endif %}
```

## Behavior and boundaries

This recipe stores one JSON object. Each accepted save replaces the previous object, so it is a last-write-wins profile rather than an event history. If the merchant needs answer history, model each submission as a separate event instead of expanding this profile indefinitely.

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify or an optional downstream integration has completed. The merchant theme owns the questions, validation, and presentation; FieldsRaven owns request validation and queueing.

The Storefront Kit is optional. This complete direct request does not depend on it.
