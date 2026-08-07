---
description: Remove a metafield's value from Shopify.
---

# Delete a metafield

`DELETE /apps/raven/delete_metafield`, taking `raven_id` and `resource_id`.

{% hint style="info" %}
This clears the metafield on the resource. It does **not** remove the metafield *definition*
you created in Shopify admin.
{% endhint %}

## Sending the request

```javascript
async function remove() {
  var cfg = window.FR_CUSTOMER_MY_KEY;              // from the Get Code panel

  var res = await fetch('/apps/raven/delete_metafield', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raven_id: cfg.ravenId, resource_id: cfg.resourceId })
  });

  if (res.status === 429) {
    return console.warn('Throttled — retry after', res.headers.get('Retry-After'), 'seconds.');
  }
  var data = await res.json().catch(function () { return {}; });
  if (!res.ok) return console.error(data.message || 'Delete rejected.');
  console.log('Deleted.');
}
```

## Responses worth handling

| Status | Meaning |
| ------ | ------- |
| **200** | The metafield was removed from Shopify. |
| **422** | Rejected. Either `raven_id`/`resource_id` were missing or did not resolve on this shop, or Shopify refused the delete — in which case the message is Shopify's own. |
| **429** | Shopify throttled it. `Retry-After` carries the delay in seconds. |

{% hint style="warning" %}
**Older versions of FieldsRaven reported success even when the delete failed.** If your
integration predates that fix, it may be treating failed deletes as successful — check that
it distinguishes 200 from 422. See [Troubleshooting](../troubleshooting.md).
{% endhint %}
