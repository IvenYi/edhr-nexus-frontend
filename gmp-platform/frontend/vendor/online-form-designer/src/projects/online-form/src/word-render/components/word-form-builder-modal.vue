<template>
  <a-drawer
    :visible="visible"
    width="1200px"
    :wrapClassName="`word-form-builder-modal-wrapper  ${isViewPage && 'show-basic-info'}`"
    :keyboard="false"
    v-bind="props.options"
    @close="handleAction({ type: 'Cancel', title: $t('sys.cancelText') })"
  >
    <word-render-fill
      v-if="visible"
      ref="operatorRef"
      class="paas-si-form-builder-container"
      :selfId="selfId"
      :modelKey="modelKey"
      :materialNo="materialNo"
      in-drawer
      :isViewPage="isViewPage"
      :keep="keep"
      :paramExtraProps="paramExtraProps"
      @btn-click-callback="handleAction"
    />
  </a-drawer>
</template>

<script setup lang="ts" name="word-form-builder-modal">
  import { ref } from 'vue';
  import WordRenderFill from './word-render-fill.vue';
  import type { ModalProps } from 'ant-design-vue';

  const props = defineProps<{
    /** 在线表单实例id */
    selfId: string;
    /** 批次号 */
    materialNo?: string;
    /** 模型 key */
    modelKey: string;
    /** 是否是查看页面 */
    isViewPage?: boolean;
    /** 传入的参数（接口使用） */
    paramExtraProps?: Record<string, any>;
    /** 点击按钮后是否直接关闭弹框 */
    keep: boolean;
    options?: ModalProps;
    callback?: any;
  }>();

  const visible = ref<boolean>(true);

  const handleAction = (btn) => {
    doButtonAction(btn);
  };

  const doButtonAction = (btn) => {
    doCloseModal(btn);
    doCallback(btn);
  };

  /** 调用关闭弹框方法 */
  const doCloseModal = (btn) => {
    // keep 为true的时候不能关闭窗口
    if (btn.type === 'Cancel' || !props.keep) {
      visible.value = false;
    }
  };

  /** 调用回调方法 */
  const doCallback = (btn) => {
    if (props.callback && typeof props.callback === 'function') {
      props.callback(btn);
    }
  };
</script>

<style lang="less" scoped>
  .paas-si-form-builder-modal-full-screen {
    position: absolute;
    top: 0;
    right: 48px;
    padding: 16px 8px;
    color: #212528;
    font-size: 16px;
    line-height: 1;
    line-height: 22px;
    cursor: pointer;
  }
</style>

<style lang="less">
  .word-form-builder-modal-wrapper {
    .ant-drawer-content {
      > .ant-drawer-wrapper-body {
        > .ant-drawer-header,
        > .ant-drawer-footer {
          flex-shrink: 0;
          padding: 16px;
        }

        > .ant-drawer-header {
          border-bottom: 1px solid #e0e3ea;

          .ant-drawer-close {
            color: #212528;
          }
        }

        > .ant-drawer-footer {
          display: flex;
          justify-content: right;
          padding: 12px 16px;
          border-top: 1px solid #e0e3ea;
        }

        > .ant-drawer-header .ant-drawer-title {
          color: #000;
          font-weight: 600;
        }

        > .ant-drawer-body {
          display: flex;
          flex-grow: 1;
          padding: 0;
          background-color: #e6e9ef;

          .paas-si-form-builder-container {
            flex: 1;
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
    }

    &.show-basic-info {
      .ant-drawer-content {
        > .ant-drawer-wrapper-body {
          > .ant-drawer-body {
            padding: 0 16px;
            background-color: #fff;
          }
        }
      }
    }
  }
</style>
