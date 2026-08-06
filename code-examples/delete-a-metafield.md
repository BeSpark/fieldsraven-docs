# Delete a metafield



{% hint style="warning" %}
This won't delete the metafield definition, it will just clear metafield value
{% endhint %}

{% hint style="info" %}
Use the same `raven_id` as the one used to create metafields, you don't need to create a new raven for the delete operation.
{% endhint %}

{% tabs %}
{% tab title="Vanilla JS" %}
```html
<!-- JavaScript + Liquid -->
<script type="text/javascript">
  fieldsRavenTestDelete = (value) => {
    const requestParams = {
      resource_id: {{ customer.id }},
      raven_id: 'TBD'
    };
    const response = fetch('/apps/raven/delete_metafield', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestParams)
    });

    response
      .then(res => res.json())
      .then(resJson => console.log('resJson: ', resJson));
  }
</script>

<!-- HTML -->
<button id="fieldsraven-demo" onclick="fieldsRavenTestDelete()">Delete metafield!</button>

```
{% endtab %}
{% endtabs %}
