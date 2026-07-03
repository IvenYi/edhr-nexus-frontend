let provideData;

export class Cache {
  modelValue = [];
  widget;
  formData = {};

  setWidget(widget) {
    this.widget = widget;
  }

  setModelValue(list) {
    this.modelValue = list;
  }

  setFormData(data) {
    this.formData = data;
  }
}

export const getProviderInstance = () => {
  if (!provideData) {
    provideData = new Cache();
  }
  return provideData;
};
