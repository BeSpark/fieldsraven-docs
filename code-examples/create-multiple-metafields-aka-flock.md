# Create multiple metafields (aka flock)



{% tabs %}
{% tab title="Vanilla JS" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  flockSubmit = (value) => {
    const ravenObjOne = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: raven_id_1 -%};
    const valueObjOne = { value: 'text value' };
    const requestParamsOne = Object.assign({}, ravenObjOne, valueObjOne);

    const ravenObjTwo = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: raven_id_2 -%};
    const valueObjTwo = { value: 1 };
    const requestParamsTwo = Object.assign({}, ravenObjTwo, valueObjTwo);

    const ravenObjThree = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: raven_id_3 -%};
    const valueObjThree = { value: 1.2 };
    const requestParamsThree = Object.assign({}, ravenObjThree, valueObjThree);

    const requestParams = { flock: [requestParamsOne, requestParamsTwo, requestParamsThree] }

    const response = fetch('/apps/raven/create_multiple_metafields', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestParams)
    })

    response
      .then(res => res.json())
      .then(resJson => console.log('resJson: ', resJson))
  }
</script>

<!-- HTML -->
<button id="fieldsraven-demo" onclick="flockSubmit()">Send the Flock!</button>
```
{% endtab %}

{% tab title="FieldsRaven Fetch wrapper (aka Storefront JS Kit)" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  flockSubmit = (value) => {
    const ravenObjOne = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: raven_id_1 -%};
    const valueObjOne = { value: 'text value' };
    const requestParamsOne = Object.assign({}, ravenObjOne, valueObjOne);

    const ravenObjTwo = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: raven_id_2 -%};
    const valueObjTwo = { value: 1 };
    const requestParamsTwo = Object.assign({}, ravenObjTwo, valueObjTwo);

    const ravenObjThree = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: raven_id_3 -%};
    const valueObjThree = { value: 1.2 };
    const requestParamsThree = Object.assign({}, ravenObjThree, valueObjThree);

    const response = FieldsRaven.sendMultiple([requestParamsOne, requestParamsTwo, requestParamsThree]);

    response.then(res => console.log('FieldsRaven.send response: ', res))
  }
</script>

<!-- HTML -->
<button id="fieldsraven-demo" onclick="flockSubmit()">Send the Flock!</button>
```
{% endtab %}
{% endtabs %}
