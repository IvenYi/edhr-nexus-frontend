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
      :format="format"
      :disabledDate="disabledStartDate"
      :disabledTime="disableStartTime"
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
      :format="format"
      :disabledDate="disableEndDate"
      :disabledTime="disableEndTime"
    />
  </div>
</template>

<script setup lang="ts">
  import { toRef, toRaw } from 'vue';
  import { Form } from 'ant-design-vue';
  import type { DatePickerProps } from 'ant-design-vue';
  import dayjs from 'dayjs';

  const props = defineProps<{
    props: DatePickerProps;
    modelValue?: string[];
    disabled: boolean;
  }>();

  const {
    props: { placeholder, valueFormat, allowClear, showTime, picker, format },
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
    if (v && endValue && dayjs(v).unix() > dayjs(endValue).unix()) {
      endValue = v;
    }
    triggerChange([v, endValue]);
    emit('change');
  }

  function changeEnd(v) {
    let endValue = v;
    // 确保end时间不小于start时间
    if (start.value && endValue) {
      if (dayjs(endValue).unix() < dayjs(start.value).unix()) {
        endValue = start.value;
      }
    }
    triggerChange([start.value, endValue]);
    emit('change');
  }

  function disabledStartDate(current) {
    if (end.value) {
      // 禁用晚于结束日期的日期
      return (
        current && dayjs(current).startOf('day').unix() > dayjs(end.value).startOf('day').unix()
      );
    }
    return false;
  }

  // 禁用结束日期的逻辑
  function disableEndDate(current) {
    if (start.value) {
      // 禁用早于开始日期的日期
      return (
        current && dayjs(current).startOf('day').unix() < dayjs(start.value).startOf('day').unix()
      );
    }
    return false;
  }

  // 禁用开始时间的逻辑
  const disableStartTime = (current) => {
    const currentDate = dayjs(current);
    const startDateTime = dayjs(start.value);
    const endDateTime = dayjs(end.value);
    if (props.props.picker == 'date') return {};
    if (!startDateTime || !endDateTime) {
      return {};
    }
    // 如果选择的是同一天，则需要限制时间
    if (currentDate.isSame(endDateTime, 'day')) {
      return {
        disabledHours: () => range(0, 24).filter((h) => h > endDateTime.hour()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === endDateTime.hour()) {
            return range(0, 60).filter((m) => m > endDateTime.minute());
          }
          return [];
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (selectedHour === endDateTime.hour() && selectedMinute === endDateTime.minute()) {
            return range(0, 60).filter((s) => s > endDateTime.second());
          }
          return [];
        },
      };
    }
    return {};
  };

  // 禁用结束时间的逻辑
  const disableEndTime = (current) => {
    const currentDate = dayjs(current);
    const startDateTime = dayjs(start.value);
    const endDateTime = dayjs(end.value);
    if (props.props.picker == 'date') return {};
    if (!startDateTime || !endDateTime) {
      return {};
    }
    if (currentDate.isSame(startDateTime, 'day')) {
      return {
        disabledHours: () => range(0, 24).filter((h) => h < startDateTime.hour()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === startDateTime.hour()) {
            return range(0, 60).filter((m) => m < startDateTime.minute());
          }
          return [];
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (selectedHour === startDateTime.hour() && selectedMinute === startDateTime.minute()) {
            return range(0, 60).filter((s) => s < startDateTime.second());
          }
          return [];
        },
      };
    }
    return {};
  };

  // 辅助函数：生成数字范围
  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
</script>
<style scoped lang="less"></style>
