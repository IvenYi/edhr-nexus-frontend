<template>
  <div class="ks-row-middle">
    <a-input-number
      :value="start"
      @change="changeStart"
      v-bind="props.props"
      @blur="emit('blur')"
      :disabled="disabled"
    />
    <div class="w6 text-center">-</div>
    <a-input-number
      :value="end"
      @change="changeEnd"
      v-bind="props.props"
      @blur="emit('blur')"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts" name="gct-inputmoney">
  import { toRef } from 'vue';
  import type { InputNumberProps } from 'ant-design-vue';
  import { Form } from 'ant-design-vue';

  const props = defineProps<{
    modelValue?: number | null[];
    props: InputNumberProps;
    disabled: boolean;
  }>();
  const emit = defineEmits(['update:modelValue', 'blur']);
  const formItemContext = Form.useInjectFormItemContext();

  const triggerChange = (v) => {
    emit('update:modelValue', v);
    formItemContext.onFieldChange();
  };

  const start = toRef(() => props.modelValue?.[0]);
  const end = toRef(() => props.modelValue?.[1]);

  function changeStart(v) {
    triggerChange([v, end.value]);
  }
  function changeEnd(v) {
    triggerChange([start.value, v]);
  }
</script>
<style scoped lang="less"></style>
