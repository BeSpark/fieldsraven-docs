---
description: Add and remove Shopify products in a customer-owned wishlist metafield.
---

# Shopify customer wishlist

This recipe stores an array of objects in `custom.wishlist`; each object contains a stable `product_handle`. Create a customer-owned Raven with type `json`, then paste the **Get Code** Liquid that defines `window.FR_CUSTOM__CUSTOMER_WISHLIST`.

See the [customer-wishlist implementation story](https://fieldsraven.app/use-cases/shopify-customer-wishlist) and [Quick Start](../quick-start.md) before adapting the request.

## Complete direct recipe

The form works on a product template, where `product.handle` is available. Both the server-rendered and enhanced lists link directly to Shopify's canonical `/products/<handle>` route, so the recipe does not depend on Liquid's 20-handle `all_products` lookup limit.

```liquid
{% if customer %}
  {% assign saved_wishlist = customer.metafields.custom.wishlist.value %}
  <script type="application/json" id="fr-wishlist-initial">
    {% if saved_wishlist != blank %}{{ saved_wishlist | json }}{% else %}[]{% endif %}
  </script>

  <section id="fr-wishlist-region" aria-labelledby="fr-wishlist-heading" aria-busy="false">
    <h2 id="fr-wishlist-heading">Saved products</h2>

    <form id="fr-wishlist-form">
      <label for="fr-wishlist-handle">Product handle</label>
      <input id="fr-wishlist-handle" name="product_handle" type="text" value="{{ product.handle | escape }}" required>
      <button id="fr-wishlist-submit" type="submit">Add to wishlist</button>
      <p id="fr-wishlist-status" aria-live="polite"></p>
    </form>

    <p id="fr-wishlist-empty"{% if saved_wishlist != blank %} hidden{% endif %}>Your wishlist is empty.</p>
    <ul id="fr-wishlist-list">
      {% if saved_wishlist != blank %}
        {% for saved_item in saved_wishlist %}
          <li data-product-handle="{{ saved_item.product_handle | escape }}">
            <a href="/products/{{ saved_item.product_handle | url_encode }}">{{ saved_item.product_handle | escape }}</a>
          </li>
        {% endfor %}
      {% endif %}
    </ul>
  </section>

  <script>
    const wishlistForm = document.getElementById("fr-wishlist-form")
    const wishlistButton = document.getElementById("fr-wishlist-submit")
    const wishlistStatus = document.getElementById("fr-wishlist-status")
    const wishlistList = document.getElementById("fr-wishlist-list")
    const wishlistEmpty = document.getElementById("fr-wishlist-empty")
    const wishlistRegion = document.getElementById("fr-wishlist-region")
    let wishlist = JSON.parse(document.getElementById("fr-wishlist-initial").textContent)
    let wishlistSaving = false

    function renderWishlist() {
      wishlistList.replaceChildren()
      wishlistEmpty.hidden = wishlist.length > 0

      for (const item of wishlist) {
        const row = document.createElement("li")
        const link = document.createElement("a")
        const remove = document.createElement("button")
        link.href = `/products/${encodeURIComponent(item.product_handle)}`
        link.textContent = item.product_handle
        remove.type = "button"
        remove.textContent = `Remove ${item.product_handle}`
        remove.disabled = wishlistSaving
        remove.addEventListener("click", () => removeWishlistItem(item.product_handle))
        row.append(link, " ", remove)
        wishlistList.append(row)
      }
    }

    function setWishlistBusy(busy) {
      wishlistSaving = busy
      wishlistRegion.setAttribute("aria-busy", String(busy))
      wishlistButton.disabled = busy
      for (const button of wishlistList.querySelectorAll("button")) button.disabled = busy
    }

    async function readWishlistResponse(response) {
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

    async function saveWishlist(nextWishlist) {
      const config = window.FR_CUSTOM__CUSTOMER_WISHLIST

      try {
        const response = await fetch("/apps/raven/create_metafield", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raven: {
            raven_id: config.ravenId,
            resource_id: config.resourceId,
            raven_mac: config.ravenMac,
            value: JSON.stringify(nextWishlist)
          } })
        })

        if (response.status === 429) throw new Error("Too many requests. Wait a moment and try again.")
        const result = await readWishlistResponse(response)
        if (!response.ok) {
          const message = typeof result?.message === "string" ? result.message : "FieldsRaven rejected the wishlist update."
          throw new Error(message)
        }
        return result
      } catch (error) {
        if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.")
        throw error
      }
    }

    async function persistWishlist(nextWishlist, successMessage) {
      if (wishlistSaving) return false

      setWishlistBusy(true)
      wishlistStatus.textContent = "Saving…"

      try {
        await saveWishlist(nextWishlist)
        wishlist = nextWishlist
        renderWishlist()
        wishlistStatus.textContent = successMessage
        return true
      } catch (error) {
        wishlistStatus.textContent = error.message
        return false
      } finally {
        setWishlistBusy(false)
      }
    }

    async function removeWishlistItem(productHandle) {
      const nextWishlist = wishlist.filter((item) => item.product_handle !== productHandle)
      await persistWishlist(nextWishlist, "Removed. FieldsRaven accepted and queued the wishlist update.")
    }

    wishlistForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      const productHandle = new FormData(wishlistForm).get("product_handle").trim()
      if (!productHandle) return

      if (wishlist.some((item) => item.product_handle === productHandle)) {
        wishlistStatus.textContent = "That product is already in your wishlist."
        return
      }

      const nextWishlist = [...wishlist, { product_handle: productHandle }]
      await persistWishlist(nextWishlist, "Added. FieldsRaven accepted and queued the wishlist update.")
    })

    renderWishlist()
  </script>
{% else %}
  <p><a href="/account/login">Log in</a> to use your wishlist.</p>
{% endif %}
```

## Replacement and rendering behavior

Each add or remove sends the complete next array. While that request is in flight, the recipe marks the wishlist region busy and disables every mutation control so a second action cannot submit stale local state. Duplicate handles are ignored, and the in-memory array and DOM change only after FieldsRaven accepts the request. A rejected, non-JSON, rate-limited, or network response leaves the current list untouched and restores the control state.

The server-rendered Liquid list is based on the metafield value that existed when Shopify rendered the page. After an accepted save, that Liquid is stale until the shopper navigates or reloads; the JavaScript rendering rebuilds the same encoded product destinations for the immediate local view. Both paths treat stored handles as text rather than HTML. Full-array updates are last-write-wins, so two stale tabs can overwrite each other.

A successful 200 response means FieldsRaven accepted and queued the metafield write. It does not prove that Shopify or optional downstream processing has completed.

The Storefront Kit is optional. This complete direct request does not depend on it.
