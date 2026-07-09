<template>
  <div class="device-field-status">
    <div v-for="(item, i) in list" class="device-field-status__item" :key="i">
      <div class="device-field-status__item-label">{{ item.label }}：</div>
      <div class="device-field-status__item-value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup name="device-field-status">
  import { DeviceLink, DeviceParamsTypeTitle } from '@gct/nocode-base';
  import { computed, ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      value?: string;
      deviceParams: DeviceLink.IDeviceLinkParams;
    }>(),
    {
      value: undefined,
    },
  );

  const list = computed(() => {
    return [
      {
        label: $t('sys.edhr.field.code'),
        value: props.deviceParams.code,
      },
      {
        label: $t('sys.name'),
        value: props.deviceParams.name,
      },
      {
        label: $t('sys.tableColumnType'),
        value: $t(DeviceParamsTypeTitle[props.deviceParams.type]),
      },
      {
        label: $t('sys.notes'),
        value: props.deviceParams.remark ?? '--',
      },
    ];
  });
</script>

<style lang="less" scoped>
  .device-field-status {
    max-width: 300px;
    max-height: 280px;
    padding: 12px;
    overflow: auto;
    &__item {
      font-weight: 400;
      font-size: 12px;
      display: flex;
      &-label {
        color: #5a5f6b;
      }

      &-value {
        color: #1a1d23;
      }
    }
    &__item ~ &__item {
      margin-top: 8px;
    }
  }
</style>
