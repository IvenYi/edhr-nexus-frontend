<template>
  <div class="ks-row-middle">
    <a-time-picker
      class="ks-col"
      :value="start"
      @change="changeStart"
      :placeholder="placeholder"
      :value-format="valueFormat"
      :allow-clear="allowClear"
      :disabled="disabled"
    />
    <div class="w6 text-center">-</div>
    <a-time-picker
      :disabled="disabled"
      class="ks-col"
      :value="end"
      @change="changeEnd"
      :allow-clear="allowClear"
      :placeholder="placeholder"
      :value-format="valueFormat"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, toRefs, toRef, reactive, toRaw } from 'vue';
  import { Form } from 'ant-design-vue';
  import type { TimePickerProps } from 'ant-design-vue';

  const props = defineProps<{
    modelValue?: string[];
    props: TimePickerProps;
    disabled: boolean;
  }>();
  const {
    props: { placeholder, valueFormat, allowClear },
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
