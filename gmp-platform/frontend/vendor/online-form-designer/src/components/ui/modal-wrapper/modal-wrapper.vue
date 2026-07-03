<template>
  <div :class="['modal-wrapper', _options.height && 'modal-wrapper--has-height']">
    <div class="modal-wrapper__content">
      <slot></slot>
    </div>
    <div v-if="showFooter" class="modal-wrapper__footer">
      <a-button v-if="_options.showCancelBtn" @click="onCancel">{{ _options.cancelText }}</a-button>
      <a-button v-if="_options.showOkBtn" :disabled="disabledOk" type="primary" @click="onOk">
        {{ _options.okText }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="modal-wrapper">
  import { IModal, IModalData, IModalOptions } from '@gct/runtime';
  import { inject, watch, computed } from 'vue';

  /** 模态控制器 */
  const modal = inject('modal') as IModal;
  if (!modal) {
    console.error('modal不存在');
  }

  const props = withDefaults(
    defineProps<{
      opts?: IModalOptions;
      disabledOk?: boolean;
      doCancel?: () => Promise<boolean>;
      doOk?: () => Promise<false | IModalData>;
    }>(),
    {
      opts: () => ({}),
    },
  );

  /** 是否显示底部按钮 */
  const showFooter = computed(() => {
    return props.opts.showFooter !== false;
  });

  const _options = computed(() => {
    return {
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancelText'),
      showOkBtn: true,
      showCancelBtn: true,
      ...props.opts,
      showFooter: false,
    } as IModalOptions;
  });

  watch(
    () => _options.value,
    (val) => {
      if (val) {
        modal.setOptions!(val);
      }
    },
    { immediate: true, deep: true },
  );

  /** 触发取消模态 */
  const onCancel = async () => {
    if (props.doCancel) {
      const allowClose = await props.doCancel();
      if (!allowClose) {
        return;
      }
    }
    modal.dismiss();
  };

  /** 触发确认模态 */
  const onOk = async () => {
    if (props.doOk) {
      const data = await props.doOk();
      if (!data) {
        return;
      }
      modal.dismiss(data);
    }
  };
</script>

<style lang="less" scoped>
  .modal-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;

    // 有高度的时候content撑满容器
    &--has-height {
      .modal-wrapper__content {
        height: 1px;
      }
    }

    &__content {
      flex-grow: 1;
    }
    &__footer {
      flex-shrink: 0;
      flex-grow: 0;
      border-top: 1px solid #e0e3eb;
      height: 64px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      :deep(.ant-btn) {
        margin-right: 16px;
        &.ant-btn-primary[disabled] {
          background: #bfd8f2;
          border-color: #bfd8f2 !important;
          color: #ffffff;
        }
      }
    }
  }
</style>
