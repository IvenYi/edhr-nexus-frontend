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
      :disabled-hours="() => getDisabledStartHours()"
      :disabled-minutes="(h) => getDisabledStartMinutes(h)"
      :disabled-seconds="(h, m) => getDisabledStartSeconds(h, m)"
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
      :disabled-hours="() => getDisabledEndHours()"
      :disabled-minutes="(h) => getDisabledEndMinutes(h)"
      :disabled-seconds="(h, m) => getDisabledEndSeconds(h, m)"
    />
  </div>
</template>

<script setup lang="ts">
  import { toRef, toRaw } from 'vue';
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
    let endValue = end.value;
    // 如果设置了新的start，需要检查end是否小于start
    if (v && endValue && v > endValue) {
      endValue = v;
    }
    triggerChange([v, endValue]);
    emit('change');
  }

  function changeEnd(v) {
    let endValue = v;
    // 确保end时间不小于start时间
    if (start.value && endValue) {
      if (endValue < start.value) {
        endValue = start.value;
      }
    }
    triggerChange([start.value, endValue]);
    emit('change');
  }

  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const allMinutes = Array.from({ length: 60 }, (_, i) => i);
  const allSeconds = Array.from({ length: 60 }, (_, i) => i);

  function getDisabledStartHours() {
    if (!end.value) return [];
    const [eh] = end.value.split(':').map(Number);
    return allHours.filter((h) => h > eh);
  }

  function getDisabledStartMinutes(hour: number) {
    if (!end.value) return [];
    const [eh, em] = end.value.split(':').map(Number);
    if (hour === eh) {
      return allMinutes.filter((m) => m > em);
    }
    return [];
  }

  function getDisabledStartSeconds(hour: number, min: number) {
    if (!end.value) return [];
    const [eh, em, es] = end.value.split(':').map(Number);
    if (hour === eh && min === em) {
      return allSeconds.filter((s) => s > es);
    }
    return [];
  }

  function getDisabledEndHours() {
    if (!start.value) return [];
    const [sh] = start.value.split(':').map(Number);
    return allHours.filter((h) => h < sh);
  }

  function getDisabledEndMinutes(hour: number) {
    if (!start.value) return [];
    const [sh, sm] = start.value.split(':').map(Number);
    if (hour === sh) {
      return allMinutes.filter((m) => m < sm);
    }
    if (hour < sh) {
      return allMinutes;
    }
    return [];
  }

  function getDisabledEndSeconds(hour: number, min: number) {
    if (!start.value) return [];
    const [sh, sm, ss] = start.value.split(':').map(Number);

    if (hour < sh) {
      return allSeconds;
    }

    if (hour === sh) {
      if (min < sm) {
        return allSeconds;
      }
      if (min === sm) {
        return allSeconds.filter((s) => s < ss);
      }
    }

    return [];
  }
</script>
<style scoped lang="less"></style>
