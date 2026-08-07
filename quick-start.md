---
description: Learn how you can create metafields on the storefront.
---

# Quick Start

## Idea

The idea is pretty simple, FieldsRaven is exposing the Metafields API on the storefront through a Shopify app proxy so you may take full advantage of creating (or updating) metafields on the storefront.

As a developer you just need to write in Liquid, JS and FieldsRaven will handle what's under the hood to help you unlock the full potential of Shopify themes.

I built FieldsRaven to be a storefront metafields kit for Shopify.

{% hint style="danger" %}
Make sure on the storefront that FieldsRaven requests are to be sent by a logged-in customers, it adds an extra layer of security.
{% endhint %}

## I installed the app, now what?

Two steps: create a raven, then paste the code it generates for you.

### Step 1 — Create a raven

A raven is the configuration that says *which* metafield a submission writes to: its owner resource (customer, product, page…), namespace, key, and type. Create one in the app.

### Step 2 — Copy the generated code

Open the raven and use the **Get Code** panel. It generates the Liquid, HTML and JavaScript for that specific raven — already carrying its id, its resource, the right Liquid object for the owner, and a working HMAC. Paste each tab into your theme.

That's the whole setup. You don't need to hand-write the signing snippet, and you don't need to look up your raven's id.

{% hint style="info" %}
The Get Code panel emits the same code that FieldsRaven's own snippet exporter writes to a theme file, so what you paste and what a snippet export produces stay in step.
{% endhint %}

## What the generated code does

Worth understanding, because you'll be pasting it into a live theme.

### The Liquid tab

Computes the request signature at render time, then hands it to JavaScript on `window`:

```liquid
{%- liquid
  assign fr_resource_id = customer.id
  assign fr_digest = "aBc123" | append: fr_resource_id
  assign fr_mac = fr_digest | hmac_sha256: shop.metafields.fields_raven.api_secret
-%}
<script>
  window.FR_CUSTOMER_FAVOURITE_COLOUR = {
    ravenId: "aBc123",
    resourceId: "{{ fr_resource_id }}",
    ravenMac: "{{ fr_mac }}"
  };
</script>
```

The HMAC is computed **inline** — there's no separate `raven-mac-gen.liquid` snippet to create any more. `fr_resource_id` is filled in with the correct Liquid object for your raven's resource (`customer.id`, `product.id`, `product.selected_or_first_available_variant.id`, `page.id`, and so on).

### The JavaScript tab

Binds the form and posts the submission:

```javascript
document.getElementById("fr-customer-favourite_colour").addEventListener("submit", async function (e) {
  e.preventDefault();
  var cfg = window.FR_CUSTOMER_FAVOURITE_COLOUR;
  var form = e.target;
  var res = await fetch("/apps/raven/create_metafield", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raven: { raven_id: cfg.ravenId, resource_id: cfg.resourceId, raven_mac: cfg.ravenMac, value: /* … */ } })
  });
  if (res.status === 429) { alert("FieldsRaven is busy — please try again in a moment."); return; }
  // …
});
```

Three things it handles that hand-rolled integrations often miss: the payload is wrapped in a `raven` object, a **429** is treated as "retry shortly" rather than a failure, and a rejected submission surfaces the server's own message instead of a generic error.

### Identifiers are keyed on the whole raven, not just the key

The form id (`fr-customer-favourite_colour`) and the JS global (`FR_CUSTOMER_FAVOURITE_COLOUR`) are derived from the raven's **resource, namespace and key together** — not the key alone.

That matters if you put two forms on one page. Two ravens may legitimately share a key while differing by resource or namespace; identifiers built from the key alone would collide, `getElementById` would return the first match, and **the second form would silently never bind**. A non-default namespace adds a segment: `fr-<namespace>--<resource>-<key>`.

## Make your first request

Now that the raven exists and its code is in your theme, it's time to create your first metafield.

The endpoint that makes this possible is `PUT /apps/raven/create_metafield`, which expects an object with the following attributes: `raven_id, resource_id, value, raven_mac`.

{% hint style="warning" %}
`/apps/raven/create_update_metafield` is a legacy alias kept alive for existing integrations. It still works, but it is slated for removal — use `/apps/raven/create_metafield` in anything new.
{% endhint %}

## Create/update metafield.

<mark style="color:orange;">`PUT`</mark> `/apps/raven/create_metafield`

All parameters are expected to be wrapped in an object

### Request Body

| Name                                           | Type                 | Description                                                           |
| ---------------------------------------------- | -------------------- | --------------------------------------------------------------------- |
| raven\_id<mark style="color:red;">\*</mark>    | string               |                                                                       |
| resource\_id<mark style="color:red;">\*</mark> | string               | If a shop metafield is being created/updated the value must be `shop` |
| value<mark style="color:red;">\*</mark>        | string, number, json | metafield value                                                       |
| raven\_mac<mark style="color:red;">\*</mark>   | string               | Message auth code. The Get Code panel's Liquid computes it inline; legacy integrations get it from `raven-mac-gen.liquid` |

{% tabs %}
{% tab title="200 Metafield successfully queued" %}
```javascript
{
    "status": 200,
    "json": {
        "message": "Sit tight the raven is on it!"
    }
}
```
{% endtab %}

{% tab title="422: Unprocessable Entity Metafield error" %}
```javascript
{
    "status": 422,
    "json": {
        "message": "🚨🚨 OOOPS SOMETHING WENT WRONG 🚨🚨",
        "errors": {
            "resource_name": [
                "pagex is not a valid value_type"
            ]
        }
    }
}
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
All parameters are expected to be wrapped in an object
{% endhint %}

{% hint style="info" %}
If you are creating a shop metafield `resource_id` value should be `shop`
{% endhint %}

{% tabs %}
{% tab title="FieldsRaven Storefront JS Kit" %}


```javascript
{% if customer %}
  <script type="text/javascript">
    window.addEventListener('FieldsRavenJSKitReady', (event) => {
      ravenSubmit = () => {
        const ravenObj = {%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'WGv2c24' -%}
        const valueObj = { value: `Hello Raven! @ ${Date.now()}` };
        const requestParams = Object.assign({}, ravenObj, valueObj);
        const response = FieldsRaven.send(requestParams);
        response.then(res => {
          if (res.status === 200) {
            console.log('🎉', res.json)
          } else {
            console.error('😞', res)
          }
        })
        .catch(e => console.error(e));
      }
    });    
  </script>
  <!-- CTA -->
  <button id="fieldsraven-demo" onclick="ravenSubmit()">send the Raven!</button>
{% else %}
  <p><a href='/account/login'>Login</a> or <a href='/account/register'>create an account</a> to unlock this feature!</p>
{% endif %}

```
{% endtab %}

{% tab title="Vanilla JS" %}
```html
// Liquid
{% if customer %}
  <script type="text/javascript">
    window.addEventListener('FieldsRavenJSKitReady', (event) => {
      ravenSubmit = () => {
        const ravenObj = {%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'WGv2c24' -%}
        const valueObj = { value: `Hello Raven! @ ${Date.now()}` };
        const requestParams = { raven: Object.assign({}, ravenObj, valueObj) };
        
        const response = fetch('/apps/raven/create_metafield', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestParams)
        })

        response
          .then(res => res.json())
          .then(resJson => console.log('resJson: ', resJson))
      }
    });    
  </script>
  <!-- CTA -->
  <button id="fieldsraven-demo" onclick="ravenSubmit()">send the Raven!</button>
{% else %}
  <p><a href='/account/login'>Login</a> or <a href='/account/register'>create an account</a> to unlock this feature!</p>
{% endif %}
```
{% endtab %}
{% endtabs %}

## Storefront Kit

After installing the app, there should be a few `App embeds` in your `Customize > Theme settings > App embeds`.

![](https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FOftRip4W9tMLWM0E4Nla%2FFieldsRaven%20Dev%20~%20Customize%20Dawn%20~%20Shopify%202022-02-07%2022-58-14.png?alt=media\&token=b77dab57-9719-4523-9ced-bf0735ca111a)

For conveniance there is a `Storefront Kit` which contains few a JavaScript function to create/update metafields.

The `Storefront Kit` function will return a `promise`, when the `promise` is resolved it will return a JavaScript `object` that you may hook into to check on the status of the request and update the UI if you wish.

Example for a successful request

```javascript
{
    "status": 200,
    "json": {
        "message": "Sit tight the raven is on it!"
    }
}
```

Example for a failed request

```javascript
{
    "status": 422,
    "json": {
        "message": "🚨🚨 OOOPS SOMETHING WENT WRONG 🚨🚨",
        "errors": {
            "resource_name": [
                "pagex is not a valid value_type"
            ]
        }
    }
}
```

## Pre-built theme examples

At the moment there are two `App embeds` examples to demo what might be built on top of FieldsRaven.

1.  Birthday Popup: an example implementation for a customer birthday reward popup. ([Screen recording](https://monosnap.com/file/M0DEkzpRBIYuGcNciqo1AGEIvQgZJk)). [Learn more](app-embeds/customer-birthday-popup).


2. Sitemap and Search engines Hide/Show: an example implementation for sitemap/search engines to hide pages/templates from search results & sitemap (`nofollow`, `noindex`). ([Screen recording](https://monosnap.com/file/h1EoPtbxRYRgmGR6Z4ob4OMCp4601H)). [Learn more](app-embeds/sitemap-manager).

Each of those `App embeds` have settings, make sure to check them out.

## Creating metafields on `onload`

If you're using FieldsRaven storefront kit, the kit triggers a `FieldsRaven:ready` event when it's loaded. So the following will do the trick.

```javascript
window.addEventListener('FieldsRavenJSKitReady', (event) => {
  console.log('FieldsRaven storefront kit loaded!');
});
```

If you'd rather not use FieldsRaven Storefront Kit, then this should do the trick:

```javascript
window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
});
```

## Appendix — the manual `raven-mac-gen.liquid` snippet (legacy)

Before the Get Code panel existed, every integration hand-created a theme snippet named `raven-mac-gen.liquid` and rendered it to compute the signature:

```liquid
{%- liquid
  assign raven_api_secret = shop.metafields.fields_raven.api_secret
  assign raven_digest_string = raven_id | append: resource_id
  assign raven_mac = raven_digest_string | hmac_sha256: raven_api_secret
-%}
{
  raven_id: '{{ raven_id }}',
  resource_id: '{{ resource_id }}',
  raven_mac: '{{ raven_mac }}'
}
```

```liquid
{%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'WGv2c24' -%}
```

**This still works**, and existing integrations built this way need no changes — the signature it produces is the same one the generated code produces.

It is documented here only so you can recognise it in a theme you've inherited. For anything new, use the Get Code panel: it computes the same HMAC inline, fills in the correct Liquid object for your raven's resource, and derives collision-safe identifiers you'd otherwise have to reason about yourself.
