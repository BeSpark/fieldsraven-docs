# Create a single\_line\_text\_field metafield



{% hint style="warning" %}
The type of the metafield you're going to create depends on the Raven carrying the message.\
If the value you're sending doesn't match the value type expected, the request will result in an error.
{% endhint %}

{% tabs %}
{% tab title="Vanilla JS" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  fieldsRavenSubmit = (value) => {
    const ravenObj = {%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'TBD' -%}
    const valueObj = { value: value };
    const requestParams = { raven: Object.assign({}, ravenObj, valueObj) };
    const response = fetch('/apps/raven/create_metafield', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestParamsOne)
    })

    response
      .then(res => res.json())
      .then(resJson => console.log('resJson: ', resJson))
  }
</script>

<!-- HTML -->
<button id="fieldsraven-demo" onclick="ravenSubmit('Hello Raven!')">Send the Raven!</button>

```
{% endtab %}

{% tab title="FieldsRaven Fetch wrapper (aka Storefront JS Kit)" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  fieldsRavenSubmit = (value) => {
    const ravenObj = {%- render 'raven-mac-gen', resource_id: page.id, raven_id: 'TBD' -%}
    const valueObj = { value: value };
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
</script>

<!-- HTML -->
<button id="fieldsraven-demo" onclick="ravenSubmit('Hello Raven!')">Send the Raven!</button>

```
{% endtab %}
{% endtabs %}
