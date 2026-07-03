<template>
  <!-- {{ currentDate }} -->
  <van-time-picker
    v-model="currentDate"
    title="选择时间"
    :show-toolbar="false"
    class="pt16px"
    :columnsType="columnsType"
    :min-time="minDate"
    :max-time="maxDate"
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
  /**当前所在月份 */
  const currentDate = computed({
    get() {
      return dayjs(props.modelValue ? `2021-01-01 ${props.modelValue}` : undefined)
        .format(props.displayFormat)
        .split(':');
    },
    set(value) {
      emit('update:modelValue', dayjs(`2021-01-01 ${value.join(':')}`).format(props.valueFormat));
    },
  });

  onMounted(async () => {
    await nextTick();
    emit(
      'update:modelValue',
      dayjs(props.modelValue ? `2021-01-01 ${props.modelValue}` : undefined).format(
        props.valueFormat,
      ),
    );
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

    // .van-calendar__month-title {
    //   display: none;
    // }

    .gct-calendar-month {
      color: var(--van-primary-color);
      font-weight: 400;
    }
  }
</style>
