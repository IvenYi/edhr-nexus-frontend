<template>
  <div :class="['form-ins-btns']">
    <VantButton
      v-for="btn in basicButtons"
      :key="btn.key"
      :title="btn.title"
      :loading="btn.loading"
      class="ml-12px"
      @click="handleBuiltinButtonClick(btn.key)"
      :icon="btn.icon"
      :hasIcon="showIcon"
    />
  </div>
  <!-- <div :class="['form-ins-btns']">
    <div
      class="btn-item"
      v-for="btn in basicButtons"
      :key="btn.key"
      @click="handleBuiltinButtonClick(btn.key)"
    >
      <gct-icon :value="btn.icon" color="#1A1D23" :size="16" />
      <span class="btn-title">{{ btn.title }}</span>
    </div>
  </div> -->
</template>

<script lang="ts" setup name="form-ins-btns">
  import { IBasicInfoItem } from '@gct/nocode-base';
  import { GctDialog } from '@mobile/utils/dialog';
  import { GctPopup } from '@mobile/utils/popup';
  import FlowPathModal from './flow-path-modal.vue';
  import OperationLogPopup from './operation-log/operation-log-popup.vue';
  import VantButton from '../../base/base-button.vue';
  import { openFormInfoPopup } from './form-inst-info/index';

  const props = withDefaults(
    defineProps<{
      basicIns?: IBasicInfoItem;
      basicButtons: any;
      data?: any;
      /** 显示icon */
      showIcon?: boolean;
    }>(),
    {
      showIcon: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
    (e: 'check-list-click'): void;
  }>();

  function handleBuiltinButtonClick(key) {
    if (key === 'actionLog') {
      if (!props.basicIns) {
        return;
      }
      GctPopup.open(OperationLogPopup, {
        instanceId: props.basicIns!.key,
        tmplId: props.basicIns!.tid,
        modelKey: props.basicIns.modelKey,
      });
    } else if (key === 'flowPath') {
      GctDialog.open(FlowPathModal, {
        basicIns: props.basicIns,
        beforeClose: (data) => {
          console.log('beforeClose', data);
        },
      });
    } else if (key === 'checkList') {
      emit('check-list-click');
    } else if (key === 'moreInfo') {
      openFormInfoPopup(props.data);
    }
  }
</script>

<style lang="less" scoped>
  .form-ins-btns {
    display: flex;
    align-items: center;

    .btn-item {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding-right: 20px;
      position: relative;
      cursor: pointer;
    }

    .btn-item ~ .btn-item {
      padding: 0 20px;
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        height: 16px;
        width: 1px;
        background-color: #e0e3eb;
      }
    }
    .btn-title {
      margin-left: 6px;
      font-size: 14px;
      color: #1a1d23;
      line-height: 20px;
    }
  }

  :deep(.van-button) {
    padding: 0 13px;
  }
</style>
