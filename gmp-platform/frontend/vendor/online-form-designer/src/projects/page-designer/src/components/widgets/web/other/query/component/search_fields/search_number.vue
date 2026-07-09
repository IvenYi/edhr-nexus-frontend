<template>
  <rangReadonly v-if="widget.props.readonly" :value="modelValue" :isRang="isRang" />
  <rang-number
    v-model="valueRang"
    :props="separatorAttr"
    v-else-if="isRang"
    @blur="emit('tableSearch')"
  />
  <a-input-number v-model:value="value" v-bind="separatorAttr" v-else @blur="emit('tableSearch')" />
</template>

<script setup lang="ts" name="gct-inputmoney">
  import { computed, toRaw } from 'vue';
  import { SearchNumberInput } from '/@page-designer/types/web';
  import rangNumber from './rangs/rang_number.vue';
  import type { InputNumberProps } from 'ant-design-vue';
  import rangReadonly from './rangs/rang_readonly.vue';

  type Rangvalue = InstanceType<typeof rangNumber>['$props']['modelValue'];
  type Value = InputNumberProps['value'];
  const props = defineProps<{ modelValue?: any; widget: SearchNumberInput }>();
  const { maxValue, minValue, placeholder, isRang } = toRaw(props.widget.props);
  const separatorAttr = computed(() => {
    let attr: InputNumberProps = {
      max: maxValue,
      min: minValue,
      placeholder: placeholder,
    };
    return attr;
  });
  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const valueRang = computed({
    get() {
      return props.modelValue;
    },
    set(value: Rangvalue) {
      emit('update:modelValue', value);
    },
  });
  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value: Value) {
      emit('update:modelValue', value);
    },
  });
</script>
<style scoped lang="less"></style>
