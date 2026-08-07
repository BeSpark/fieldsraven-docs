---
description: Send a plain string value.
---

# Create a single\_line\_text\_field metafield

The metafield's type comes from the raven, not from the request. Sending a value that does not match that type is rejected with **422**.

## Before you start

Paste the raven's **Get Code** output into your theme first — that Liquid computes the
signature and defines `window.FR_<RESOURCE>_<KEY>`. See [Quick Start](../quick-start.md).
The snippets below assume it is present, and use `cfg` for it.

## Sending a value

`value` is the string itself.

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
submit('Hello Raven!');
```
