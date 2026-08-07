---
description: Send a structured object as a single JSON metafield.
---

# Create a json metafield

## Before you start

Paste the raven's **Get Code** output into your theme first — that Liquid computes the
signature and defines `window.FR_<RESOURCE>_<KEY>`. See [Quick Start](../quick-start.md).
The snippets below assume it is present, and use `cfg` for it.

## Sending a value

`value` is the object. Send it as JSON — not as a pre-stringified string.

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
submit({ colour: 'blue', size: 'M', updatedAt: Date.now() });
```

A JSON raven is also the only type that can mirror submissions into a Shopify metaobject — see [Metaobject sync](../metaobject-sync.md).
