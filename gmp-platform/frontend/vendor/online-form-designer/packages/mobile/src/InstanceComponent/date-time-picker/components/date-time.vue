<template>
  <van-tabs shrink line-width="20px" v-model:active="tabName" class="gct-tabs">
    <van-tab :title="currentValue.selectDate" name="date">
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
      >
        <template #text="date"> {{ date.text }} </template>
      </van-calendar>
    </van-tab>
    <van-tab :title="currentDate?.split(' ')?.[1]" name="time">
      <van-time-picker
        @change="updateDate"
        v-model="currentValue.selectTime"
        title="选择时间"
        :show-toolbar="false"
        class="pt16px"
        :columnsType="columnsType"
        :min-time="minTime"
        :max-time="maxTime"
      />
    </van-tab>
  </van-tabs>
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
  const currentValue = reactive({
    selectDate: '',
    selectTime: [],
  });

  const maxTime = computed(() => {
    if (props.maxDate) {
      const format = props.valueFormat?.split(' ')?.[1];
      if (currentDate.value?.split(' ')?.[0] == dayjs(props.maxDate).format('YYYY-MM-DD')) {
        const time = dayjs(props.maxDate).format(format);
        return time;
      }
      return undefined;
    } else {
      return undefined;
    }
  });

  const minTime = computed(() => {
    if (props.minDate) {
      const format = props.valueFormat?.split(' ')?.[1];
      if (currentDate.value?.split(' ')?.[0] == dayjs(props.minDate).format('YYYY-MM-DD')) {
        const time = dayjs(props.minDate).format(format);
        return time;
      }
      return undefined;
    } else {
      return undefined;
    }
  });
  /**当前所在月份 */
  // const currentDate = ref(new Date());

  // const startX = ref(0);
  const tabName = ref('date');
  const calendarRef = ref(null);
  /**当前所在月份 */
  const currentDate = computed(() => {
    if (!currentValue.selectDate) return;
    return dayjs(`${currentValue.selectDate} ${currentValue.selectTime.join(':')}`).format(
      props.valueFormat,
    );
  });
  function selectDay(date) {
    currentValue.selectDate = dayjs(date).format('YYYY-MM-DD');
    tabName.value = 'time';
    updateDate();
  }
  function updateDate() {
    emit('update:modelValue', currentDate.value);
  }
  // const handleTouchStart = (e: TouchEvent) => {
  //   // 记录开始触摸时的 X 坐标
  //   startX.value = e.touches[0].clientX;
  // };
  // const handleTouchEnd = (e: TouchEvent) => {
  //   const endX = e.changedTouches[0].clientX;
  //   const diff = endX - startX.value;
  //   const threshold = 50; // 滑动阈值

  //   if (diff > threshold) {
  //     // 向右滑 动：切换到上一个月
  //     // console.log('向右滑动');
  //     currentDate.value = changeMonth(currentDate.value, -1);
  //   } else if (diff < -threshold) {
  //     // 向左滑动：切换到下一个月
  //     // console.log('向左滑动');
  //     currentDate.value = changeMonth(currentDate.value, 1);
  //   }
  //   calendarRef.value!.scrollToDate(currentDate.value);
  // };

  // function changeMonth(date: Date, offset: number) {
  //   const newDate = new Date(date);
  //   newDate.setMonth(newDate.getMonth() + offset);
  //   return newDate;
  // }
  onMounted(async () => {
    await nextTick();
    const defaultDate = dayjs(props.modelValue || undefined);
    calendarRef.value!.reset(defaultDate.toDate());
    const displayDate = defaultDate.format(props.displayFormat);
    currentValue.selectDate = displayDate.split(' ')[0];
    currentValue.selectTime = displayDate.split(' ')?.[1]?.split(':');
    emit('update:modelValue', currentDate.value);
  });
</script>
<style lang="less">
  .gct-tabs {
    .van-tabs__nav {
      padding: 12px;
      padding-top: 0;
    }

    .van-tabs__wrap {
      border-bottom: 1px solid #e0e3eb;
    }

    .van-tabs__line {
      bottom: 12px;
    }

    .van-calendar__header {
      box-shadow: none;
    }

    .gct-calendar-month {
      color: var(--van-primary-color);
      font-weight: 400;
    }
  }
</style>
