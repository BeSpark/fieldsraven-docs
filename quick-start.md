---
description: Create a Raven, paste its signed storefront configuration, and send a direct app-proxy request.
---

# Quick Start

FieldsRaven lets a Shopify theme submit a value to a configured metafield through an app proxy. A Raven defines the owner resource, namespace, key, type, and any optional integration.

{% hint style="danger" %}
Only let a logged-in customer submit a customer-owned Raven. The signed resource id identifies that customer, but your theme still needs the login boundary and appropriate storefront UI.
{% endhint %}

## 1. Create a Raven

In the app, create a Raven for the metafield you want to write. For a first request, a customer-owned `custom.favourite_colour` Raven with type `single_line_text_field` is easy to inspect in Shopify Admin.

## 2. Paste Get Code

Open the Raven's **Get Code** panel and paste its Liquid tab into the theme. The generated code uses the Raven's real id and the correct Liquid resource. It computes the HMAC inline at render time and exposes the signed values to JavaScript.

A representative generated block looks like this:

```liquid
{% if customer %}
  {%- liquid
    assign fr_resource_id = customer.id
    assign fr_digest = "generated-raven-id" | append: fr_resource_id
    assign fr_mac = fr_digest | hmac_sha256: shop.metafields.fields_raven.api_secret
  -%}
  <script>
    window.FR_CUSTOM__CUSTOMER_FAVOURITE_COLOUR = {
      ravenId: "generated-raven-id",
      resourceId: "{{ fr_resource_id }}",
      ravenMac: "{{ fr_mac }}"
    }
  </script>
{% endif %}
```

Do not copy the representative id. Paste the block generated for your Raven. If its owner, namespace, or key changes, copy the refreshed configuration again.

## 3. Send the direct request

The current endpoint is `PUT /apps/raven/create_metafield`. The request body is wrapped in a `raven` object.

The app-proxy value parameter is always a string (`value`). Send scalar values as strings. For a JSON object or array, serialize the local payload with `JSON.stringify` at the request boundary.

### Scalar value

```javascript
async function saveFavouriteColour(colour) {
  const config = window.FR_CUSTOM__CUSTOMER_FAVOURITE_COLOUR
  const response = await fetch("/apps/raven/create_metafield", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raven: {
      raven_id: config.ravenId,
      resource_id: config.resourceId,
      raven_mac: config.ravenMac,
      value: String(colour)
    } })
  })

  const contentType = response.headers.get("content-type") || ""
  if (response.status === 429) throw new Error("Too many requests. Try again shortly.")
  if (!contentType.includes("application/json")) throw new Error("Unexpected non-JSON response.")

  let result
  try {
    result = await response.json()
  } catch (error) {
    throw new Error("Unexpected invalid JSON response.")
  }
  if (!response.ok) {
    const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the request."
    throw new Error(message)
  }
  return result
}
```

### JSON object or array

```javascript
const payload = {
  skin_type: "balanced",
  goals: ["hydration", "texture"]
}

const config = window.FR_CUSTOM__CUSTOMER_QUIZ_PROFILE
const response = await fetch("/apps/raven/create_metafield", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ raven: {
    raven_id: config.ravenId,
    resource_id: config.resourceId,
    raven_mac: config.ravenMac,
    value: JSON.stringify(payload)
  } })
})
```

## Request fields

| Name | Type | Description |
| --- | --- | --- |
| `raven_id` | string | The Raven id from Get Code. |
| `resource_id` | string | The owner id, byte-identical to the value signed by Liquid. |
| `raven_mac` | string | The HMAC generated for that Raven and resource id. |
| `value` | string | A scalar string or a serialized JSON object/array. |

## What a response means

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify, Klaviyo, a metaobject, or another optional integration has completed. Update local UI only after acceptance, and avoid claiming downstream completion from the app-proxy response.

A 422 response means the request was rejected. Show its message safely with `textContent`. Treat 429 as retryable, guard non-JSON responses, and restore disabled controls in a `finally` block after network failures.

## Optional storefront helper

Storefront Kit is optional. The complete direct requests above are the canonical starting point and work without an app embed. If a merchant already loads the helper, it can reduce repeated client code, but the endpoint boundary and acceptance semantics stay the same.

## Build a feature

Continue with the [Example features](example-features/README.md) for complete, customer-guarded recipes that read existing Liquid values and handle accepted, rejected, rate-limited, non-JSON, and network responses.
