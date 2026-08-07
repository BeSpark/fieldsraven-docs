---
description: Send several metafields in one request, all-or-nothing.
---

# Create multiple metafields (aka flock)

One request, several metafields. Each entry is signed independently, exactly as a single
submission is.

{% hint style="warning" %}
**A flock is all-or-nothing.** The entries are saved inside a database transaction — if any
one is rejected, none of them are recorded and the whole request returns **422** with that
entry's error. Do not treat a failed flock as "some got through".
{% endhint %}

## Before you start

Paste each raven's **Get Code** output into your theme — every entry needs its own
`raven_id`, `resource_id` and `raven_mac`, and each raven signs with its own id. See
[Quick Start](../quick-start.md).

## Sending a flock

```javascript
async function submitFlock() {
  var colour = window.FR_CUSTOMER_FAVOURITE_COLOUR;   // from the Get Code panel
  var size   = window.FR_CUSTOMER_SHIRT_SIZE;
  var score  = window.FR_CUSTOMER_LOYALTY_SCORE;

  var entry = function (cfg, value) {
    return { raven_id: cfg.ravenId, resource_id: cfg.resourceId, raven_mac: cfg.ravenMac, value: value };
  };

  var res = await fetch('/apps/raven/create_multiple_metafields', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      flock: [
        entry(colour, 'blue'),
        entry(size,   'M'),
        entry(score,  42)
      ]
    })
  });

  if (res.status === 429) return console.warn('Busy — retry shortly.');
  var data = await res.json().catch(function () { return {}; });
  if (!res.ok) return console.error(data.message || 'Flock rejected.');
  console.log(data.message);            // "Sit tight the raven is on it!"
}
```

Each entry's `value` follows the rules for its own raven's type — a string for
`single_line_text_field`, an object for `json`, a numeric id for `product_reference`, and
so on. Mixed types in one flock are fine.
