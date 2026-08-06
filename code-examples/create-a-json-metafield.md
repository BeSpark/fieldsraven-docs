# Create a json metafield

{% hint style="warning" %}
JSON object must be `stringify`ed before being sent.&#x20;
{% endhint %}

{% tabs %}
{% tab title="Vanilla JS" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  ravenSubmit = (value) => {
    const ravenObj = {%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'TBD' -%}
    const valueObj = { value: value };
    const requestParams = { raven: Object.assign({}, ravenObjOne, valueObjOne) };
    const response = fetch('/apps/raven/create_metafield', {
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
<button id="fieldsraven-demo" onclick="ravenSubmit(JSON.stringify({fav_color: 'Yellow', hobby: 'Soccer'}))">Send the Raven!</button>
```
{% endtab %}

{% tab title="FieldsRaven Fetch wrapper (aka Storefront JS Kit)" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  ravenSubmit = (value) => {
    const ravenObj = {%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'TBD' -%}
    const valueObj = { value: value };
    const requestParams = Object.assign({}, ravenObjOne, valueObjOne);
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
</script>

<!-- HTML -->
<button id="fieldsraven-demo" onclick="ravenSubmit(JSON.stringify({fav_color: 'Yellow', hobby: 'Soccer'}))">Send the Raven!</button>
```
{% endtab %}
{% endtabs %}
