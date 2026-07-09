<template>
  <div class="template-designer-new ks-column h100%">
    <templateHeader
      v-model:step="step"
      :model="modelInfo"
      :form="tmplInfo"
      @on-save="onSaveConfig"
      @on-next="onNext"
      @on-back="onBack"
      @on-save-basic="saveBasicInfo"
    />
    <div class="template-designer-new-main ks-col overflow-hidden">
      <templateBasicInfo ref="tmplInfoRef" v-show="step === 1" @on-save="saveBasicInfo" />
      <templateConfig ref="templateConfigRef" v-show="step === 2" :isEdit="props?.data?.edit" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, createVNode, h, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import templateBasicInfo from './design/template-basic-info.vue';
  import templateConfig from './design/template-config.vue';
  import templateHeader from './design/template-header.vue';
  import { IModal } from '@gct/runtime';
  import { Button, Modal, message } from 'ant-design-vue';
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';

  import { useDesigner } from './hook/useDesigner';

  const { t } = useI18n();

  const props = defineProps<{
    modal: IModal;
    data: Object | undefined;
    modelInfo: Object;
  }>();

  const { tmplInfo, init, saveBasic, hasChanged, basicChanged, initConfig } = useDesigner();

  const tmplInfoRef = ref();
  const templateConfigRef = ref();
  const step = ref(1);
  const needFresh = ref(false);

  onMounted(async () => {
    if (props.data?.id) {
      step.value = 2;
    }
    console.log(props.data);

    init(props.modelInfo, props.data?.id);
  });

  const onBack = () => {
    if (basicChanged.value || hasChanged.value) {
      const cfg = Modal.confirm({
        title: t('sys.designView.saveConfirm.title'),
        icon: createVNode(ExclamationCircleFilled),
        mask: false,
        getContainer: () => document.querySelector('.template-designer-new-heander'),
        content: h('div', {}, [
          h('span', {}, t('sys.designView.saveConfirm.content')),
          h(
            Button,
            { type: 'link', class: 'continue-btn', onClick: () => cfg.destroy() },
            t('sys.app.continueEdit'),
          ),
        ]),
        cancelText: t('sys.designView.saveConfirm.cancel'),
        okText: t('sys.designView.saveConfirm.confirm'),
        wrapClassName: 'comfirm-dialog',
        onCancel: () => {
          // needFresh.value = false;
          closeModal();
        },
        onOk: async () => {
          try {
            if (basicChanged.value) {
              await saveBasicInfo(!hasChanged.value);
              needFresh.value = true;
            }
            if (hasChanged.value) {
              await onSaveConfig();
            }
            closeModal();
          } catch (error) {
            cfg.destroy();
          }
        },
      });
    } else {
      closeModal();
    }
  };

  const onNext = async () => {
    await tmplInfoRef.value?.validate();
    if (basicChanged.value) {
      const cfg = Modal.confirm({
        content: t('sys.designView.saveConfirm.next'),
        icon: createVNode(ExclamationCircleFilled),
        mask: false,
        getContainer: () => document.querySelector('.template-designer-new-heander'),
        cancelText: t('sys.cancel'),
        okText: t('sys.designView.saveConfirm.saveAndContinue'),
        wrapClassName: 'comfirm-next-dialog',
        onCancel: () => {},
        onOk: async () => {
          cfg.destroy();
          await saveBasicInfo();
          step.value = 2;
          needFresh.value = true;
          initConfig();
        },
      });
    } else {
      step.value = 2;
    }
  };

  const onSaveConfig = async (loading?) => {
    try {
      await templateConfigRef.value?.save();
      loading && (loading.value = false);
      needFresh.value = true;
      closeModal();
    } catch (error) {
      loading && (loading.value = false);
      step.value = 2;
      return Promise.reject();
    }
  };

  const saveBasicInfo = async (msg = true) => {
    await tmplInfoRef.value?.validate();
    await saveBasic();
    basicChanged.value = false;
    needFresh.value = true;
    if (msg) message.success(t('sys.saveSuccess'));
  };

  const closeModal = () => {
    props.modal.dismiss({ ok: true, params: { refresh: needFresh.value } });
  };
</script>
<style lang="less" scoped>
  .max140px {
    max-width: 140px;
  }
  .continue-btn {
    :deep(&.ant-btn) {
      position: absolute;
      left: 38px;
      bottom: 16px;
      padding: 0;
      height: 24px;
    }
  }
  :deep(.comfirm-dialog.ant-modal-wrap) {
    .ant-modal-confirm {
      position: absolute;
      left: 17px;
      top: 62px;
    }
  }
  :deep(.comfirm-next-dialog.ant-modal-wrap) {
    .ant-modal-confirm {
      position: absolute;
      right: 16px;
      top: 62px;
      width: 250px !important;
      .ant-modal-body {
        .ant-modal-confirm-content {
          margin-top: 0 !important;
          color: #212528;
        }
      }
    }
  }
</style>
