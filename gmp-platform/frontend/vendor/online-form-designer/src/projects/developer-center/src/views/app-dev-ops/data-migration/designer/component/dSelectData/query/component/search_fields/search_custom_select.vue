<template>
  <a-select
    v-model:value="value"
    v-bind="separatorAttr"
    :dropdownClassName="
      multiple
        ? 'gct-project-select-dropdown gct-project-select-multiple'
        : 'gct-project-select-dropdown'
    "
    :options="options"
    maxTagCount="gct-responsive"
  >
  </a-select>
</template>

<script setup lang="ts">
  import { computed, toRefs, toRef, nextTick, watch, ref } from 'vue';
  import { useAsyncOptions } from '../../config.ts';
  import { SearchSelect } from '/@page-designer/types/web';
  import { message, type SelectProps } from 'ant-design-vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    formData: IData;
    configByHeaders: object;
  }>();

  const placeholder = '请选择';
  const { name: label, key: fieldKey, options } = props.widget;

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      allowClear: true,
    };
    return attr;
  });

  const emit = defineEmits(['update:modelValue', 'tableSearch']);

  const value = computed<any>({
    get() {
      return props.modelValue ?? undefined;
    },
    set(value: string[] | string) {
      emit('update:modelValue', value);
    },
  });

  defineExpose({});
</script>
