<template>
  <div :class="['device-select', `device-select--${styleMode}`]">
    <a-dropdown overlayClassName="device-select__dropdown" :trigger="trigger">
      <template #overlay>
        <DeviceTable
          :showColumns="showColumns"
          :selectedId="modelValue"
          :height="400"
          :pagerCount="3"
          @selected-change="onSelectedChange"
        />
      </template>
      <a-button :type="styleMode === 'link' ? 'text' : undefined">
        <template v-if="modelValue">
          {{ selectedRow?.name ?? modelValue }}
        </template>
        <span v-else class="device-select__placeholder">{{ $t('sys.onlineForm.selectDevice') }}</span>
        <DownOutlined style="line-height: 22px" />
      </a-button>
    </a-dropdown>
  </div>
</template>

<script lang="ts" setup name="device-select">
  import { onMounted, ref } from 'vue';
  import DeviceTable from './device-table.vue';
  import { DeviceInterconnectionResponse } from '/@/apis/gct-platform/model';
  import { getDeviceInterconnectionInfo } from '/@/apis/gct-platform/DeviceInterconnectionController';
  import { DeviceLink } from '@gct/nocode-base';
  import { Form } from 'ant-design-vue';

  const formItemContext = Form.useInjectFormItemContext();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      styleMode: 'button' | 'link';
      trigger?: Array<'click' | 'hover' | 'contextmenu'>;
      showColumns?: Array<keyof DeviceLink.IDeviceLinkParams>;
    }>(),
    {
      modelValue: undefined,
      styleMode: 'button',
      showColumns: () => ['name', 'key'] as any,
      trigger: () => ['click'],
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'selected-change', value: DeviceInterconnectionResponse): void;
  }>();

  const selectedRow = ref<DeviceInterconnectionResponse>();

  const onSelectedChange = (row: DeviceInterconnectionResponse) => {
    selectedRow.value = row;
    emit('update:modelValue', row.id!);
    emit('selected-change', row);
    // 触发表单字段变更校验更新
    formItemContext.onFieldChange();
  };

  onMounted(async () => {
    if (props.modelValue) {
      const res = await getDeviceInterconnectionInfo({ id: props.modelValue });
      selectedRow.value = res;
    }
  });
</script>

<style lang="less" scoped>
  .device-select {
    width: 100%;

    :deep(.ant-btn) {
      width: 100%;
      color: #1a1d23;
    }

    &__placeholder {
      color: #c6c6c6;
    }

    // 按钮样式下特殊样式
    &--button {
      :deep(.ant-btn) {
        display: flex;
        place-content: center space-between;
        padding-right: 11px;
        // text-align: right;
        padding-left: 11px;
      }
    }

    // 链接样式下特殊样式
    &--link {
      :deep(.ant-btn) {
        padding: 0;
        text-align: left;

        &:hover {
          border-color: transparent;
          background: transparent;
        }
      }
    }
  }
</style>

<style lang="less">
  .device-select__dropdown {
    padding: 6px 0;

    .ant-dropdown-content {
      width: 500px;
      padding: 12px;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 4px 16px 0 rgb(0 0 0 / 10%);

      :deep(.vxe-pager) {
        height: 48px !important;
      }
    }
  }
</style>
