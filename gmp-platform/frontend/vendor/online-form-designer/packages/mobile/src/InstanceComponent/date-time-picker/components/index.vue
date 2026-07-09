<template>
  <component
    :is="comMap[view.component]"
    :valueFormat="valueFormat || view.valueFormat"
    :columnsType="view.columnsType"
    :displayFormat="displayFormat"
    :modelValue="modelValue"
    @update:modelValue="(v) => emit('update:modelValue', v)"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed, defineAsyncComponent } from 'vue';
  import { DateFormat } from '../const';
  import DatePicker from './date.vue';
  import TimePicker from './time.vue';
  import DateTimePicker from './date-time.vue';

  const emit = defineEmits(['update:modelValue']);
  const comMap = {
    datePicker: DatePicker,
    timePicker: TimePicker,
    dateTimePicker: DateTimePicker,
  };
  const props = defineProps<{
    displayFormat?: string;
    valueFormat?: string;
    modelValue?: string;
  }>();

  const view = computed(() => {
    return DateFormat[props.displayFormat];
  });
</script>
<style scoped lang="less"></style>
