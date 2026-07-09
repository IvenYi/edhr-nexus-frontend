<template>
  <div class="timezone-box" ref="TimezonePickerRef">
    <a-select
      class="w-120px"
      :get-popup-container="() => TimezonePickerRef"
      :value="value"
      @change="handleChangeTimezone"
    >
      <a-select-option v-for="(UTC, index) in options" :key="UTC + '_' + index" :value="UTC">{{
        UTC
      }}</a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useTimezoneStore } from '/@/store/modules/timezone';

  const TimezonePickerRef = ref();
  const timezoneStore = useTimezoneStore();
  const value = ref(timezoneStore.getTimezone);

  const options = [
    'UTC+00:00',
    'UTC+01:00',
    'UTC+02:00',
    'UTC+03:00',
    'UTC+04:00',
    'UTC+05:00',
    'UTC+06:00',
    'UTC+07:00',
    'UTC+08:00',
    'UTC+09:00',
    'UTC+10:00',
    'UTC+11:00',
    'UTC+12:00',
    'UTC-01:00',
    'UTC-02:00',
    'UTC-03:00',
    'UTC-04:00',
    'UTC-05:00',
    'UTC-06:00',
    'UTC-07:00',
    'UTC-08:00',
    'UTC-09:00',
    'UTC-10:00',
    'UTC-11:00',
  ];

  const handleChangeTimezone = (val) => {
    value.value = val;
  };

  const setTimezone = () => {
    timezoneStore.setTimezone(value.value);
  };

  const reload = () => {
    value.value = timezoneStore.getTimezone;
  };

  defineExpose({ setTimezone, reload });
</script>

<style lang="less" scoped></style>
