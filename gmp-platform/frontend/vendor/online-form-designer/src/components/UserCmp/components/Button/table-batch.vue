<template>
  <span class="mr-8px cursor-pointer selected-row" @click="openSelectRows">
    {{$t('sys.batchOperation.selected')}}
    <a>{{ selectRows?.length }}</a>
    {{$t('sys.batchOperation.lines')}}
    <close-circle-filled style=" fill: #000;color: #797a7d" @click="clearSelect" />
  </span>
  <template v-if="props.buttons.length"></template>
  <a-button
    v-for="(item, idx) in props.buttons"
    :key="idx"
    class="mr-8px"
    @click="handleMenuClick(item)"
  >
    {{ item.name }}
  </a-button>
</template>

<script setup lang="ts" name="table-batch">
  import { toRaw, createVNode, computed } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ButtonTypeEnum, PlatformEnum } from '../../constant/interface';
  import type { IButtonProps } from '../../types/index.d';

  const { t } = useI18n();

  interface Props {
    buttons?: IButtonProps[];
    selectRows?: any[];
    /** 平台类型 */
    platformType: PlatformEnum;
  }
  const props = defineProps<Props>();

  const emit = defineEmits(['notify', 'clearSelect', 'openSelect']);

  const notifyCallback = (event, btnInfo) => {
    emit('notify', {
      key: event.key,
      btnInfo: toRaw(btnInfo),
      recordInfo: toRaw(props.selectRows),
    });
  };

  const handleMenuClick = (event) => {
    if (event && event.key) {
      const btnInfo = props.buttons?.find((btn) => btn.key === event.key);
      if (
        btnInfo?.tips?.batch &&
        btnInfo.key !== ButtonTypeEnum.ResetPwd &&
        btnInfo.key !== ButtonTypeEnum.ResetSignPwd
      ) {
        Modal.confirm({
          title:
            typeof btnInfo?.tips?.batch === 'function'
              ? btnInfo?.tips?.batch?.(props.platformType)
              : btnInfo?.tips?.batch,
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          async onOk() {
            notifyCallback(event, btnInfo);
          },
          onCancel() {},
        });
      } else {
        notifyCallback(event, btnInfo);
      }
    }
  };

  const clearSelect = () => {
    emit('clearSelect');
  };

  const openSelectRows = () => {
    emit('openSelect');
  };
</script>

<style scoped lang="less">
  .selected-row {
    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
