<template>
  <div class="wrap edhr-fill-wrapper h-full w-full">
    <div class="header ks-row-middle px16px">
      <left-outlined class="mr16px back-icon" @click="onBack" />
      <div class="tag px4px py2px rounded-3px mr6px" v-if="materialData?.materialStatus">
        {{ t(`sys.edhr.materialStatus.${materialData?.materialStatus}`) }}
      </div>
      <div class="ks-col">
        <slot name="fill-header" :edhrInstInfo="materialData">
          <span class="cursor-pointer ks-row-middle">
            <span class="max-w400px ell inline-block" :title="materialData?.materialNo">
              {{ materialData?.materialNo }}
            </span>
            <span class="px2px" v-if="materialData?.productDesc">
              / {{ materialData?.productDesc }}
            </span>
          </span>
        </slot>
      </div>
      <a-button
        class="flex items-center justify-center mr-8px text-[#1A1D23]"
        @click="onViewDHRLog"
      >
        <i class="iconfont text-16px mr-4px icon-a-Group427318493"></i>
        {{ $t('sys.developer.appCenter.operationLog') }}
      </a-button>
      <a-button
        v-if="isViewPage"
        class="flex items-center justify-center mr-8px text-[#1A1D23]"
        @click="onBatchPrint"
      >
        <i class="iconfont text-16px mr-4px icon-dayinzhongxin"></i>
        {{ $t('sys.edhr.batchPrint') }}
      </a-button>
      <a-button class="flex items-center justify-center text-[#1A1D23]" @click="openLinkModal">
        <i class="iconfont text-16px mr-4px icon-eDHRguanlianliebiao"></i>
        {{ $t('sys.pageDesigner.refList') }}
      </a-button>
    </div>
    <div class="content">
      <EbrWikiLayout ref="EbrWikiLayoutRef" :loading="loading" :has-data="hasData" showFullScreen>
        <template #ebr-left>
          <EbrTreeResize
            ref="treeRef"
            :class="[!usePermissionActions.archived2EdhrInstance && 'show-create-instance-btn']"
            :category-menus="categoryMenus"
            :edhr-instance="edhrInstance"
            :wiki-tree-data="catalogTreeData"
            :doc-instance-list="docInstanceList"
            v-model:select-doc-data="selectDocData"
            v-model:select-self-info="selectSelfInfo"
            v-model:sub-category="subCategory"
            v-model:search-value="searchVal"
            v-model:tab-active-key="tabActiveKey"
            :inspection-data="inspectionData"
            :production-data="productionData"
            :release-data="releaseData"
            :link-data="linkData"
            :parent-ref="EbrWikiLayoutRef"
            :judgeFormDataHasChange="judgeFormDataHasChange"
            :onEditDescription="onEditDescription"
            :support-edit="!usePermissionActions.archived2EdhrInstance"
            :show-other-menu="usePermissionActions.showOtherMenu"
            :tagged-outline="taggedOutlineIds"
            :tagged-inst="taggedInstIds"
            :sop-list="sopList"
          >
            <template #create-instance v-if="!usePermissionActions.archived2EdhrInstance">
              <a-tooltip>
                <template #title>{{ $t('sys.edhr.createFormInst') }}</template>
                <i
                  v-show="showFormInstBtn()"
                  class="create-instance-btn iconfont icon-pad_icon_add_blue cursor-pointer"
                  @click.stop="onCreateNewSelf"
                ></i>
              </a-tooltip>
            </template>
          </EbrTreeResize>
        </template>
        <template #ebr-right>
          <BaseOnlineFormRender
            v-if="selectInstanceInfo?.showType === 'TMPL'"
            class="nocode-form-tmpl-badge"
            :selfId="selectInstanceInfo?.id"
            :option="option"
          />
          <OnlineFormOperator
            v-else-if="selectInstanceInfo?.showType === 'INST'"
            ref="operatorRef"
            class="paas-si-form-builder-container"
            style="flex: 1; overflow: hidden; height: 100%"
            :selfId="selectInstanceInfo?.id"
            :in-drawer="false"
            keep
            :isViewPage="useIsViewPage"
            :paramExtraProps="paramExtraProps"
            :judgeFormDataHasChange="judgeFormDataHasChange"
            :setAutoSaveInitData="setInitData"
            @btn-click-callback="btnClickCallback"
          />
        </template>
      </EbrWikiLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { pick } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EbrWikiLayout, PlatformEnum, RenderModeEnum } from '@gct/nocode-base';
  import { useEbrWikiFactory } from './hooks/useEbrWikiFactory';
  import EbrTreeResize from './ebr-tree-resize.vue';
  import {
    OnlineFormOperator,
    useAutoSaveFactory,
  } from '/@online-form/views/integration/apaas_si/index';
  import BaseOnlineFormRender from '../../_common_/BaseOnlineFormRender.vue';
  import CreateNewSelfModal from '../modal/create-new-self-modal/index.vue';
  import EditSelfDescriptionModal from '../modal/edit-self-description-modal.vue';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';
  import { IModal, EntityModelCategoryEnum } from '@gct/runtime';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
  import { InstanceAreaController } from './logic/instanceAreaController';
  import { ESubCategoryEnum } from './enums';

  const { t } = useI18n();

  const option = {
    requestCallback: getOnlineFormTmplGetVersionById,
    renderModeType: RenderModeEnum.ViewMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isMockReport: false,
  };

  const props = withDefaults(
    defineProps<{
      /** 物料编号 */
      materialNo: string;
      /** 选择的模板实例id */
      ofInstanceId?: string;
      /** 选择的模板id */
      ofTmplId?: string;
      /** 查看页面限制，只能操作固定表单 */
      viewPageLimit: boolean;
      /** 是否是查看页面 */
      isViewPage: boolean;
      /** 是否开启自动保存功能 */
      needAutoSave: boolean;
      /** 组件传进来的参数 */
      paramExtraProps?: Record<string, any>;
      pageType: string;
      modal: IModal;
      callback?: any;
      // 反向追溯时需要打标记的数据
      taggedMap?: { outlineList?: string[]; instList?: string[] };
      /** 添加表单实例的按钮权限 key */
      formInstBtnPerKey?: string;
      /** sop集合 */
      sopList?: any[];
    }>(),
    {
      pageType: '',
      viewPageLimit: false,
    },
  );

  const EbrWikiLayoutRef = ref();
  const operatorRef = ref();

  const {
    loading,
    categoryMenus,
    hasData,
    edhrInstance,
    tabActiveKey,
    catalogTreeData,
    docInstanceList,
    searchVal,
    selectSelfInfo,
    selectInstanceInfo,
    selectDocData,
    subCategory,
    inspectionData,
    releaseData,
    productionData,
    linkData,
    useIsViewPage,
    usePermissionActions,
    updateInstanceCounter,
    updateEdhrIconStatusCounter,
    updateAppendixCounter,
    updateReleaseCounter,
  } = useEbrWikiFactory(props, {
    pageType: props.pageType,
    viewPageLimit: props.viewPageLimit,
    isViewPage: props.isViewPage,
    getPermStatusCallback: getPermissionByKey,
    needCreateNewInstance: InstanceAreaController.needCreateNewInstance,
    createOnlineFormInstance: InstanceAreaController.createOnlineFormInstance,
    requestFn: {
      loadInstanceList: (subCategory, payload) =>
        InstanceAreaController.loadInstanceList(subCategory, payload),
    },
  });

  const { openLinkList, openEdhrLogDrawer } = useApaasEbr();

  const { judgeFormDataHasChange, clearLooperData, setInitData } = useAutoSaveFactory(
    props.needAutoSave,
    handleAutoSave,
  );

  const taggedOutlineIds = computed(() => {
    return props.taggedMap?.outlineList || [];
  });

  const taggedInstIds = computed(() => {
    return props.taggedMap?.instList || [];
  });

  const materialData = computed(() => {
    if (edhrInstance.value) {
      return {
        materialNo: edhrInstance.value?.materialNo,
        materialStatus: edhrInstance.value?.materialStatus,
        productDesc: edhrInstance.value?.productName + ':' + edhrInstance.value?.productVersion,
      };
    }
    return {
      materialNo: props.materialNo,
      materialStatus: props.paramExtraProps?._gct_nocode_material_params_?.materialStatus || '',
      productDesc: props.paramExtraProps?._gct_nocode_material_params_?.productName || '',
    };
  });

  function showFormInstBtn() {
    if (!props.formInstBtnPerKey) {
      return true;
    }
    const perms = props.formInstBtnPerKey!.split('.');
    const pageId: string = perms[0];
    const key: string = perms[1];
    return getPermissionByKey(pageId, key);
  }

  async function handleAutoSave(isAutoSave = true) {
    if (operatorRef.value?.quickSaveData && typeof operatorRef.value.quickSaveData === 'function') {
      await operatorRef.value.quickSaveData(isAutoSave);
      // 附录表单
      if (subCategory.value === ESubCategoryEnum.APPENDIX_FORM) {
        updateAppendixCounter();
      } else if (subCategory.value === ESubCategoryEnum.RELEASE_FORM) {
        // 放行单
        updateReleaseCounter();
      } else {
        updateEdhrIconStatusCounter();
        updateInstanceCounter();
      }
    }
  }

  /**
   * 创建表单实例
   * 1. 目录
   * 2. 检验表单
   */
  async function onCreateNewSelf() {
    const res: any = await gct.openUtil.modal(
      CreateNewSelfModal,
      {
        selectDocData: selectDocData.value,
      },
      {
        title: $t('sys.edhr.createForm'),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (res.ok) {
      if (
        (selectDocData.value && subCategory.value === ESubCategoryEnum.INSPECTION_FORM) ||
        edhrInstance.value
      ) {
        await InstanceAreaController.createOnlineFormInstance(
          subCategory.value,
          {
            docOutlineId: selectDocData.value.id, // 大纲模板id
            edhrInstanceId: edhrInstance.value?.id, // edhr实例id
            tmplId: res.params?.tmplId || selectDocData.value.refId!, // 在线表单模板id
            description: res.params.description,
            // 检验
            businessId: selectDocData.value.id,
          },
          props,
        );
        message.success(t('sys.createSuccess'));

        // 更新edhr icon信息
        updateEdhrIconStatusCounter();
        // 刷新表单实例生成记录列表
        updateInstanceCounter();
      }
    }
  }

  async function onEditDescription(data) {
    const res: any = await gct.openUtil.modal(
      EditSelfDescriptionModal,
      {
        data: pick(data, 'description'),
      },
      {
        title: $t('sys.editSth', { sth: $t('sys.onlineForm.remarkName') }),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (res && res.ok) {
      await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'gct_edhr_instance',
          bsKey: 'updateFormInstance',
        },
        {
          id: data.id!, // 大纲模板id
          edhrInstId: edhrInstance.value?.id, // edhr实例id
          description: res.params.description,
        },
      );

      message.success(
        t('sys.component.dataConnection.editSuccessOfSth', {
          sth: $t('sys.onlineForm.remarkName'),
        }),
      );

      // 刷新表单实例生成记录列表
      updateInstanceCounter();
    }
  }

  const openLinkModal = () => {
    openLinkList(
      edhrInstance.value?.materialNo,
      edhrInstance.value?.id,
      usePermissionActions.value,
    );
  };

  /** 批量打印 */
  const onBatchPrint = () => {
    if (!edhrInstance.value?.id) {
      message.warn($t('sys.edhr.instNotExist'));
      return;
    }
    postFileTaskSubmit({
      tmplInstantId: edhrInstance.value?.id,
      type: 'EDHR',
    });
    message.success($t('sys.edhr.printTaskCreationWasSuccessful'));
  };

  const onViewDHRLog = () => {
    openEdhrLogDrawer({ instanceId: edhrInstance.value?.id });
  };

  const btnClickCallback = () => {
    if (subCategory.value === ESubCategoryEnum.APPENDIX_FORM) {
      updateAppendixCounter();
    } else if (subCategory.value === ESubCategoryEnum.RELEASE_FORM) {
      updateReleaseCounter();
    } else {
      updateEdhrIconStatusCounter();
      updateInstanceCounter();
    }

    clearLooperData();
  };

  const onBack = async () => {
    await validateChange(() => {
      doCloseModal();
      doCallback();
    });
  };

  /** 调用关闭弹框方法 */
  const doCloseModal = () => {
    props.modal.dismiss();
  };

  /** 调用回调方法 */
  const doCallback = () => {
    if (props.callback && typeof props.callback === 'function') {
      props.callback();
    }
  };

  async function validateChange(callback) {
    judgeFormDataHasChange(() => {
      callback();
    });
  }

  defineExpose({
    validateChange,
  });
</script>

<style lang="less" scoped>
  .edhr-fill-wrapper {
    .header {
      position: relative;
      height: 64px;
      background-color: #fff;
      color: #1a1d23;
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        background-color: #e0e3eb;
        height: 1px;
        bottom: 0;
        left: 0;
        right: 0;
      }

      .back-icon {
        width: 20px;
        height: 20px;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: rgba(0, 0, 0, 0.85);
      }

      .tag {
        font-size: 11px;
        background: rgba(36, 123, 255, 0.14);
        color: #247bff;
        line-height: 16px;
      }
    }
  }
  .content {
    height: calc(100% - 64px);
  }

  .create-instance-btn {
    font-size: 14px;
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-radius: 4px;
    border: 1px solid #e0e3eb;
    line-height: 1;
    background: #fff;
    color: #1a1d23;
    margin-left: 12px;
  }
</style>
