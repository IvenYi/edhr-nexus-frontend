<template>
  <van-picker-group :tabs="['选择日期', '选择时间']" @confirm="onConfirm" @cancel="onCancel">
    <van-date-picker v-model="currentDateTime.compDateValue" v-bind="datePickerAttr" />
    <van-time-picker v-model="currentDateTime.compTimeValue" v-bind="timePickerAttr" />
  </van-picker-group>
</template>

<script lang="ts" setup name="date-time-picker">
  import { computed, onMounted } from 'vue';
  import dayjs from 'dayjs';

  const DATE_SEPARATOR = '-';
  const TIME_SEPARATOR = ':';
  const FORMATE = 'YYYY-MM-DD HH:mm:ss';

  const props = defineProps<{
    modelValue: string;
  }>();

  const emit = defineEmits<{
    (e: 'cancel', showPicker: boolean): void;
    (e: 'confirm', value: string, options?: object[]): void;
    (e: 'update:modelValue', value: string): void;
  }>();

  const fieldValue = computed({
    get() {
      return props.modelValue ?? '';
    },
    set(val: string) {
      emit('update:modelValue', val);
    },
  });

  const currentDateTime = computed(() => {
    if (!fieldValue.value) {
      return {
        showDateTimeValue: fieldValue.value,
        compDateValue: [],
        compTimeValue: [],
      };
    }

    const datetime = dayjs(fieldValue.value).format(FORMATE);
    const date = dayjs(fieldValue.value).format(`YYYY${DATE_SEPARATOR}MM${DATE_SEPARATOR}DD`);
    const time = datetime.replace(date, '');
    return {
      showDateTimeValue: datetime,
      compDateValue: date.split(DATE_SEPARATOR),
      compTimeValue: time.split(TIME_SEPARATOR),
    };
  });

  const datePickerAttr = computed(() => {
    return {};
  });

  const timePickerAttr = computed(() => {
    return {
      columnsType: ['hour', 'minute', 'second'],
    };
  });

  function onConfirm([{ selectedValues: dateSelectValues }, { selectedValues: timeSelectValues }]) {
    const datetime = dayjs(
      `${dateSelectValues.join(DATE_SEPARATOR)} ${timeSelectValues.join(TIME_SEPARATOR)}`,
    ).format(FORMATE);
    emit('update:modelValue', datetime);
    emit('confirm', datetime, []);
  }

  function onCancel() {
    emit('cancel', false);
  }

  onMounted(() => {
    console.log(currentDateTime.value, 'currentDateTime');
  });
</script>
