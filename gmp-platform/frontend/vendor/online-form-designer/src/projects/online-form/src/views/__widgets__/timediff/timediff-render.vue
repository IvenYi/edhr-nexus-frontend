<template>
  <span class="nocode-read-only-text">{{ timeDiffLabel }}</span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import dayjs from 'dayjs';
  import TimeDiffFormatter from './TimeDIffFormatter';

  const props = defineProps<{
    widget: PaperWidget.TimeDiff;
    modelValueMulti: Array<any> | null;
  }>();

  const now = dayjs();
  const timeReg = /^\d{2}(:\d{2})*$/;
  const nowDate = now.format('YYYY-MM-DD');

  /**
   * 时间转化为日期时间
   * @param t
   */
  const convertToDateTime = (t: string): dayjs.Dayjs => {
    return timeReg.test(t) ? dayjs(nowDate + ' ' + t) : dayjs(t);
  };

  const timeDiffLabel = computed(() => {
    const { format, startDefault, endDefault } = props.widget;
    let startValue: dayjs.Dayjs | null = null;
    let endValue: dayjs.Dayjs | null = null;
    if (!props.modelValueMulti) return '--';

    const [t1, t2] = props.modelValueMulti;

    if (startDefault) {
      startValue = now;
    } else if (t1) {
      startValue = convertToDateTime(t1);
    } else {
      return '--';
    }

    if (endDefault) {
      endValue = now;
    } else if (t2) {
      endValue = convertToDateTime(t2);
    } else {
      return '--';
    }
    const seconds = endValue.diff(startValue) / 1000;

    return TimeDiffFormatter[format](seconds);
  });
</script>
