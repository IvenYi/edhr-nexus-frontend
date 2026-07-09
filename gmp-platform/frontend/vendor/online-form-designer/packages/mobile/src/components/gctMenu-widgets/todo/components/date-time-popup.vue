<template>
  <van-popup v-model:show="showPicker" position="bottom">
    <van-picker-group
      :tabs="['选择日期', '选择时间']"
      @confirm="onConfirm"
      @cancel="showPicker = false"
    >
      <van-date-picker v-model="compDateValue" :min-date="minDate" />
      <van-time-picker v-model="compTimeValue" :min-time="minTime" />
    </van-picker-group>
  </van-popup>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps<{
    show: boolean;
    value: string;
    min?: string;
  }>();

  const emit = defineEmits(['update:value', 'update:show']);
  const compDateValue = ref<string[]>([]);
  const compTimeValue = ref<string[]>([]);
  const minDate = computed(() => {
    return new Date(dayjs(props.min).format('YYYY-MM-DD'));
  });
  const minTime = computed(() => {
    const selectDateTime = `${compDateValue.value.join('-')} ${compTimeValue.value.join(':')}`;
    if (!props.min) {
      return dayjs().format('HH:mm');
    }
    if (dayjs(selectDateTime).diff(dayjs(props.min), 'minute') < 60) {
      return dayjs(props.min).format('HH:mm');
    } else if (dayjs(selectDateTime).diff(dayjs(props.min), 'hour') < 1) {
      return `${dayjs(props.min).format('HH')}:00`;
    } else return '';
  });

  const showPicker = computed({
    get() {
      return props.show;
    },
    set(value) {
      emit('update:show', value);
    },
  });

  onMounted(() => {
    compDateValue.value = props.value ? props.value.split(' ')[0].split('-') : [];
    compTimeValue.value = props.value ? props.value.split(' ')[1].split(':') : [];
  });

  const onConfirm = ([
    { selectedValues: dateSelectValues },
    { selectedValues: timeSelectValues },
  ]) => {
    console.log('confirm', dateSelectValues, timeSelectValues);
    emit('update:value', `${compDateValue.value.join('-')} ${compTimeValue.value.join(':')}`);
    showPicker.value = false;
  };
</script>
<style lang="less" scoped></style>
