---
description: Legacy — works only on stores using classic customer accounts.
---

# Customer registration with custom attributes (legacy)

{% hint style="danger" %}
**This example only works on stores using classic customer accounts.**

It hooks the theme's own `/account/register` form. Under Shopify's newer **customer
accounts**, signup is hosted by Shopify and managed separately from your theme — the theme's
registration form is not part of the flow, so there is nowhere to inject a custom field. No
amount of theme code changes that.

Kept here because stores on classic customer accounts still work exactly as described.
{% endhint %}

{% hint style="success" %}
**On new customer accounts, collect the attribute *after* signup instead.** A customer is
logged in by then, which is all a customer-owned raven needs — put the field on an account
or preferences page and submit it normally. See
[Collect custom customer attributes](collect-custom-customer-attributes.md), which needs no
registration hook at all.
{% endhint %}

{% hint style="info" %}
I’m using AlpineJS to manage the state of the fields on the registration form, AlpineJS is already included with FieldsRaven theme extension, make sure to remove it if you'd rather go VanillaJS or use SomethingElseJS. ([How to remove AlpineJS](https://monosnap.com/file/bLMikikJaht4sOIT2K79o5y3tz8VI4))
{% endhint %}

[Demo](https://monosnap.com/file/FwZJeuhlBsbNoWmWoH5s3OE6eCApYI) (screen recording)

### Steps:&#x20;

1. Create raven ([screen recording demo](https://monosnap.com/file/mrXL3nE2zVZ1zMl1Ovz1DMfjzCE7W3))
2. Hack customer registration form to store customer attributes in localStorage if they exists (example code below)
3. After customer registration is success and customer is logged-in check if localStorage key exists
4. If custom attributes exists in localStorage send a raven with it to create a customer metafield and optionally sync fields with Klaviyo
5. If the raven is successful delete the localStorage

![](https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FXAx17fBf7iZA6hC16ecs%2FCreate%20Account%20%E2%80%93%20FieldsRaven%20Demo%202022-03-25%2011-31-06.png?alt=media\&token=917ae152-8761-4e09-97a7-d2a6c558a36b)

## Code

```liquid
{% comment %}
register.liquid
{% endcomment %}

{{ 'customer.css' | asset_url | stylesheet_tag }}

<div class="customer register"
  x-data="{
    isValid() {
      let invalid = Object.values(this.custtomAttributes).some(v => v === null || v === '' );
      console.log('🛑 invalid: ', invalid);
      return !invalid;
    },
    custtomAttributes: {
      mostImportantDate: null,
      intrest: null,
      acceptsEmail: false,
      acceptsSMS: false
    }
  }"
  x-init="
    $watch('custtomAttributes', value => {
      if (isValid()) {
        console.log('💾💾 saving customer_registration_custom_attributes to local storage 💾💾');
        localStorage.setItem('customer_registration_custom_attributes', JSON.stringify(value));
      }
    })
  "
>
  <svg style="display: none">
    <symbol id="icon-error" viewBox="0 0 13 13">
      <circle cx="6.5" cy="6.50049" r="5.5" stroke="white" stroke-width="2"/>
      <circle cx="6.5" cy="6.5" r="5.5" fill="#EB001B" stroke="#EB001B" stroke-width="0.7"/>
      <path d="M5.87413 3.52832L5.97439 7.57216H7.02713L7.12739 3.52832H5.87413ZM6.50076 9.66091C6.88091 9.66091 7.18169 9.37267 7.18169 9.00504C7.18169 8.63742 6.88091 8.34917 6.50076 8.34917C6.12061 8.34917 5.81982 8.63742 5.81982 9.00504C5.81982 9.37267 6.12061 9.66091 6.50076 9.66091Z" fill="white"/>
      <path d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z" fill="white" stroke="#EB001B" stroke-width="0.7">
    </symbol>
  </svg>
  <h1>
    {{ 'customer.register.title' | t }}
  </h1>
  {%- form 'create_customer', novalidate: 'novalidate' -%}
    {%- if form.errors -%}
      <h2 class="form__message" tabindex="-1" autofocus>
        <svg aria-hidden="true" focusable="false" role="presentation">
          <use href="#icon-error" />
        </svg>
        {{ 'templates.contact.form.error_heading' | t }}
      </h2>
      <ul> 
        {%- for field in form.errors -%}
          <li>
            {%- if field == 'form' -%}
              {{ form.errors.messages[field] }}
            {%- else -%}
              <a href="#RegisterForm-{{ field }}">
                {{ form.errors.translated_fields[field] | capitalize }}
                {{ form.errors.messages[field] }}
              </a>
            {%- endif -%}
          </li>
        {%- endfor -%}
      </ul>
    {%- endif -%}
    <div class="field">      
      <input
        type="text"
        name="customer[first_name]"
        id="RegisterForm-FirstName"
        {% if form.first_name %}value="{{ form.first_name }}"{% endif %}
        autocomplete="given-name"
        placeholder="{{ 'customer.register.first_name' | t }}"
      >
      <label for="RegisterForm-FirstName">
        {{ 'customer.register.first_name' | t }}
      </label>
    </div>
    <div class="field">
      <input
        type="text"
        name="customer[last_name]"
        id="RegisterForm-LastName"
        {% if form.last_name %}value="{{ form.last_name }}"{% endif %}
        autocomplete="family-name"
        placeholder="{{ 'customer.register.last_name' | t }}"
      >
      <label for="RegisterForm-LastName">
        {{ 'customer.register.last_name' | t }}
      </label>
    </div>
    <div class="field">      
      <input
        type="email"
        name="customer[email]"
        id="RegisterForm-email"
        {% if form.email %} value="{{ form.email }}"{% endif %}
        spellcheck="false"
        autocapitalize="off"
        autocomplete="email"
        aria-required="true"
        {% if form.errors contains 'email' %}
          aria-invalid="true"
          aria-describedby="RegisterForm-email-error"
        {% endif %}
        placeholder="{{ 'customer.register.email' | t }}"
      >
      <label for="RegisterForm-email">
        {{ 'customer.register.email' | t }}
      </label>
    </div>
    {%- if form.errors contains 'email' -%}
      <span id="RegisterForm-email-error" class="form__message">
        <svg aria-hidden="true" focusable="false" role="presentation">
          <use href="#icon-error" />
        </svg>
        {{ form.errors.translated_fields['email'] | capitalize }} {{ form.errors.messages['email'] }}.
      </span>
    {%- endif -%}
    <div class="field">     
      <input
        type="password"
        name="customer[password]"
        id="RegisterForm-password"
        aria-required="true"
        {% if form.errors contains 'password' %}
          aria-invalid="true"
          aria-describedby="RegisterForm-password-error"
        {% endif %}
        placeholder="{{ 'customer.register.password' | t }}"
      >
      <label for="RegisterForm-password">
        {{ 'customer.register.password' | t }}
      </label>
    </div>
    {%- if form.errors contains 'password' -%}
      <span id="RegisterForm-password-error" class="form__message">
        <svg aria-hidden="true" focusable="false" role="presentation">
          <use href="#icon-error" />
        </svg>
        {{ form.errors.translated_fields['password'] | capitalize }} {{ form.errors.messages['password'] }}.
      </span>
    {%- endif -%}
    {% comment %}
    {% endcomment %}
    {% render 'include-registration-extra-attributes' %}

    <button x-show="isValid()">
      {{ 'customer.register.submit' | t }}
    </button>
  {%- endform -%}
</div>

```

```liquid
{% comment %}
include-registration-extra-attributes.liquid
{% endcomment %}

<fieldset class="tw-mt-8">
  <legend class="tw-block tw-text-2xl tw-text-left tw-font-medium tw-text-gray-900 tw-mb-4">What are you interested in?</legend>
  <div class="tw-space-y-4 sm:tw-flex sm:tw-items-center sm:tw-space-y-0 sm:tw-space-x-10">
    <input type="date" id="start" name="customer-dob" x-model="custtomAttributes.mostImportantDate" class="focus:tw-ring-indigo-500 focus:tw-border-indigo-500 tw-relative tw-block tw-w-full tw-rounded tw-rounded-md tw-bg-transparent focus:tw-z-10 sm:tw-text-xl tw-border-gray-300">
  </div>
</fieldset>

<fieldset class="tw-mt-8">
  <legend class="tw-block tw-text-2xl tw-text-left tw-font-medium tw-text-gray-900 tw-mb-4">What are you interested in?</legend>
  <div class="tw-space-y-4 sm:tw-flex sm:tw-items-center sm:tw-space-y-0 sm:tw-space-x-10">
    <div class="tw-flex tw-items-center">
      <input x-model="customerAttrs.sidedish" value="HTML" id="html" name="customer-intrest" type="radio" checked class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300" x-model="custtomAttributes.intrest">
      <label for="sidedish-none" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> HTML </label>
    </div>

    <div class="tw-flex tw-items-center">
      <input x-model="customerAttrs.sidedish" value="CSS" id="css" name="customer-intrest" type="radio" checked class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300" x-model="custtomAttributes.intrest">
      <label for="sidedish-none" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> CSS </label>
    </div>

    <div class="tw-flex tw-items-center">
      <input x-model="customerAttrs.sidedish" value="JavaScript" id="javascript" name="customer-intrest" type="radio" checked class="focus:tw-ring-indigo-500 tw-h-4 tw-w-4 tw-text-indigo-600 border-gray-300" x-model="custtomAttributes.intrest">
      <label for="sidedish-none" class="tw-ml-3 tw-block tw-text-xl tw-font-medium tw-text-gray-700"> JavaScript </label>
    </div>
  </div>
</fieldset>

<fieldset class="tw-mt-8">
  <legend class="tw-block tw-text-2xl tw-text-left tw-font-medium tw-text-gray-900 tw-mb-4">Would you like to receive updates?</legend>
  <div class="tw-relative tw-flex tw-items-start">
    <div class="tw-flex tw-items-center tw-h-6">
      <input id="updates_email" name="updates_email" type="checkbox" class="focus:tw-ring-indigo-500 tw-h-6 tw-w-6 tw-text-indigo-600 tw-border-gray-300 tw-rounded" x-model="custtomAttributes.acceptsEmail" style="width: 1.5rem !important">
    </div>
    <div class="tw-ml-3 tw-text-xl">
      <label for="updates_email" class="tw-font-medium tw-text-gray-700">Email</label>
    </div>
  </div>
  <div class="tw-relative tw-flex tw-items-start">
    <div class="tw-flex tw-items-center tw-h-6">
      <input id="updates_sms" name="updates_sms" type="checkbox" class="focus:tw-ring-indigo-500 tw-h-6 tw-w-6 tw-text-indigo-600 tw-border-gray-300 tw-rounded" x-model="custtomAttributes.acceptsSMS" style="width: 1.5rem !important">
    </div>
    <div class="tw-ml-3 tw-text-xl">
      <label for="updates_sms" class="tw-font-medium tw-text-gray-700">SMS</label>
    </div>
  </div>
</fieldset>

```

```liquid
{% comment %}
include-initial-customer-attributes.liquid
Add this snippet at the bottom of theme.liquid
{% endcomment %}

{% if customer %}
  <script type="text/javascript">
    ravenCustomerCustomAttrsSubmit = (value) => {
      const ravenObj = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: 'TBD' -%};
      const valueObj = { value: value };
      const response = Raven.send(ravenObj, valueObj);
      response.then(res => {
        if (res.status === 200) {
          console.log('🎉', res.json)
          localStorage.removeItem('customer_registration_custom_attributes');
        } else {
          console.error('😞', res.json)
        }
      })
      .catch(e => console.error(e));
    }

    window.addEventListener('DOMContentLoaded', (event) => {
      let customer_registration_custom_attributes  = localStorage.getItem('customer_registration_custom_attributes');
      if (customer_registration_custom_attributes) {
        console.log('💾💾 customer_registration_custom_attributes 💾💾', customer_registration_custom_attributes);
        ravenCustomerCustomAttrsSubmit(customer_registration_custom_attributes)
      }
    });
  </script>
{% endif %}

```
