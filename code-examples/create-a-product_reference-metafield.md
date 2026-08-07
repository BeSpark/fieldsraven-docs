---
description: Point a metafield at a product — send the numeric id, not a gid.
---

# Create a product\_reference metafield

{% hint style="warning" %}
**Send the plain numeric product id, not a `gid://` string.** FieldsRaven builds
`gid://shopify/Product/<id>` itself before writing to Shopify. Passing a full gid produces a
doubled identifier and the write fails.
{% endhint %}

## Before you start

Paste the raven's **Get Code** output into your theme first — that Liquid computes the
signature and defines `window.FR_<RESOURCE>_<KEY>`. See [Quick Start](../quick-start.md).
The snippets below assume it is present, and use `cfg` for it.

## Sending a value

```javascript
async function submit(value) {
  var cfg = window.FR_CUSTOMER_MY_KEY;              // from the Get Code panel

  var res = await fetch('/apps/raven/create_metafield', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raven: {
        raven_id:   cfg.ravenId,
        resource_id: cfg.resourceId,
        raven_mac:  cfg.ravenMac,
        value:      value
      }
    })
  });

  if (res.status === 429) return console.warn('Busy — retry shortly.');
  var data = await res.json().catch(function () { return {}; });
  if (!res.ok) return console.error(data.message || 'Rejected.');
  console.log(data.message);            // "Sit tight the raven is on it!"
}
```

```javascript
submit('{{ product.id }}');      // e.g. "7418351251511"
```
