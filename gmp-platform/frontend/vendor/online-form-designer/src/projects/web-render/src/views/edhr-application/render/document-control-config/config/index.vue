<template>
  <div class="online-form-designer">
    <div class="online-form-designer-header">
      <div class="back-container">
        <LeftOutlined @click="handleLeaveCurrentPage()" />
        <span class="ml6px mr6px title" :title="`${templateInfo.name} : ${templateInfo.version}`">
          {{ templateInfo.name }} {{ templateInfo.version ? `:${templateInfo.version}` : '' }}
        </span>
        <span
          class="text-11px"
          v-if="!!templateInfo.default"
          style="background: rgba(255, 255, 255, 0.08); border-radius: 2px; padding: 0 4px"
        >
          {{ t('sys.default') }}
        </span>
      </div>
      <div class="buttons">
        <template v-for="btn in buttons" :key="btn.key">
          <div
            v-if="!bpmnReadonly || btn.key === 'close'"
            class="button ml-12px cursor-pointer"
            :class="[btn.className]"
            @click="() => onBtnItemClick(btn.key)"
          >
            <i v-if="btn.icon" :class="['iconfont', btn.icon]"></i>
            {{ btn.label }}
          </div>
        </template>
      </div>
    </div>

    <div class="online-form-designer-content">
      <BpmnSettingIndex ref="DesignRef" :templateInfo="templateInfo" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeMount, ref, h } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBpmnSetting } from './bpmn-setting/hooks/useBpmnSetting';
  import { IModal } from '@gct/runtime';
  import BpmnSettingIndex from './bpmn-setting/index.vue';

  const props = defineProps({
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    info: {
      type: Object,
      reuqired: true,
    },
  });

  const { t } = useI18n();

  const DesignRef = ref();
  const { bpmnReadonly, needRefresh } = useBpmnSetting();

  const buttons = [
    {
      key: 'save',
      className: 'save-btn btn-block',
      icon: 'icon-baocun1',
      label: t('sys.saveText'),
    },
    {
      key: 'publish',
      className: 'btn-block',
      icon: 'icon-baocun1',
      label: t('sys.publish'),
    },
    {
      key: 'close',
      className: 'btn-block',
      label: t('sys.closeText'),
    },
  ];

  const templateInfo = ref<OnlineFormTmplResponse>({});

  const handleLeaveCurrentPage = async (tab?) => {
    const result = await DesignRef.value?.checkHasUnsaved();
    if (result) {
      const contentMsg = t('sys.onlineForm.hasNoSavedDataAndPublishTips');
      const okBtnText = '保存发布并退出';
      const cfg = Modal.confirm({
        title: t('sys.hasNoSavedDataTitle'),
        content: h('div', { class: 'unsaved-modal' }, [
          h('span', contentMsg),
          h('div', { class: 'continue-edit' }, [
            h(
              'button',
              {
                type: 'button',
                onClick: () => cfg.destroy(),
              },
              '继续编辑',
            ),
          ]),
        ]),
        okText: okBtnText,
        cancelText: '不保存',
        onOk: async () => {
          await DesignRef.value?.handlePublish({ silent: true, ...props.info });
          if (tab) {
            await initData();
          } else {
            goBack();
          }
        },
        onCancel: () => {
          cfg.destroy();
          goBack();
        },
      });
    } else {
      goBack();
    }
  };

  const onBtnItemClick = async (key: string) => {
    if (key === 'save') {
      await DesignRef.value?.handleSave(props.info);
      await initData();
    } else if (key === 'publish') {
      await DesignRef.value?.handlePublish(props.info);
    } else if (key === 'close') {
      await handleLeaveCurrentPage();
    }
  };

  const goBack = () => {
    props.modal.dismiss({ ok: true, params: { needRefresh: needRefresh.value } });
  };

  const initData = async (init = false) => {
    console.log('init---', props);
    templateInfo.value = props.info || {};
  };

  onBeforeMount(async () => {
    await initData(true);
  });
</script>
<style lang="less" scoped>
  .online-form-designer {
    min-height: 100%;
    background: #f7f8fa;
    &-header {
      position: relative;
      width: 100%;
      height: 54px;
      background: #1a1d23;
      .back-container {
        display: flex;
        align-items: center;
        position: absolute;
        left: 8px;
        min-width: 165px;
        height: 30px;
        margin: 12px 0;
        color: #fff;

        .anticon {
          cursor: pointer;
        }

        .title {
          text-overflow: ellipsis;
          max-width: 30vw;
          overflow: hidden;
          text-wrap: nowrap;
        }
      }
      .header-tabs {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        .tab-item {
          display: flex;
          justify-content: center;
          align-items: center;

          span {
            height: 32px;
            font-weight: 500;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.56);
            background: rgba(255, 255, 255, 0.16);
            padding: 5px 20px;
            cursor: pointer;
          }

          &-active {
            span {
              background-color: var(--ant-primary-color);
              color: #fff;
            }
          }

          &:first-child {
            > span {
              border-top-left-radius: 4px;
              border-bottom-left-radius: 4px;
            }
          }
          &:last-child {
            > span {
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
            }
          }
        }
      }

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
        border: 1px solid #e8ebf0;
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

        &.save-btn.BpmnSetting {
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

      .button:has(+ .button__download) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
      }

      .button__download {
        cursor: pointer;
        height: 26px;
        background: transparent;
        border: 1px solid #e8ebf0;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        color: #fff;
        padding: 0 8px;
        display: flex;
        align-items: center;
        line-height: 1em;
        transition: all 0.3s;
        & > i {
          font-size: 12px !important;
          margin: 0;
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
