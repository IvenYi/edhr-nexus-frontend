<template>
  <a-popover :title="t('sys.timezone')" trigger="click">
    <template #content>
      <a-select
        style="width: 100%"
        :value="timezoneStore.getTimezone"
        @change="handleChangeTimezone"
      >
        <a-select-option v-for="UTC in options" :value="UTC">{{ UTC }}</a-select-option>
      </a-select>
    </template>
    <field-time-outlined />
  </a-popover>
</template>

<script setup lang="ts">
  import { FieldTimeOutlined } from '@ant-design/icons-vue';
  import { useTimezoneStore } from '/@/store/modules/timezone';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const timezoneStore = useTimezoneStore();
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
    timezoneStore.setTimezone(val);
  };
</script>

<style lang="less" scoped></style>
