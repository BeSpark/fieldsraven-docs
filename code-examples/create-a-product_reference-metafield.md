# Create a product\_reference metafield



{% hint style="warning" %}
The type of the metafield you're going to create depends on the Raven carrying the message.\
If the value you're sending doesn't match the value type expected, the request will result in an error.
{% endhint %}

<figure><img src="https://1211303336-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FNP07jPPCyBlsAnUAqYNM%2Fuploads%2FM4HeHc7jSIFoCP5PBFdG%2FScreenshot%202023-09-07%20at%2011.42.11.png?alt=media&#x26;token=39986a20-06f3-42b1-bca5-5d3151c002ef" alt=""><figcaption></figcaption></figure>

{% tabs %}
{% tab title="Vanilla JS" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  fieldsRavenSubmit = (value) => {
    const ravenObj = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: 'TBD' -%}
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
<button id="fieldsraven-demo" onclick="ravenSubmit('{{ product.id }}')">Send the Raven!</button>

```
{% endtab %}

{% tab title="FieldsRaven Fetch wrapper (aka Storefront JS Kit)" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  fieldsRavenSubmit = (value) => {
    const ravenObj = {%- render 'raven-mac-gen', resource_id: customer.id, raven_id: 'TBD' -%}
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
<button id="fieldsraven-demo" onclick="ravenSubmit('{{ product.id }}')">Send the Raven!</button>

```
{% endtab %}
{% endtabs %}
