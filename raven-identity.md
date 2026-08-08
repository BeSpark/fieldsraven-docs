---
description: What identifies a raven, why two ravens can share a key, and how that shapes the code FieldsRaven generates.
---

# Raven identity

A raven is identified by **four things together**:

| Part            | Example                                    |
| --------------- | ------------------------------------------ |
| Shop            | your store                                 |
| Resource        | `customer`                                 |
| Namespace       | `fields_raven`                             |
| Key             | `favourite_colour`                         |

All four form the identity. The database enforces it — you cannot create two ravens on one shop with the same resource, namespace and key.

## Identity is fixed after creation

After you create a raven, its **resource, namespace, key and value type cannot be changed**. This prevents an edit from silently pointing existing storefront code and Shopify definitions at a different metafield contract.

If any of those four values needs to change, create a new raven with the new identity, replace the storefront code with the new raven's **Get Code** output, and retire the old raven only after the replacement is live. Settings such as active state, approval, integrations and metaobject options remain editable.

## Two ravens can share a key

This is the part that surprises people. A key on its own does **not** identify a raven, because a Shopify metafield is identified by its owner resource as well as its namespace and key.

So these are two legitimately different ravens:

* `customer` · `fields_raven` · `size`
* `product` · `fields_raven` · `size`

A customer's shirt size and a product's size are unrelated metafields that happen to share a key. FieldsRaven allows it because Shopify allows it — a narrower rule would forbid a state Shopify itself considers valid.

The same applies across namespaces: `custom` · `size` and `fields_raven` · `size` on the same resource are also distinct.

### Why it matters in your theme

Because identity is four-part, the code the **Get Code** panel generates derives its identifiers from resource, namespace and key together — never the key alone:

```
form id      fr-customer-favourite_colour
JS global    FR_CUSTOMER_FAVOURITE_COLOUR
```

A non-default namespace adds a segment: `fr-<namespace>--<resource>-<key>`.

If you hand-write identifiers from the key alone and put two forms on one page, they collide. `getElementById` returns the first match, and **the second form silently never binds** — no error, no console warning, it just does nothing. Generating both snippets from the panel avoids this.

## The slug is the public id

`raven_id` in your storefront code is the raven's **slug** — a short random string, not the key.

Three things to know:

* **It's assigned once, at creation, and never changes.** Editing mutable settings such as active state, approval or integrations leaves the slug alone, so storefront code you've already shipped keeps working.
* **You can't set or edit it.** It isn't editable in the app, by design — a slug that could change would silently break every snippet already deployed.
* **It's unique per shop, not globally.** A slug from your dev store will not resolve in production. Copying a snippet between stores requires re-copying the code from the raven in *that* store — this is the usual cause of `Raven ID is missing or raven can't be found`.

## Field rules

**Resource** must be one of: `article`, `blog`, `collection`, `customer`, `page`, `product`, `variant`, `shop`.

**Namespace** is required. `fields_raven` is the default, and the one the generated identifiers treat as unmarked.

**Key** must be at least 3 characters.

**Value types** are `single_line_text_field`, `multi_line_text_field`, `number_integer`,
`number_decimal`, `json`, `product_reference`, `list.product_reference` and
`metaobject_reference`.

{% hint style="warning" %}
**Reference types take a plain numeric id, never a `gid://` string** — FieldsRaven builds the
gid itself. `product_reference` catches a mistake here at validation and returns **422**, but
`metaobject_reference` is **not validated locally**: a full gid is accepted, doubled into
`gid://shopify/Metaobject/gid://…`, rejected by Shopify, and the submission lands as
`failed`. Send the bare numeric id.
{% endhint %}

### Spaces become underscores

Both key and namespace are normalized before they're saved: **every space becomes an underscore**.

That means `favourite colour` and `favourite_colour` are the *same* key. If a raven already exists with `favourite_colour`, trying to create `favourite colour` on the same resource and namespace is a duplicate, and the app will tell you so rather than creating a second raven you'd never be able to tell apart.

Worth knowing when a key you're sure is new gets rejected.
