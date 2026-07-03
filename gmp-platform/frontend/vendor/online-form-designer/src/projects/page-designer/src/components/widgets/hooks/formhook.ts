import { getPageEvent } from './hooks';
import { ref, computed, nextTick, Ref } from 'vue';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FIELD_TYPE } from '@/enums/appEnum';
import dayjs from 'dayjs';

export function useFormWidget(props, emit, transform?: Function) {
  const widget: LowCodeWidget.BasicSchema = props.widget;
  const formData = ref(props.formData);
  const Event = getPageEvent();
  const value = computed({
    get() {
      if (widget.props.fieldType === FIELD_TYPE.TEXT) {
        return (props.modelValue?.toString() ?? '').replace(/\s+/g, ' ');
      }
      if (widget.props.fieldType === FIELD_TYPE.TIME && props.modelValue) {
        const format = widget.props.format || 'HH:mm:ss';
        if (dayjs(props.modelValue).isValid()) {
          return dayjs(props.modelValue).format(format);
        }
        if (dayjs(props.modelValue, format).isValid()) {
          return dayjs(props.modelValue, format).format(format);
        }
      }
      return props.modelValue ?? '';
    },
    set(value) {
      if (transform) {
        emit('update:modelValue', transform(value));
      } else {
        emit('update:modelValue', value ?? '');
      }
    },
  });

  async function onChange() {
    // console.log('onChange');
    await nextTick();
    Event.runEventByName('onChange', widget.events, value.value, formData.value);
  }
  function onEnter() {
    // console.log('onEnter');
    Event.runEventByName('onEnter', widget.events, value.value, formData.value);
  }
  function onBlur() {
    // console.log('onBlur');
    Event.runEventByName('onBlur', widget.events, value.value, formData.value);
    try {
      /**列字段时候触发保存 */
      emit('saveTableRow');
    } catch (error) {}
  }
  function onFocus() {
    // console.log('onFocus');
    Event.runEventByName('onFocus', widget.events, value.value, formData.value);
  }
  function afterClear() {
    Event.runEventByName('afterClear', widget.events, value.value, formData.value);
  }
  function getValue() {
    return value.value;
  }
  function setValue(v) {
    value.value = v;
  }

  async function setInputFocus(ref, getFocus) {
    await nextTick();
    if (getFocus && ref.value) {
      ref.value?.focus();
    }
  }

  return {
    onChange,
    onEnter,
    onBlur,
    onFocus,
    afterClear,
    getValue,
    setValue,
    setInputFocus,
    value,
  };
}
