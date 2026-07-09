<template>
  <van-calendar
    ref="calendarRef"
    switch-mode="month"
    :show-subtitle="true"
    :show-mark="false"
    :show-title="false"
    :poppable="false"
    :show-confirm="false"
    row-height="48px"
    @select="selectDay"
    :maxDate="maxDate"
    :minDate="minDate"
    v-if="displayFormat === 'YYYY-MM-DD'"
  >
    <template #text="date"> {{ date.text }} </template>
  </van-calendar>
  <van-date-picker
    v-else
    v-model="currentDate"
    :maxDate="maxDate"
    :minDate="minDate"
    :columnsType="columnsType"
    :show-toolbar="false"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps<{
    modelValue?: string;
    /**日期样式显示格式 默认 YYYY-MM-DD HH:mm:ss*/
    displayFormat?: string;
    columnsType: string[];
    /**日期数据值格式 默认 YYYY-MM-DD HH:mm:ss*/
    valueFormat?: string;
    maxDate?: Date;
    minDate?: Date;
  }>();
  const emit = defineEmits(['update:modelValue']);
  const calendarRef = ref(null);
  /**当前所在月份 */
  const currentDate = computed({
    get() {
      return dayjs(props.modelValue || undefined)
        .format(props.displayFormat)
        .split('-');
    },
    set(value) {
      emit('update:modelValue', dayjs(value.join('-')).format(props.valueFormat));
    },
  });
  function selectDay(date) {
    emit('update:modelValue', dayjs(date).format(props.valueFormat));
  }
  onMounted(async () => {
    await nextTick();
    if (props.displayFormat === 'YYYY-MM-DD' && props.modelValue) {
      calendarRef.value!.reset(dayjs(props.modelValue).toDate());
    }
    emit('update:modelValue', dayjs(props.modelValue || undefined).format(props.valueFormat));
  });
</script>
<style lang="less">
  .van-calendar__header {
    box-shadow: none;
  }

  .gct-calendar-month {
    color: var(--van-primary-color);
    font-weight: 400;
  }
</style>
