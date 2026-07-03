export function getCamudaFieldsString(data) {
  const camundaFields: { name: string; value: string }[] = [];
  const { formTodo, formView, mobileFormTodo, mobileFormView } = data;
  camundaFields.push({
    name: 'formView',
    value: formView,
  });
  camundaFields.push({
    name: 'formTodo',
    value: formTodo,
  });
  camundaFields.push({
    name: 'mobileFormView',
    value: mobileFormView,
  });
  camundaFields.push({
    name: 'mobileFormTodo',
    value: mobileFormTodo,
  });
  const result = camundaFields
    .filter((item) => item.value)
    .map((item) => {
      return `<camunda:field name="${item.name}" stringValue="${item.value}"/>`;
    })
    .join('\n');
  console.log(result);
  return result;
}
