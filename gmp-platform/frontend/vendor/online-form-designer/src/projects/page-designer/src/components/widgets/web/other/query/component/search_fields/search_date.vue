<template>
  <rangReadonly v-if="readonly" :value="modelValue" :isRang="isRang" />
  <rang-date
    v-else-if="isRang"
    v-model="valueRang"
    :props="separatorAttr"
    style="width: 100%"
    @change="emit('tableSearch')"
  />
  <a-date-picker
    v-model:value="value"
    v-bind="separatorAttr"
    style="width: 100%"
    v-else
    @change="emit('tableSearch')"
  />
</template>

<script setup lang="ts" name="gct-datepicker">
  import { ref, computed, toRefs } from 'vue';
  import { SearchDate } from '/@page-designer/types/web';
  import type { DatePickerProps } from 'ant-design-vue';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import rangDate from './rangs/rang_date.vue';
  import rangReadonly from './rangs/rang_readonly.vue';
  type Rangvalue = InstanceType<typeof rangDate>['$props']['modelValue'];
  const props = defineProps<{ modelValue?: any; widget: SearchDate }>();
  const { placeholder, clearable, dateType, isRang, readonly } = toRefs(props.widget.props);
  const separatorAttr = computed(() => {
    let attr: DatePickerProps = {
      allowClear: clearable.value,
      placeholder: placeholder?.value,
      valueFormat: DateFormat[dateType.value].valueFormat,
      picker: DateFormat[dateType.value].picker as DatePickerProps['picker'],
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
    set(value?: string) {
      emit('update:modelValue', value);
    },
  });
</script>
<style scoped lang="less"></style>
