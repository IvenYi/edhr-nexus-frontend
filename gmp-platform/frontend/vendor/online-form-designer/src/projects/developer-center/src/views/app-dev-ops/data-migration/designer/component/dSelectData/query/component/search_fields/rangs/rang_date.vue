<template>
  <div class="ks-row-middle">
    <a-date-picker
      class="ks-col"
      :value="start"
      @change="changeStart"
      :placeholder="placeholder"
      :value-format="valueFormat"
      :allow-clear="allowClear"
      :showTime="picker != null ? null : showTime"
      :disabled="disabled"
      :picker="picker"
    />
    <div class="w6 text-center">-</div>
    <a-date-picker
      class="ks-col"
      :value="end"
      @change="changeEnd"
      :allow-clear="allowClear"
      :placeholder="placeholder"
      :value-format="valueFormat"
      :showTime="picker != null ? null : showTime"
      :disabled="disabled"
      :picker="picker"
    />
  </div>
</template>

<script setup lang="ts">
  import { toRef, toRaw } from 'vue';
  import { Form } from 'ant-design-vue';
  import type { DatePickerProps } from 'ant-design-vue';

  const props = defineProps<{
    props: DatePickerProps;
    modelValue?: string[];
    disabled: boolean;
  }>();

  const {
    props: { placeholder, valueFormat, allowClear, showTime, picker },
  } = toRaw(props);
  const emit = defineEmits(['update:modelValue', 'change']);
  const formItemContext = Form.useInjectFormItemContext();

  const triggerChange = (v) => {
    emit('update:modelValue', v);
    formItemContext.onFieldChange();
  };

  const start = toRef(() => props.modelValue?.[0]);
  const end = toRef(() => props.modelValue?.[1]);

  function changeStart(v) {
    triggerChange([v, end.value]);
    emit('change');
  }
  function changeEnd(v) {
    triggerChange([start.value, v]);
    emit('change');
  }
</script>
<style scoped lang="less"></style>
