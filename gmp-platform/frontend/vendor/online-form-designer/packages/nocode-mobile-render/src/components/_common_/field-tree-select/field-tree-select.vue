<template>
  <NocodeField
    :class="['field-tree-select']"
    v-model="value"
    :label="label"
    v-bind="$attrs"
    @click-input="openPopup"
    @clearValue="onClear"
    clearable
    readonly
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
    <template #input2>
      <div class="w-full flex justify-end items-center text-right">
        {{ labelValue }}
      </div>
    </template>
  </NocodeField>
</template>

<script lang="ts" setup name="field-tree-select">
  import { computed } from 'vue';
  import { renderUtils } from '@gct/nocode-base';
  import NocodeField from '../nocode-field/nocode-field.vue';
  import { createTreePopup } from '@mobile/components/treePopup';

  const props = withDefaults(
    defineProps<{
      /** 多选的时候值是用,分隔的字符串 */
      modelValue?: string;
      label?: string;
      multiple: boolean;
      options: any[];
      placeholder?: string;
      onChange: Function;
      field: string;
      modelKey: string;
    }>(),
    {
      label: '用户',
      multiple: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const fieldValue = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, props.multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, props.multiple));
    },
  });

  const labelValue = computed(() => getOptionLabel(value.value));

  const onClear = () => {
    emit('update:modelValue', undefined);
    props.onChange?.(getOptionLabel);
  };

  const { openTreePopup } = createTreePopup({
    api: undefined,
    options: props.options,
    title: '请选择',
    fieldKey: props.field,
    modelKey: props.modelKey,
  });

  const openPopup = () => {
    openTreePopup({
      ids: fieldValue.value,
      type: props.multiple ? 'multiple' : 'single',
      callback(a: any) {
        console.log('aaaa', a);
        fieldValue.value = a;
        props.onChange(getOptionLabel);
      },
    });
  };

  function getOptionLabel(val) {
    if (val) {
      return renderUtils.getSelectOptions({
        value: val,
        multiple: props.multiple,
        options: props.options,
        key: 'label',
      }).labelJson;
    }
  }
</script>
