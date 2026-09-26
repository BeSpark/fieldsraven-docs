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
  if (res.status === 503) {
    if (data.code === 'backlog_draining') {
      return console.warn('Earlier work is draining. Retry the delete later.');
    }
    if (data.code === 'reconnect_required') {
      return console.error('The store must reconnect. Check the metafield before retrying.');
    }
  }
  if (!res.ok) return console.error(data.message || 'Delete rejected.');
  console.log('Deleted.');
}
```

{% hint style="warning" %}
**Sign your deletes.** The example above sends no `raven_mac`, which works today only
because the delete endpoint's signature check is **log-only** — FieldsRaven records unsigned
callers rather than rejecting them, because the app has never generated delete-side snippet
code and existing integrations are hand-rolled.

That is explicitly temporary: enforcement follows once the logs show callers are signing. An
integration built unsigned today will break then. Compute `raven_mac` exactly as the create
path does — the HMAC of `raven_id + resource_id` — and send it.
{% endhint %}

## Responses worth handling

| Status | Meaning |
| ------ | ------- |
| **200** | The metafield was removed from Shopify. |
| **422** | Rejected. Either `raven_id`/`resource_id` were missing or did not resolve on this shop, or Shopify refused the delete — in which case the message is Shopify's own. |
| **429** | Shopify throttled it. `Retry-After` carries the delay in seconds. |
| **503** | Check `code`: `backlog_draining` means retry later; `reconnect_required` means the store must reconnect. Do not report the delete as successful. |

The 503 response body is one of these exact JSON objects:

```json
{"code":"backlog_draining","message":"This shop is processing pending operations. Please retry later."}
```

```json
{"code":"reconnect_required","message":"Please reconnect this shop and retry later."}
```

For `backlog_draining`, wait and retry later without asking the merchant to reconnect. For `reconnect_required`, ask the merchant or support to reconnect the store, then check whether the metafield was deleted before retrying; the delete may have failed after remote work began.

{% hint style="warning" %}
**Older versions of FieldsRaven reported success even when the delete failed.** If your
integration predates that fix, it may be treating failed deletes as successful — check that
it distinguishes 200 from 422. See [Troubleshooting](../troubleshooting.md).
{% endhint %}
