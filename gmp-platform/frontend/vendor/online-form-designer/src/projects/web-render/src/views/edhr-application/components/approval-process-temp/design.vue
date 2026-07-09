<template>
  <div class="ks-column overflow-hidden">
    <div class="h54px bg-[#1a1d23] ks-row-middle overflow-hidden header">
      <LeftOutlined class="cursor-pointer" @click="onBack" />
      <div class="ks-col ell ml16px">
        {{ name }}
      </div>
      <div class="buttons">
        <template v-for="btn of bts" :key="btn.key">
          <div
            v-if="!bpmnReadonly || btn.key === 'close'"
            class="button ml-12px cursor-pointer"
            :class="[btn.className]"
            @click="handleEvent(btn.key)"
          >
            <i v-if="btn.icon" :class="['iconfont', btn.icon]"></i>
            {{ btn.label }}
          </div>
        </template>
      </div>
    </div>
    <div class="ks-col overflow-hidden">
      <BpmnSetting
        ref="DesignRef"
        :templateInfo="{ id, modelKey, modelName: name }"
        :designerType="DesignerType.BIZ_PROCESS_TEMPLATE"
        :actions="actions"
        :detailMode="detailMode"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref, h } from 'vue';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import BpmnSetting from '/@app-designer/views/online-form/components/bpmn-setting/index.vue';
  import { useBpmnSetting } from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/hooks/useBpmnSetting';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import { IModal } from '@gct/runtime';
  import { Modal } from 'ant-design-vue';
  import { DesignerType } from '/@/projects/app-designer/src/views/online-form/types/designer-type';
  import { ConfigType } from '/@/projects/page-designer/src/_kit/kit-eDHR/web/temp-audit-process/enums';

  const props = withDefaults(
    defineProps<{
      modal: IModal;
      id: string;
      refId: string;
      name: string;
      detailMode?: boolean;
      configType?: ConfigType;
      updateConfig?: Function;
      modelKey?: string;
      actions?: Array<{
        key: BpmnNodeTypeEnum;
        name: string;
        icon: string;
        color: string;
      }>;
    }>(),
    {
      detailMode: false,
      configType: undefined,
      actions: () => [
        {
          key: BpmnNodeTypeEnum.BpmnApproval,
          name: $t('sys.kit.edhr.approvalNode'),
          icon: 'iconfont:icon-shenpi1',
          color: '#3168ec',
        },
        {
          key: BpmnNodeTypeEnum.BpmnParallel,
          name: $t('sys.kit.edhr.parallelNode'),
          icon: 'iconfont:icon-binghangfenzhi',
          color: '#FF980E',
        },
        {
          key: BpmnNodeTypeEnum.BpmnMessage,
          name: $t('sys.appDesigner.msgNotification'),
          icon: 'iconfont:icon-xiaoxitongzhi',
          color: '#6931ec',
          data: {
            taskName: 'docControlSendTaskDelegate',
          },
        },
      ],
    },
  );

  const emit = defineEmits<{
    (e: 'btnEvent', key: boolean): void;
  }>();

  const { bpmnReadonly, hasPublishedVersion } = useBpmnSetting();

  const DesignRef = ref();

  const bts = [
    {
      key: 'save',
      className: 'save-btn',
      icon: 'icon-baocun1',
      label: $t('sys.saveText'),
    },
    {
      key: 'publish',
      className: 'btn-block',
      icon: 'icon-baocun1',
      label: $t('sys.publish'),
    },
    {
      key: 'close',
      className: 'btn-block',
      label: $t('sys.closeText'),
    },
  ];

  const isProcessFormBpmnNoSaved = computed(() => !hasPublishedVersion.value);

  async function handleEvent(key) {
    if (key === 'save') {
      await DesignRef.value?.handleSave();
      props.updateConfig && (await props.updateConfig());
    } else if (key === 'publish') {
      await DesignRef.value?.handlePublish();
      props.updateConfig && (await props.updateConfig());
    } else if (key === 'close') {
      await props.modal.dismiss();
    }
    emit('btnEvent', key);
  }

  async function onBack() {
    const result = await DesignRef.value?.checkHasUnsaved();
    if (result) {
      const contentMsg = isProcessFormBpmnNoSaved.value
        ? $t('sys.edhr.hasUnsavedDataNeedPublish')
        : $t('sys.hasNoSavedDataTips');
      const okBtnText = isProcessFormBpmnNoSaved.value
        ? $t('sys.edhr.savePublishAndExit')
        : $t('sys.cardDesign.back_info.saveAndExit');
      const cfg = Modal.confirm({
        title: $t('sys.hasNoSavedDataTitle'),
        content: h('div', { class: 'unsaved-modal' }, [
          h('span', contentMsg),
          h('div', { class: 'continue-edit' }, [
            h(
              'button',
              {
                type: 'button',
                onClick: () => cfg.destroy(),
              },
              $t('sys.app.continueEdit'),
            ),
          ]),
        ]),
        okText: okBtnText,
        cancelText: $t('sys.cardDesign.back_info.notSave'),
        onOk: async () => {
          if (isProcessFormBpmnNoSaved.value) {
            await DesignRef.value?.handlePublish({ silent: true });
          } else {
            await DesignRef.value?.handleSave();
          }
          props.modal.dismiss({ params: { needRefresh: true } });
        },
        onCancel: () => {
          cfg.destroy();
          props.modal.dismiss();
        },
      });
    } else {
      props.modal.dismiss();
    }
  }
</script>
<style lang="less" scoped>
  .header {
    padding: 0 16px;
    color: #fff;

    .buttons {
      display: flex;
      position: absolute;
      top: 0;
      right: 16px;
      align-items: center;
      height: 30px;
      margin: 12px 0;
    }

    .button {
      display: flex;
      align-items: center;
      height: 26px;
      padding: 0 12px;
      transition: all 0.3s;
      border-radius: 4px;
      background: transparent;
      color: #fff;
      font-size: 12px;
      line-height: 1em;

      i {
        display: flex;
        margin-right: 6px;
        font-size: 12px;
      }

      &:hover {
        border-color: #fff;
      }

      &.save-btn.FormDesign,
      &.save-btn.BaseButton {
        border: 1px solid var(--ant-primary-color);
        background-color: var(--ant-primary-color);

        &:hover {
          border-color: var(--ant-primary-color-hover);
          background: var(--ant-primary-color-hover);
        }
      }

      &.save-btn {
        border: 1px solid #444;
        background: #444;

        &:hover {
          border-color: var(--ant-primary-color-hover);
          background: var(--ant-primary-color-hover);
        }
      }

      &.btn-block {
        border: 1px solid #444;
        background: #444;

        &:hover {
          border-color: var(--ant-primary-color-hover);
          background: var(--ant-primary-color-hover);
        }
      }
    }
  }
</style>
<style lang="less">
  .unsaved-modal {
    .continue-edit {
      position: absolute;
      bottom: 16px;

      button {
        border: 0;
        background-color: transparent;
        color: var(--ant-primary-color);
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
</style>
