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
      <ApprovalDesigner
        ref="DesignRef"
        :templateInfo="{ id }"
        :designerType="DesignerType.BIZ_PROCESS_TEMPLATE"
        :actions="actions"
        :detailMode="detailMode"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { LeftOutlined } from '@ant-design/icons-vue';
  import ApprovalDesigner from '/@app-designer/views/online-form/components/bpmn-setting/index.vue';
  import { useBpmnSetting } from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/hooks/useBpmnSetting';
  import { computed, ref, h } from 'vue';
  import { IModal } from '@gct/runtime';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import { Modal } from 'ant-design-vue';
  import { DesignerType } from '/@/projects/app-designer/src/views/online-form/types/designer-type';

  const props = defineProps<{
    modal: IModal;
    id: string;
    name: string;
    detailMode?: boolean;
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

  const actions = [
    {
      key: BpmnNodeTypeEnum.BpmnApproval,
      name: $t(`sys.bpmn.nodeType.bpmnApproval`),
      icon: 'iconfont:icon-shenpi1',
      color: '#3168ec',
    },
    {
      key: BpmnNodeTypeEnum.BpmnParallel,
      name: $t(`sys.bpmn.nodeType.bpmnParallel`),
      icon: 'iconfont:icon-binghangfenzhi',
      color: '#FF980E',
    },
  ];

  const isProcessFormBpmnNoSaved = computed(() => !hasPublishedVersion.value);

  async function handleEvent(key) {
    if (key === 'save') {
      await DesignRef.value?.handleSave();
    } else if (key === 'publish') {
      await DesignRef.value?.handlePublish();
    } else if (key === 'close') {
      await props.modal.dismiss();
    }
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
          props.modal.dismiss();
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
    color: #fff;
    padding: 0 16px;

    .buttons {
      position: absolute;
      display: flex;
      align-items: center;
      height: 30px;
      margin: 12px 0;
      top: 0;
      right: 16px;
    }

    .button {
      height: 26px;
      background: transparent;
      // border: 1px solid #e8ebf0;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      line-height: 1em;
      transition: all 0.3s;
      i {
        margin-right: 6px;
        display: flex;
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
          background: var(--ant-primary-color-hover);
          border-color: var(--ant-primary-color-hover);
        }
      }

      &.save-btn {
        background: #444444;
        border: 1px solid #444444;
        &:hover {
          background: var(--ant-primary-color-hover);
          border-color: var(--ant-primary-color-hover);
        }
      }

      &.btn-block {
        background: #444444;
        border: 1px solid #444444;
        &:hover {
          background: var(--ant-primary-color-hover);
          border-color: var(--ant-primary-color-hover);
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
        cursor: pointer;
        background-color: transparent;
        border: 0;
        color: var(--ant-primary-color);
        font-size: 14px;
      }
    }
  }
</style>
