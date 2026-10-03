# Reconnect and pending work

{% hint style="info" %}
Requires FieldsRaven 0.37.3 or later.
{% endhint %}

## Restore the Shopify connection

Open FieldsRaven from **Shopify Admin → Apps**. If it still cannot reconnect, [contact support](mailto:karim@fieldsraven.app) with your store's `.myshopify.com` address and the time you saw the problem. Do not send access tokens, session tokens, API secrets, or screenshots that reveal them.

Do not uninstall and reinstall as a recovery step. Uninstalling removes the active shop, Ravens, Fields and pending operations from FieldsRaven; Shopify metafields and metaobjects already written remain in your store.

Opening the app lets FieldsRaven request a new Shopify connection using your signed admin session. Support can investigate unresolved cases and escalate to Shopify Partner Support; escalation does not guarantee token restoration or a recovery time.

## What happens to pending writes

When the Shopify connection needs recovery, supported background metafield writes and metaobject syncs wait in a durable queue for your store. After recovery, FieldsRaven attempts that work in its original order. A `200` response to a storefront metafield submission means accepted, not confirmed written to Shopify. Check **Needs attention** and the affected Shopify value before telling a customer their change is complete.

Saving a Raven (creating or editing it) is refused while earlier pending work is waiting for reconnection or draining, regardless of its definition settings. Saves that need Shopify access can also fail when reconnection is required. After recovery and draining, save again. Already queued background definition reconciliation can also wait for recovery; a refused Raven save is not queued.

The storefront delete endpoint, `DELETE /apps/raven/delete_metafield`, may return HTTP `503` with these codes:

* `reconnect_required`: open FieldsRaven in Shopify admin; contact support if it cannot reconnect.
* `backlog_draining`: the connection is healthy and earlier operations are being processed. Retry later; this message does not ask you to reconnect.

`upstream_unavailable` is another `503` result: Shopify or the connection was temporarily unavailable. Retry later; it does not ask you to reconnect. A timed-out delete may have completed, so check whether the value is gone before retrying.

A delete receiving `reconnect_required` or `backlog_draining` has not succeeded. Check whether the value is gone before retrying a delete after reconnection.

Waiting work is bounded. While a store is blocked, the limit is 1,000 active operations; the oldest unclaimed operation stops automatic replay if that limit is reached, or the incoming operation stops if all existing operations have execution claims. An operation stops automatic replay after seven days within its current recorded blocked episode, measured from the later of that episode's start and the operation's creation. Healthy queue draining is outside these limits. Reaching either limit does not show whether Shopify already received the write. A submission ended this way may be held for support verification; check the Shopify value and contact support before resubmitting. Settled completed and terminal queue records are kept for at least 30 days; records that still need support verification or follow-up work are kept longer. This is queue retention, not deletion of your Shopify values or a general retention policy.

For reconnection and backlog conditions, MCP `create_raven` and `update_raven` report `RECONNECT_REQUIRED` or `UPSTREAM_UNAVAILABLE`; see [Errors, limits, and security](mcp/errors-and-limits.md).

## Check before retrying uncertain work

FieldsRaven may retry pending writes automatically when it can do so safely. If it cannot establish that retrying is safe, it stops automatic replay and flags that operation for review. Contact support and check the intended Shopify value. Held submissions show no Retry button; FieldsRaven support must verify the result in Shopify before work can be retried or marked complete.

Some jobs use a separate recovery policy: installation setup and webhook registration have bounded retries, and daily charge, shop-details and definition-drift checks skip a blocked store and try on their next daily occurrence. They are not durable pending writes. Support may need to repair setup or registration after retries are exhausted. A welcome email has no durable delivery receipt: setup retries may send it more than once, an exhausted setup may have sent none, and a manual resend can duplicate an earlier email.

Shopify token refreshes normally happen without merchant action. FieldsRaven runs one daily keepalive pass for refresh tokens with at most 30 days remaining. An operator pause or expired refresh token can still require you to open the app; the pass does not guarantee every refresh succeeds.
