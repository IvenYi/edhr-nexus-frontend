<template>
  <basic-popup
    v-model:show="show"
    class="mobile-edhr-fill-modal"
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
      <div class="dhr-fill-header">
        <div class="dhr-left-content">
          <van-icon name="arrow-left" class="back-icon" @click="onBack" />
          <div class="dhr-status">
            {{ t(`sys.edhr.materialStatus.${edhrInstance?.materialStatus}`) }}
          </div>
          <div class="dhr-title ell">
            {{ edhrInstance?.materialNo || '--' }}&nbsp;/&nbsp;{{
              edhrInstance?.productName || '--'
            }}:{{ edhrInstance?.productVersion || '--' }}
          </div>
        </div>

        <action-bar
          :edhr-instance="edhrInstance"
          :release-list="releaseList"
          :appendix-list="appendixList"
          :transaction-list="transactionList"
          :rework-list="reworkList"
          :link-list="linkList"
          v-model:tab-active-key="tabActiveKey"
          v-model:select-release-info="selectReleaseInfo"
          v-model:select-appendix-info="selectAppendixInfo"
          v-model:select-transaction-info="selectTransactionInfo"
          v-model:select-rework-info="selectReworkInfo"
          v-model:select-link-info="selectLinkInfo"
        />
      </div>
    </template>

    <EbrWikiLayout ref="EbrWikiLayoutRef" :loading="loading" :has-data="hasData">
      <template #ebr-left>
        <MobileEdhrMenu
          :edhr-instance="edhrInstance"
          :wiki-tree-data="treeData"
          :doc-instance-list="docInstanceList"
          v-model:tree-select-doc-data="treeSelectDocData"
          v-model:select-self-info="selectSelfInfo"
          v-model:search-value="searchVal"
          v-model:tab-active-key="tabActiveKey"
          :showAddInstanceBtn="!usePermissionActions.archived2EdhrInstance"
          @create-new-ins="onCreateNewIns"
        />
      </template>
      <template #ebr-right>
        <BaseOnlineFormRender
          v-if="selectInstanceInfo?.showType === 'TMPL'"
          class="nocode-form-tmpl-badge"
          :selfId="selectInstanceInfo?.id"
          :option="option"
        />
        <template v-else-if="selectInstanceInfo?.showType === 'INST'">
          <div class="online-form-operator-wrapper">
            <MobileOnlineFormOperator
              ref="operatorRef"
              style="flex: 1; overflow: hidden; height: 100%"
              :selfId="selectInstanceInfo?.id"
              :in-drawer="false"
              keep
              :isViewPage="useIsViewPage"
              :isMedPro="isMedPro"
              :paramExtraProps="context.paramExtraProps"
              @btn-click-callback="btnClickCallback"
            />
            <div class="online-form-operator-footer" v-if="isShowFooter">
              <FormInsBtns
                ref="insBtnRef"
                :basicButtons="basicButtons"
                :basicIns="formBasicIns"
                :data="operatorRef?.formIns"
                @checkListClick="onCheckListClick"
                showIcon
              />

              <div class="btns">
                <ActionBtns
                  v-if="annotationController"
                  :showButtonKeys="annotationController.showButtonKeys.value"
                  :showAnnotation="annotationController.showAnnotation.value"
                  :formChanging="annotationController.formChanging.value"
                  @click-action="annotationController.handleBuiltAction"
                />
                <vant-button
                  class="action-btn"
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
      </template>
    </EbrWikiLayout>
  </basic-popup>
</template>

<script setup lang="ts" name="mobile-edhr-fill-modal">
  import { ref, computed } from 'vue';
  import { showNotify } from 'vant';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { i18n } from '@mobile/locales/setupI18n';
  import {
    EbrWikiLayout,
    PlatformEnum,
    RenderModeEnum,
    useEbrWikiFactoryV2,
  } from '@gct/nocode-base';
  import BasicPopup from '../base/basic-popup.vue';
  import VantButton from '../base/base-button.vue';
  import ActionBar from './_common_/action-bar.vue';
  import FormInsBtns from './form-ins/form-ins-btns.vue';
  import BaseOnlineFormRender from './_layout_/BaseOnlineFormRender.vue';
  import MobileOnlineFormOperator from './_layout_/mobile-online-form-operator.vue';
  import MobileEdhrMenu from './mobile-edhr-menu.vue';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import ActionBtns from './annotation/action-btns.vue';

  const { t } = i18n.global;

  const isMedPro = (window as any)?._gct?.store?.appInfo?.suiteKey === 'MEDPRO';

  const option = {
    requestCallback: getOnlineFormTmplGetVersionById,
    renderModeType: RenderModeEnum.ViewMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isMockReport: false,
  };

  const props = defineProps<{
    popupProps: any;
    context: {
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
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const {
    loading,
    hasData,
    treeData,
    edhrInstance,
    docInstanceList,
    treeSelectDocData,
    selectSelfInfo,
    searchVal,
    tabActiveKey,
    releaseList,
    appendixList,
    transactionList,
    reworkList,
    linkList,
    selectReleaseInfo,
    selectAppendixInfo,
    selectTransactionInfo,
    selectReworkInfo,
    selectLinkInfo,
    selectInstanceInfo,
    useIsViewPage,
    usePermissionActions,
    updateInstanceCounter,
    updateEdhrIconStatusCounter,
    updateAppendixCounter,
  } = useEbrWikiFactoryV2(props.context, {
    pageType: props.context.pageType || '',
    viewPageLimit: props.context.viewPageLimit,
    isViewPage: props.context.isViewPage,
    needCreateNewInstance,
    createOnlineFormInstance,
  });

  const EbrWikiLayoutRef = ref();
  const operatorRef = ref();
  const insBtnRef = ref();
  const show = ref<boolean>(true);

  const formBasicIns = computed(() => operatorRef.value?.basicIns);
  const buttons = computed(() => operatorRef.value?.actionButtonList);
  const basicButtons = computed(() => operatorRef.value?.basicBuiltinButtons);
  const isShowFooter = computed(() => operatorRef.value?.isShowFooter);
  const annotationController = computed(() => operatorRef.value?.annotationController);

  /**
   * 判断是否需要新建一条实例
   * false 表示不需要新增 true 表示需要新增
   * @param params
   */
  async function needCreateNewInstance(params) {
    console.log('判断是否需要新建一条实例 useIsViewPage:', useIsViewPage.value);
    // 如果是详情页面，不需要新建实例
    if (useIsViewPage.value) {
      return false;
    }
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_routing_operation_config',
        bsKey: 'biz_form_list',
      },
      {
        ...params,
        businessId: props.context?.paramExtraProps?._gct_nocode_business_id_, // 当前工序节点id
      },
    );

    return res;
  }

  /**
   * 新建一条实例
   */
  async function createOnlineFormInstance(params) {
    const ext1 = props.context?.paramExtraProps?._gct_nocode_ext1_ ?? 'production'; // 根据实际场景传production或rework 默认传production
    await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'gct_edhr_instance',
        bsKey: 'insertFormInstance',
      },
      {
        ...params,
        businessId: props.context?.paramExtraProps?._gct_nocode_business_id_, // 当前工序节点id
        businessType: ext1 === 'rework' ? 'REWORK' : 'DHR',
        ext1,
      },
    );
  }

  const btnClickCallback = () => {
    if (tabActiveKey.value === '3') {
      updateAppendixCounter();
    } else {
      updateEdhrIconStatusCounter();
      updateInstanceCounter();
    }
  };

  /** 创建新的表单实例 */
  const onCreateNewIns = async (description: string) => {
    if (treeSelectDocData.value && edhrInstance.value) {
      await createOnlineFormInstance({
        docOutlineId: treeSelectDocData.value.id!, // 大纲模板id
        edhrInstanceId: edhrInstance.value?.id!, // edhr实例id
        tmplId: treeSelectDocData.value.refId!, // 在线表单模板id
        description: description,
      });
      showNotify({ type: 'success', message: t('sys.createSuccess') });

      // 更新edhr icon信息
      updateEdhrIconStatusCounter();
      // 刷新表单实例生成记录列表
      updateInstanceCounter();
    }
  };

  /** 点击校验清单 */
  const onCheckListClick = () => {
    operatorRef.value?.doCheckList();
  };

  const onBack = () => {
    doCloseModal();
    doCallback();
  };

  /** 调用关闭弹框方法 */
  const doCloseModal = () => {
    show.value = false;
  };

  /** 调用回调方法 */
  const doCallback = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk();
    }
  };
</script>
<style scoped lang="less">
  .dhr-fill-header {
    display: flex;
    height: 64px;
    background-color: #fff;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    .dhr-left-content {
      display: flex;
      align-items: center;
      overflow: hidden;
      .back-icon {
        width: 24px;
        height: 24px;
        color: #1a1d23;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 600;
      }
      .dhr-status {
        padding: 3px 5px;
        font-size: 11px;
        border-radius: 4px;
        color: #fff;
        margin-left: 4px;
        margin-right: 6px;
        background: rgba(36, 123, 255, 0.14);
        color: #247bff;
        line-height: 16px;
        flex-shrink: 0;
      }
      .dhr-title {
        color: #1a1d23;
        font-weight: 600;
        font-size: 17px;
        line-height: 24px;
        flex-grow: 1;
      }
    }
  }

  .online-form-operator-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .online-form-operator-footer {
      display: flex;
      height: 64px;
      background-color: #fff;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-left: 1px solid #e0e3eb;
      box-shadow: 0px -4px 16px 0px rgba(0, 0, 0, 0.06);

      .btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
      }
    }
  }
</style>
