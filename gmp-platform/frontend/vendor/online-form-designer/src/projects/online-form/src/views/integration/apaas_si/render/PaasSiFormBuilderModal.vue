<template>
  <a-drawer
    :visible="visible"
    :width="dataCollectionInfo ? '98%' : '1200px'"
    :wrapClassName="`paas-si-form-builder-drawer-wrapper  ${isViewPage && 'show-basic-info'}`"
    :keyboard="false"
    v-bind="props.options"
    @close="handleAction({ type: 'Cancel', title: '取消' })"
  >
    <div
      class="overflow-hidden ks-column"
      :style="{
        width: instanceVisible ? '240px' : '0px',
        transition: 'width 0.3s',
      }"
      v-if="dataCollectionInfo"
    >
      <InstanceArea
        :docInstanceList="docInstanceList"
        :selectedId="selectSelfInfo?.id"
        :supportEdit="!readonlyInstance"
        @update:selected="onSelectInstanceItem"
        @toggleVisible="(val) => (instanceVisible = val)"
        @search="onSearchInstance"
        @edit="onEditInstanceItem"
      >
        <template #create-instance v-if="!readonlyInstance">
          <a-tooltip>
            <template #title>{{ $t('sys.edhr.createFormInst') }}</template>
            <i
              class="create-instance-btn iconfont icon-pad_icon_add_blue cursor-pointer"
              @click.stop="onCreateNewSelf"
            ></i>
          </a-tooltip>
        </template>
      </InstanceArea>
    </div>
    <OnlineFormOperator
      v-if="visible"
      ref="operatorRef"
      class="paas-si-form-builder-container"
      :selfId="selectSelfInfo?.id ?? selfId"
      :materialNo="materialNo"
      :dataCollectionInfo="dataCollectionInfo"
      :showRightBtns="showRightBtns_"
      in-drawer
      :isViewPage="isViewPage_"
      :keep="keep"
      :paramExtraProps="paramExtraProps"
      :judgeFormDataHasChange="judgeFormDataHasChange"
      :setAutoSaveInitData="setInitData"
      :printConfig="printConfig"
      @btn-click-callback="handleAction"
    >
      <template #form-info>
        <component :is="renderFormInfo" v-if="renderFormInfo" v-bind="paramExtraProps" />
      </template>
    </OnlineFormOperator>
  </a-drawer>
</template>

<script setup lang="ts" name="PaasSiFormBuilderModal">
  import { ref, onMounted } from 'vue';
  import { cloneDeep, pick } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import type { ModalProps } from 'ant-design-vue';
  import OnlineFormOperator from './operator/online-form-operator.vue';
  import { useAutoSaveFactory } from '../hooks/useAutoSaveFactory';
  import InstanceArea from './components/instance-area.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CreateNewSelfModal from './components/create-new-self-modal.vue';
  import EditSelfNameModal from './components/edit-self-name-modal.vue';
  import {
    getOnlineFormInstanceDataCollectionListAll,
    postOnlineFormInstanceDataCollectionCreate,
    postOnlineFormInstanceDataCollectionUpdateAlias,
  } from '/@/apis/gct-apaas/MedProFormInstanceController';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { PrintModeEnum, FileModeEnum } from '@gct/nocode-web-render';
  import { EntityModelCategoryEnum } from '@gct/runtime';

  const props = withDefaults(
    defineProps<{
      /** 在线表单实例id */
      selfId: string;
      /** 批次号 */
      materialNo?: string;
      /** 是否是查看页面 */
      isViewPage?: boolean;
      /** 是否开启自动保存功能 */
      needAutoSave?: boolean;
      /** 传入的参数（接口使用） */
      paramExtraProps?: Record<string, any>;
      renderFormInfo: [Object, Function];
      /** 打印配置 */
      printConfig?: {
        apiMode: PrintModeEnum;
        fileMode: FileModeEnum;
      };
      /** 点击按钮后是否直接关闭弹框 */
      keep: boolean;
      options?: ModalProps;
      callback?: any;
      /** 显示的底部右侧按钮  */
      showRightBtns?: string[];

      /** 数据采集任务信息 */
      dataCollectionInfo?: any;
      // 表单实例只读状态
      readonlyInstance?: boolean;
    }>(),
    {
      readonlyInstance: true,
    },
  );

  const { t } = useI18n();

  const visible = ref<boolean>(true);

  const operatorRef = ref();

  const instanceVisible = ref(true);
  const selectSelfInfo = ref<any>({});
  const docInstanceList = ref<any[]>([]);
  const allInstanceList = ref<any[]>([]);

  const isViewPage_ = ref(props.isViewPage);
  const showRightBtns_ = ref(props.showRightBtns);
  const setShowRightBtns = () => {
    if (selectSelfInfo.value.instanceStatus == 'PARTIAL_SUBMIT') {
      const taskId = props.dataCollectionInfo?.id;
      const instanceId = selectSelfInfo.value?.id;

      postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_data_collection_task',
          bsKey: 'biz_get_data_collection_instance_status',
        },
        {
          task_id_: taskId,
          inst_id_: instanceId,
        },
      ).then((res) => {
        if (res) {
          showRightBtns_.value = [];
          isViewPage_.value = true;
        } else {
          showRightBtns_.value = props.showRightBtns;
          isViewPage_.value = props.isViewPage;
        }
      });
    } else {
      showRightBtns_.value = props.showRightBtns;
      isViewPage_.value = props.isViewPage;
    }
  };

  const { judgeFormDataHasChange, clearLooperData, setInitData } = useAutoSaveFactory(
    props.needAutoSave,
    handleAutoSave,
  );

  function onSearchInstance(val) {
    if (val) {
      docInstanceList.value = allInstanceList.value.filter((i) => {
        return i.ext2?.includes(val) ?? i.tmplName.includes(val);
      });
    } else {
      docInstanceList.value = cloneDeep(allInstanceList.value);
    }
  }

  async function onCreateNewSelf() {
    const res = await gct.openUtil.modal(
      CreateNewSelfModal,
      {
        selectDocData: props.dataCollectionInfo,
      },
      {
        title: $t('sys.edhr.createForm'),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (res.ok) {
      const { instanceAlias } = res.params;
      await postOnlineFormInstanceDataCollectionCreate({
        dataCollectionTaskId: props.dataCollectionInfo.id!, // 大纲模板id
        instanceAlias,
      });
      message.success(t('sys.createSuccess'));
      await getDocInstanceList();
    }
  }

  async function onSelectInstanceItem(data) {
    selectSelfInfo.value = data;
    // 根据实例ID 任务ID 获取按钮权限等信息
    setShowRightBtns();
  }

  async function onEditInstanceItem(item) {
    const ext2 = item.ext2 || item.tmplName || '';
    const res: any = await gct.openUtil.modal(
      EditSelfNameModal,
      {
        data: {
          ext2,
        },
      },
      {
        title: $t('sys.editSth', { sth: $t('sys.edhr.field.name') }),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (res && res.ok) {
      await postOnlineFormInstanceDataCollectionUpdateAlias({
        id: item.id!,
        instanceAlias: res.params.ext2,
      });
      message.success(t('sys.editSuccess'));
      await getDocInstanceList();
    }
  }

  async function handleAutoSave(isAutoSave = true) {
    if (operatorRef.value?.quickSaveData && typeof operatorRef.value.quickSaveData === 'function') {
      await operatorRef.value.quickSaveData(isAutoSave);
    }
  }

  const handleAction = (btn) => {
    if (props.needAutoSave && btn.type === 'Cancel') {
      judgeFormDataHasChange(() => {
        doButtonAction(btn);
      });

      return;
    }

    clearLooperData();
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

  const getDocInstanceList = async () => {
    const dataCollectionTaskId = props.dataCollectionInfo?.id;
    if (!dataCollectionTaskId) return;
    const res = await getOnlineFormInstanceDataCollectionListAll({
      dataCollectionTaskId,
    });
    allInstanceList.value = cloneDeep(res) ?? [];
    docInstanceList.value = cloneDeep(res) ?? [];
  };

  onMounted(async () => {
    if (props.dataCollectionInfo) {
      await getDocInstanceList();
      selectSelfInfo.value = docInstanceList?.value?.[0];
      // 根据实例ID 任务ID 获取按钮权限等信息
      setShowRightBtns();
    }
  });
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
  .paas-si-form-builder-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      max-height: 80vh;

      > .ant-modal-close {
        > .ant-modal-close-x {
          width: auto;
          height: auto;
          padding: 16px;
          color: #212528;
          line-height: 1;
          line-height: 22px;
        }
      }

      > .ant-modal-header,
      > .ant-modal-footer {
        flex-shrink: 0;
        padding: 16px;
      }

      > .ant-modal-header {
        border-bottom: 1px solid #e0e3ea;
      }

      > .ant-modal-footer {
        padding: 12px 16px;
        border-top: 1px solid #e0e3ea;
        background-color: #fff;
      }

      > .ant-modal-header .ant-modal-title {
        color: #000;
        font-weight: 600;
      }

      > .ant-modal-body {
        display: flex;
        flex-grow: 1;
        min-height: 600px;
        padding: 0;
        background-color: #e6e9ef;

        .paas-si-form-builder-container {
          flex: 1;
          max-width: 100%;
          max-height: 100%;
        }
      }
    }

    .isFullScreen {
      top: 0;
      width: 100vw !important;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;

      .ant-modal-content {
        display: flex;
        flex-direction: column;
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;
      }
    }
  }

  .paas-si-form-builder-drawer-wrapper {
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

    .create-instance-btn {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      margin-left: 12px;
      border: 1px solid #e0e3eb;
      border-radius: 4px;
      background: #fff;
      color: #1a1d23;
      font-size: 14px;
      line-height: 1;
    }
  }
</style>
