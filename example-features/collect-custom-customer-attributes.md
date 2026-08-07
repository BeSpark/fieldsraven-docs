---
description: >-
  Build a simple form to collect custom customer attributes, store them into a
  customer metafield and optionally sync them with Klaviyo.
---

# Collect custom customer attributes

{% hint style="warning" %}
**Updated for the current API.** Earlier versions of this page used
`Raven.send(ravenObj, valueObj)`, which posts to the legacy
`/apps/raven/create_update_metafield` endpoint with an unwrapped payload. The Storefront Kit
still ships it, but `FieldsRaven.send()` is the current call — it targets
`/apps/raven/create_metafield` and wraps the payload itself.

Ids come from the **Get Code** panel's Liquid, which defines `window.FR_<RESOURCE>_<KEY>`
and computes the signature inline. There is no `raven-mac-gen` snippet to create any more —
see [Quick Start](../quick-start.md).
{% endhint %}

[Demo](https://monosnap.com/file/XMzfPmLg7boIRoyWqVyjzwB3xbMEPH) (screen recording)

{% hint style="info" %}
Syncing with Klaviyo is only available for `customer` type resource
{% endhint %}

## Steps

1. Create a Raven to carry customer attributes payload, if you want to sync with Klaviyo, select "Sync with Klaviyo" and add Klaviyo private API key ([demo](https://monosnap.com/file/NfDsnAjQcTieL4yTZiiwucsaBDb7pr)).
2. Paste the raven's **Get Code** output into the theme — it defines `window.FR_<RESOURCE>_<KEY>` and computes the signature inline
3. Write a little bit of Liquid, HTML, CSS, and Javascript.
4. 🎉

{% hint style="info" %}
I used Tailwind CSS to style the form and AlpineJS to manage the state of the form and UI updates.
{% endhint %}

## Code

![](https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FdLp9Nibnc6jOjShVXcGB%2FLet's%20be%20friends%20%E2%80%93%20FieldsRaven%20Demo%202022-03-25%2010-39-14.png?alt=media\&token=ac924d00-4815-4bc2-8d7f-ee0f40218959)

```liquid
{% if customer %}
  <div class="form-state-wrapper"
    x-data="{
      test_field: null,
      customerAttrs: {
        sidedish: 'None',
        birthDay: null,
        birthMonth: null
      },
      hasError: false,
      isSubmitted: false,
      isValid() {
        return !Object.values(this.customerAttrs).some(value => value === null || value === '')
      },
      submitData() {
        console.log('this.isValid() ->', this.isValid());
        console.log('JSON.stringify(this.customerAttrs) ->', JSON.stringify(this.customerAttrs));
        if (this.isValid()) {
          const cfg = window.FR_CUSTOMER_CUSTOMER_ATTRS;   // from the Get Code panel
          const valueObj = { value: JSON.stringify(this.customerAttrs) };
          const response = FieldsRaven.send(Object.assign(
            { raven_id: cfg.ravenId, resource_id: cfg.resourceId, raven_mac: cfg.ravenMac },
            valueObj
          ));
          response.then(res => {
            if (res.status === 200) {
              console.log('🎉', res.json)
              this.hasError = false;
              this.isSubmitted = true;
              console.log('let us be friends 🎉👬');
            } else {
              console.error('😞', res)
            }
          })
          .catch(e => console.error(e));
        } else {
          this.isSubmitted = false;
          this.hasError = true;
        }
      }
    }"
  >
  <template x-if="isSubmitted">
    <div class="tw-rounded-md tw-bg-green-50 tw-p-4 tw-mb-8">
      <div class="tw-flex">
        <div class="tw-flex-shrink-0">
          <svg class="tw-h-5 tw-w-5 tw-text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="tw-ml-3">
          <h3 class="tw-text-xl tw-font-medium tw-text-green-800">Thank you, we truly appreciate your friendship 🙌🙏 We'll be in touch!</h3>
        </div>
      </div>
    </div>
  </template>

  <template x-if="hasError">
    <div class="tw-rounded-md tw-bg-red-50 tw-p-4 tw-mb-8">
      <div class="tw-flex">
        <div class="tw-flex-shrink-0">
          <svg class="tw-h-5 tw-w-5 tw-text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="tw-ml-3">
          <h3 class="tw-text-xl tw-font-medium tw-text-red-800">Please select proper values so we can get this friendship started! 🎉👬</h3>
        </div>
      </div>
    </div>
  </template>
    
  <template x-if="!isSubmitted">
    <div id="form-wrapper">
      <code>
        {{ customer.metafields.klaviyo_sync.lets_be_friends.value }}
      </code><br>
      <div id="birthdate-wrapper">
        <fieldset class="tw-mb-8 tw-bg-white tw-max-w-xs">
          <legend class="tw-block tw-text-xl tw-font-medium tw-text-gray-700 tw-mb-4">Care to share your birthday?</legend>
          <div class="tw-mt-1 tw-rounded-md tw-shadow-sm tw-space-y-px">
            <div>
              <label for="birth-day" class="tw-sr-only">Day</label>
              <select x-model="customerAttrs.birthDay" id="birth-day" name="birth-day" class="focus:tw-ring-indigo-500 focus:tw-border-indigo-500 tw-relative tw-block tw-w-full tw-rounded-none tw-rounded-t-md tw-bg-transparent focus:tw-z-10 sm:tw-text-xl tw-border-gray-300">
                <option value="" selected>Select day</option>
                {% for day in (1..31) %}
                <option value="{{ day }}">{{ day }}</option>
                {% endfor %}
              </select>
            </div>
            <div>
              {% assign months = "January, February, March, April, May, June, July, August, September, October, November, Decembe" | split: ',' %}
              <label for="birth-month" class="tw-sr-only">Month</label>
              <select x-model="customerAttrs.birthMonth" id="birth-month" name="birth-month" class="focus:tw-ring-indigo-500 focus:tw-border-indigo-500 tw-relative tw-block tw-w-full tw-rounded-none tw-rounded-b-md tw-bg-transparent focus:tw-z-10 sm:tw-text-xl tw-border-gray-300">
                <option value="" selected>Select month</option>
                {% for month_raw in months %}
                {% assign month = month_raw | strip %}
                <option value="{{ month }}">{{ month }}</option>
                {% endfor %}
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      <div id="sidedish-wrapper">
        <fieldset class="mt-4">
          <legend class="tw-block tw-text-xl tw-font-medium tw-text-gray-700 tw-mb-4">What's your favorite side dish?</legend>
          <div class="tw-space-y-4 sm:tw-flex sm:tw-items-center sm:tw-space-y-0 sm:tw-space-x-10">
            <div class="tw-flex tw-items-center">
              <input x-model="customerAttrs.sidedish" value="None" id="sidedish-none" name="favorite-sidedish" type="radio" checked class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300">
              <label for="sidedish-none" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> None </label>
            </div>

            <div class="tw-flex tw-items-center">
              <input x-model="customerAttrs.sidedish" value="Baked beans" id="sidedish-baked-beans" name="favorite-sidedish" type="radio" class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300">
              <label for="sidedish-baked-beans" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> Baked beans </label>
            </div>

            <div class="tw-flex tw-items-center">
              <input x-model="customerAttrs.sidedish" value="Coleslaw" id="sidedish-coleslaw" name="favorite-sidedish" type="radio" class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300">
              <label for="sidedish-coleslaw" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> Coleslaw </label>
            </div>

            <div class="tw-flex tw-items-center">
              <input x-model="customerAttrs.sidedish" value="French fries" id="sidedish-frenchfries" name="favorite-sidedish" type="radio" class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300">
              <label for="sidedish-frenchfries" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> French fries </label>
            </div>

            <div class="tw-flex tw-items-center">
              <input x-model="customerAttrs.sidedish" value="Garden salad" id="sidedish-gardensalad" name="favorite-sidedish" type="radio" class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300">
              <label for="sidedish-gardensalad" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> Garden salad </label>
            </div>

            <div class="tw-flex tw-items-center">
              <input x-model="customerAttrs.sidedish" value="Mashed potatoes" id="sidedish-mashed-potatoes" name="favorite-sidedish" type="radio" class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300">
              <label for="sidedish-mashed-potatoes" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> Mashed potatoes </label>
            </div>
          </div>
        </fieldset>
      </div>
      <button @click="submitData()" type="button" class="tw-mt-8 tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-xl tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-indigo-600 hover:tw-bg-indigo-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500">Let's be friends!</button>
    </div>
  </template>
{% else %}
  <div class="tw-bg-white tw-border-gray-200 tw-shadow-sm tw-rounded-lg tw-border tw-p-4">
    <p>Friends share emails together 👬 Please <a class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500" href="/account/login">log in</a> or <a class="tw-text-indigo-600 tw-whitespace-nowrap hover:tw-text-indigo-500" href="/account/register">register</a> so we can be better friends 🙌</p>
  </div>
{% endif %}

```
