# Customer Product Registration

{% hint style="info" %}
**Signing updated.** This page already uses `FieldsRaven.send()`, which is the current call.
Only the signing changed: ids and the HMAC now come from the **Get Code** panel's Liquid,
which defines `window.FR_<RESOURCE>_<KEY>` per raven — there is no `raven-mac-gen` snippet to
create any more. See [Quick Start](../quick-start.md). The four ravens below each get their
own config object.
{% endhint %}

```liquid
<script src="https://cdn.jsdelivr.net/npm/@caneara/iodine@8.3.0/dist/iodine.min.umd.min.js"></script>

{% liquid
  assign product_registrations = customer.metafields.fields_raven.product_registration.value
  assign product_registrations_json = product_registrations | json
%}

<script type="text/javascript">
  window.EuCountries = [
    'Select country',
    'Austria',
    'Belgium',
    'Bulgaria',
    'Cyprus',
    'Czech Republic',
    'Germany',
    'Denmark',
    'Estonia',
    'Spain',
    'Finland',
    'France',
    'United Kingdom',
    'Greece',
    'Hungary',
    'Croatia',
    'Republic of Ireland',
    'Italy',
    'Lithuania',
    'Luxembourg',
    'Latvia',
    'Malta',
    'Netherlands',
    'Poland',
    'Portugal',
    'Romania',
    'Sweden',
    'Slovenia',
    'Slovakia',
  ];

  {% if product_registrations != blank %}
    window.customerProductRegistrations = {{ product_registrations_json }};
  {% else %}
    window.customerProductRegistrations = [];
  {% endif %}

  console.log('🚧 customerProductRegistrations', window.customerProductRegistrations)
  console.log('🚧 product_registrations json ', {{ product_registrations | json }})
  console.log('🚧 product_registrations', '{{ product_registrations }}')
</script>
{% comment %}
<br>
  <h2>JSON metafield</h2>
  <code>
    {% for registration in product_registrations %}
     {{ registration["Serial Number"] }}<br>
     {{ registration["Country of Residence"] }}<br>
     {{ registration["Where did you purchase your meter?"] }}<br>
     ---<br>
    {% endfor %}
  </code>
  <br>
{% endcomment %}
  <h2>Individual metafields</h2>
  <code>
    api_secret: {{ shop.metafields.fields_raven.api_secret }}<br>
    customer.id: {{ customer.id }}<br>
    {% if customer.metafields.custom.serial_number != blank %}
     {{ customer.metafields.custom.serial_number }}<br>
    {% endif %}

    {% if customer.metafields.custom.country_of_residence != blank %}
      {{ customer.metafields.custom.country_of_residence }}<br>
    {% endif %}

    {% if customer.metafields.custom.where_did_you_purchase_your_meter != blank %}
      {{ customer.metafields.custom.where_did_you_purchase_your_meter }}<br>
    {% endif %}
  </code>
  <br>

<div
  x-data="{
    done: false,
    productRegistrations: window.customerProductRegistrations,
    countries: window.EuCountries,
    placesOfPurchase: ['Select an option','Keto-Mojo Website', 'Amazon', 'eBay', 'Other'],
    serialNumber: null,
    countryOfResidence: null,
    purchaseLocation: null,
    productRegistrationObj: {
      'Serial Number': this.serialNumber,
      'Country of Residence': this.countryOfResidence,
      'Where did you purchase your meter?': this.purchaseLocation
    },
    newRegistrationString() {
      this.productRegistrations.push(this.productRegistrationObj);
      return JSON.stringify(this.productRegistrations);
    },
    isValid() {
      const validation = (Iodine.assertMinLength(this.serialNumber, 20) &&  Iodine.assertMaxLength(this.serialNumber, 22)) &&
      Iodine.assertRequired(this.countryOfResidence) &&
      Iodine.assertRequired(this.purchaseLocation);

      return validation;
    },
    {% comment %}
    sendNewRegistration() {
      if (this.isValid()) {
        const ravenObjCfg = window.FR_CUSTOMER_PRODUCT_REGISTRATION;   // from that raven's Get Code panel
      const ravenObj = { raven_id: ravenObjCfg.ravenId, resource_id: ravenObjCfg.resourceId, raven_mac: ravenObjCfg.ravenMac };
        const valueObj = { value: this.newRegistrationString() };
        const requestParams = Object.assign({}, ravenObj, valueObj);
        console.log('🚧 requestParams 👉 ', requestParams)

        const response = FieldsRaven.send(requestParams);
        response.then(res => {
          if (res.status === 200) {
            console.log('🎉', res.json)
          } else {
            console.error('😞', res)
          }
        })
        .catch(e => console.error(e));
      } else {
        alert('serial_number length should be between 20 and 22')
      }

    },
    {% endcomment %}
    sendNewRegistrationFlock() {
      {% comment %} serial_number {% endcomment%}
      const ravenObjOneCfg = window.FR_CUSTOMER_REG_SERIAL;   // from that raven's Get Code panel
      const ravenObjOne = { raven_id: ravenObjOneCfg.ravenId, resource_id: ravenObjOneCfg.resourceId, raven_mac: ravenObjOneCfg.ravenMac };
      const valueObjOne = { value: this.serialNumber };
      const requestParamsOne = Object.assign({}, ravenObjOne, valueObjOne);

      console.log('🚧 requestParamsOne: ', requestParamsOne)

      {% comment %} country_of_residence {% endcomment%}
      const ravenObjTwoCfg = window.FR_CUSTOMER_REG_PURCHASED_AT;   // from that raven's Get Code panel
      const ravenObjTwo = { raven_id: ravenObjTwoCfg.ravenId, resource_id: ravenObjTwoCfg.resourceId, raven_mac: ravenObjTwoCfg.ravenMac };
      const valueObjTwo = { value: this.countryOfResidence };
      const requestParamsTwo = Object.assign({}, ravenObjTwo, valueObjTwo);

      console.log('🚧 requestParamsTwo: ', requestParamsTwo)

      {% comment %} where_did_you_purchase_your_meter {% endcomment%}
      const ravenObjThreeCfg = window.FR_CUSTOMER_REG_RETAILER;   // from that raven's Get Code panel
      const ravenObjThree = { raven_id: ravenObjThreeCfg.ravenId, resource_id: ravenObjThreeCfg.resourceId, raven_mac: ravenObjThreeCfg.ravenMac };
      const valueObjThree = { value: this.purchaseLocation };
      const requestParamsThree = Object.assign({}, ravenObjThree, valueObjThree);

      console.log('🚧 requestParamsThree: ', requestParamsThree)

      const response = FieldsRaven.sendMultiple([requestParamsOne, requestParamsTwo, requestParamsThree]);
      {% comment %}
        const response = FieldsRaven.send(requestParamsOne);
        const response = FieldsRaven.send(requestParamsThree);
        const response = FieldsRaven.send(requestParamsTwo);
      {% endcomment %}

      response.then(res => {
        if (res.status === 200) {
          console.log('🎉', res.json)
          this.done = true;
        } else {
          alert('Error! Please contact store owner.')
          console.error('😞', res)
        }
      })
      .catch(e => console.error(e));
    }
  }"
  x-init="console.log('🚧 productRegistrations: ', productRegistrations)"
>
  <template x-if="done">
    <p>Thank you!</p>
  </template>
  <template x-if="!done">
    <div class="contact__fields">
      <div class="field">
        <input
          class="field__input"
          autocomplete="off"
          type="text"
          id="ProductRegistrationForm-serialNumber"
          name="ProductRegistrationForm[serialNumber]"
          placeholder="Please add your serial_number"
          x-model="serialNumber"
        >
        <label class="field__label" for="ProductRegistrationForm-serialNumber">Serial Number</label>
      </div>

      <div class="field">
        <div class="select">
          <select
            id="ProductRegistrationForm-countryOfResidence"
            name="ProductRegistrationForm[countryOfResidence]"
            class="select__select"
            x-model="countryOfResidence"
          >
            <template x-for="(country, index) in countries">
              <option :value="country" x-text="country" :disabled="index === 0"></option>
            </template>
          </select>
        </div>
      </div>

      <div class="field">
        <div class="select">
          <select
            id="ProductRegistrationForm-purchaseLocation"
            name="ProductRegistrationForm[purchaseLocation]"
            class="select__select"
            x-model="purchaseLocation"
          >
            <template x-for="(placeOfPurchase, index) in placesOfPurchase">
              <option :value="placeOfPurchase" x-text="placeOfPurchase" :disabled="index === 0"></option>
            </template>
          </select>
        </div>
      </div>
      <div class="submit__button">
        <button
          type="submit"
          class="button"
          @click="sendNewRegistrationFlock()"
          :disabled="!isValid()"
        >
          Register my product
        </button>
      </div>
    </div>
  </template>
</div>

```
