<template>
  <basic-popup
    v-model:show="show"
    class="mobile-single-form-fill-modal"
    :popup-props="popupProps"
    :showFooter="false"
    :extra-style="{
      width: '100vw',
      maxWidth: '100vw',
      top: 0,
      margin: 0,
      transform: 'none',
    }"
  >
    <template #header>
      <div class="header h64px bg-[#FFFFFF] text-[#1A1D23] ks-row-middle px16px">
        <van-icon name="arrow-left" class="text-size-[20px] mr8px leading-22px" @click="onBack" />
        <div class="ks-col">
          <span class="cursor-pointer ks-row-middle">
            <span class="text-size-[17px] max-w290px leading-22px ell inline-block font-bold">{{
              operatorRef?.formIns?.tmplName || '表单处理'
            }}</span>
          </span>
        </div>
        <div class="flex items-center">
          <FormInsBtns
            :basicIns="formBasicIns"
            :basicButtons="basicButtons"
            :data="operatorRef?.formIns"
            @checkListClick="onCheckListClick"
            :hiddenIcon="true"
          />
          <div class="btns">
            <ActionBtns
              class="ml-12px custom-btn"
              v-if="annotationController"
              :showButtonKeys="annotationController.showButtonKeys.value"
              :showAnnotation="annotationController.showAnnotation.value"
              :formChanging="annotationController.formChanging.value"
              @click-action="annotationController.handleBuiltAction"
            />
            <vant-button
              class="ml-12px custom-btn"
              v-for="item in buttons"
              :key="item.type"
              @click="operatorRef?.handleBtnClick(item)"
              :title="item.customTitle"
              :loading="item.loading"
              v-bind="{ ...(item.style || {}) }"
            />
          </div>
        </div>
      </div>
    </template>
    <div class="flex h-full overflow-hidden">
      <InstanceArea
        v-if="context.dataCollectionInfo"
        class="overflow-hidden ks-column w-240px"
        :docInstanceList="docInstanceList"
        :selectedId="selectSelfInfo?.id"
        :supportEdit="context.supportEdit"
        @add-instance="onCreateNewSelf"
        @update:selected="onSelectInstanceItem"
        @edit="onEditInstanceItem"
      />
      <MobileOnlineFormOperator
        ref="operatorRef"
        style="flex: 1; overflow: hidden; height: 100%"
        :selfId="selectSelfInfo?.id ?? context.selfId"
        :in-drawer="false"
        :keep="_keep"
        :isViewPage="isViewPage_"
        :isMedPro="isMedPro"
        :paramExtraProps="context.paramExtraProps"
        :dataCollectionInfo="context.dataCollectionInfo"
        :showRightBtns="showRightBtns_"
        @btn-click-callback="btnClickCallback"
        class="bg-[#e6e9ef]"
      />
    </div>
  </basic-popup>
</template>

<script setup lang="ts" name="mobile-single-form-fill-modal">
  import { ref, computed, onMounted } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import BasicPopup from '../base/basic-popup.vue';
  import VantButton from '../base/base-button.vue';
  import FormInsBtns from './form-ins/form-ins-btns.vue';
  import MobileOnlineFormOperator from './_layout_/mobile-online-form-operator.vue';
  import InstanceArea from './instance-area/instance-area.vue';
  import {
    getOnlineFormInstanceDataCollectionListAll,
    postOnlineFormInstanceDataCollectionCreate,
    postOnlineFormInstanceDataCollectionUpdateAlias,
  } from '/@/apis/gct-apaas/MedProFormInstanceController';
  import { GctPopup } from '@mobile/utils/popup';
  import { showNotify } from 'vant';
  import { cloneDeep } from 'lodash-es';
  import AddFormInsPopup from './form-ins/add-form-ins-popup.vue';
  import EditNamePopup from './form-ins/edit-self-name-popup.vue';
  import ActionBtns from './annotation/action-btns.vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const { t } = i18n.global;

  const isMedPro = (window as any)?._gct?.store?.appInfo?.suiteKey === 'MEDPRO';

  const props = defineProps<{
    popupProps: any;
    context: {
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
      /** 点击按钮后是否直接关闭弹框 */
      keep?: boolean;
      /** 是否隐藏左侧按钮 */
      hideLeftButtons?: Array<string>;
      /** 显示的底部右侧按钮  */
      showRightBtns?: string[];
      /** 数据采集信息   */
      dataCollectionInfo?: any;
      supportEdit?: boolean;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const EbrWikiLayoutRef = ref();
  const operatorRef = ref();
  const show = ref<boolean>(true);

  const selectSelfInfo = ref<any>({});
  const docInstanceList = ref<any[]>([]);
  const allInstanceList = ref<any[]>([]);

  const isViewPage_ = ref(props.context.isViewPage);
  const showRightBtns_ = ref(props.context.showRightBtns);

  const buttons = computed(() => {
    if (props.context?.dataCollectionInfo) {
    }
    return operatorRef.value?.actionButtonList;
  });
  const basicButtons = computed(() => operatorRef.value?.basicBuiltinButtons);
  const formBasicIns = computed(() => operatorRef.value?.basicIns);
  const annotationController = computed(() => operatorRef.value?.annotationController);

  const btnClickCallback = (btn) => {
    doCloseModal(btn);
    doCallback(btn);
  };

  const onBack = () => {
    btnClickCallback({ type: 'Cancel', title: '取消' });
  };

  const _keep = computed(() => (props.context.keep === undefined ? true : props.context.keep));

  /** 调用关闭弹框方法 */
  const doCloseModal = (btn) => {
    // keep 为true的时候不能关闭窗口
    if (btn.type === 'Cancel' || !props.keep) {
      show.value = false;
    }
  };

  /** 调用回调方法 */
  const doCallback = (btn) => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(btn);
    }
  };

  /** 点击校验清单 */
  const onCheckListClick = () => {
    operatorRef.value?.doCheckList();
  };

  const setShowRightBtns = () => {
    if (selectSelfInfo.value.instanceStatus == 'PARTIAL_SUBMIT') {
      const taskId = props.context.dataCollectionInfo?.id;
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
          showRightBtns_.value = props.context.showRightBtns;
          isViewPage_.value = props.context.isViewPage;
        }
      });
    } else {
      showRightBtns_.value = props.context.showRightBtns;
      isViewPage_.value = props.context.isViewPage;
    }
  };

  const getDocInstanceList = async () => {
    const dataCollectionTaskId = props.context.dataCollectionInfo?.id;
    if (!dataCollectionTaskId) return;
    const res = await getOnlineFormInstanceDataCollectionListAll({
      dataCollectionTaskId,
    });
    allInstanceList.value = cloneDeep(res) ?? [];
    docInstanceList.value = cloneDeep(res) ?? [];
  };

  async function onSelectInstanceItem(data) {
    selectSelfInfo.value = data;
    // 根据实例ID 任务ID 获取按钮权限等信息
    setShowRightBtns();
  }

  async function onCreateNewSelf() {
    GctPopup.open(AddFormInsPopup, {
      beforeClose: async (data) => {
        if (data?.description) {
          await postOnlineFormInstanceDataCollectionCreate({
            dataCollectionTaskId: props.context.dataCollectionInfo.id!, // 大纲模板id
            instanceAlias: data.description,
          });
          showNotify({ type: 'success', message: t('sys.createSuccess') });

          await getDocInstanceList();
        }
      },
    });
  }

  async function onEditInstanceItem(item) {
    GctPopup.open(EditNamePopup, {
      data: {
        ext2: item.ext2 || item.tmplName || '',
      },
      beforeClose: async (data) => {
        if (data?.name) {
          await postOnlineFormInstanceDataCollectionUpdateAlias({
            id: item.id!,
            instanceAlias: data.name,
          });
          showNotify({ type: 'success', message: t('sys.editSuccess') });

          await getDocInstanceList();
        }
      },
    });
  }

  onMounted(async () => {
    if (props.context.dataCollectionInfo) {
      await getDocInstanceList();
      selectSelfInfo.value = docInstanceList?.value?.[0];
      // 根据实例ID 任务ID 获取按钮权限等信息
      setShowRightBtns();
    }
  });
</script>
<style scoped lang="less">
  .action-nav-bar {
    position: relative;
    background: #fff;

    &-buttons {
      display: flex;
      flex-direction: column;
      width: 52px;
    }
  }

  .custom-btn {
    :deep(.van-button) {
      padding: 0 13px;
    }
  }
</style>
