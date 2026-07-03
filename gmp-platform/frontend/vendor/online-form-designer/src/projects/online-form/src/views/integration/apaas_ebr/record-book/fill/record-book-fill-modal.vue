<template>
  <div class="wrap bg-[#E6E9EF] h-full w-full">
    <div class="header h54px bg-[#1A1D23] text-[#FFFFFF] ks-row-middle px16px">
      <left-outlined class="mr6px" @click="onBack" />
      <div class="ks-col">
        <span class="cursor-pointer ks-row-middle">
          <span class="max-w400px ell inline-block" :title="recordBookDetailInfo?.code_">
            {{ recordBookDetailInfo?.code_ }}
          </span>
          <span class="px2px">/</span>
          {{ recordBookDetailInfo?.name_ }}
        </span>
      </div>

      <div class="buttons">
        <template v-for="btn of filterButtons" :key="btn.key">
          <div
            class="button ml-12px cursor-pointer"
            :class="[btn.className, { 'is-loading': btnLoading }]"
            @click="onBtnItemClick(btn.key)"
            :aria-disabled="btnLoading"
          >
            {{ btn.label }}
          </div>
        </template>
      </div>
    </div>

    <div class="content">
      <EbrWikiLayout ref="EbrWikiLayoutRef" :loading="loading" :has-data="hasData" showFullScreen>
        <template #ebr-left>
          <fill-left
            :doc-instance-list="docInstanceList"
            v-model:search-value="searchVal"
            v-model:select-self-info="selectSelfInfo"
            :onEditDescription="onEditDescription"
            :support-edit="!usePermissionActions.archived2RecordBook"
          >
            <template #create-instance v-if="!usePermissionActions.archived2RecordBook">
              <a-tooltip>
                <template #title>{{ $t('sys.onlineForm.createNewInstance') }}</template>
                <i
                  class="create-instance-btn iconfont icon-chuangjian cursor-pointer"
                  @click.stop="onCreateNewSelf"
                ></i>
              </a-tooltip>
            </template>
          </fill-left>
        </template>
        <template #ebr-right>
          <!-- <div v-if="selectSelfInfo?.id && useIsViewPage.message" class="fill-message">
            <a-alert :message="useIsViewPage.message" type="warning" show-icon closable />
          </div> -->
          <OnlineFormOperator
            :pageMessage="useIsViewPage.message"
            ref="operatorRef"
            class="paas-si-form-builder-container"
            style="flex: 1; height: 100%; overflow: hidden"
            :selfId="selectSelfInfo?.id"
            :in-drawer="false"
            keep
            :isViewPage="useIsViewPage.isViewPage"
            :btnNotForceReadOnly="useIsViewPage.btnNotForceReadOnly"
            :is-record-fill="true"
            :paramExtraProps="paramExtraProps"
            @btn-click-callback="btnClickCallback"
          />
        </template>
      </EbrWikiLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onBeforeMount } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { EntityModelCategoryEnum, IModal } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EbrWikiLayout, PlatformEnum, RenderModeEnum } from '@gct/nocode-base';
  import { OnlineFormOperator } from '/@online-form/views/integration/apaas_si/index';
  import CreateNewSelfModal from '../../modal/create-new-self-modal.vue';
  import EditSelfDescriptionModal from '../../modal/edit-self-description-modal.vue';
  import { useRecordBookFillFactory } from './hooks/useRecordBookFillFactory';
  import { useCreateLimiter } from './hooks/useCreateLimiter';
  import FillLeft from './fill-left.vue';
  import { InstanceStatusValues } from '../../utils/instance-status';
  import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
  import {
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';

  type BtnKey = 'archived' | 'close' | 'batch-print';
  type Btn = { key: BtnKey; className: string; label: string };

  const { t } = useI18n();

  const buttons: Btn[] = [
    { key: 'archived', className: 'save-btn', label: $t('sys.onlineForm.complete') },
    { key: 'batch-print', className: 'save-btn', label: $t('sys.edhr.batchPrint') },
    { key: 'close', className: 'btn-block', label: t('sys.closeText') },
  ];

  // props
  const props = withDefaults(
    defineProps<{
      /** 记录本id */
      recordBookId: string;
      /** 是否是查看页面 */
      isViewPage: boolean;
      /** 页面类型 */
      pageType?: string;
      /** 是否启用表单填报时间段限制 */
      isFillRangeOn: boolean;
      /** 进入时间 */
      entryTime?: Dayjs;
      /** 是否启用填报截止时间限制 */
      isFillDeadlineOn: boolean;
      /** 填报截止时间限制提示信息 */
      fillDeadlineOnMsg: string;
      /** 组件传进来的参数 */
      paramExtraProps?: Record<string, any>;
      modal: IModal;
      callback?: () => void;
    }>(),
    {},
  );

  const btnLoading = ref(false);
  const EbrWikiLayoutRef = ref();
  const operatorRef = ref();

  const {
    loading,
    hasData,
    searchVal,
    recordBookDetailInfo,
    recordBookFillConfig,
    docInstanceList,
    selectSelfInfo,
    useIsViewPage,
    usePermissionActions,
    updateInstanceCounter,
    updateRecordBookCounter,
  } = useRecordBookFillFactory(props);

  const { prepareCreate, limitLabelMap } = useCreateLimiter({
    recordBookFillConfigRef: recordBookFillConfig,
    docInstanceListRef: docInstanceList,
  });

  const filterButtons = computed(() => {
    return buttons.filter((btn) => {
      if (btn.key === 'archived') {
        return !props.isViewPage && recordBookDetailInfo.value?.status_ !== 'archived';
      }
      if (btn.key === 'batch-print') {
        return props.isViewPage;
      }
      return true;
    });
  });

  function onBack() {
    props.modal?.dismiss?.();
    props.callback?.();
  }

  async function onBtnItemClick(key: BtnKey) {
    if (key === 'close') return onBack();
    if (btnLoading.value) return;

    try {
      btnLoading.value = true;
      if (key === 'archived') {
        if (!docInstanceList.value.length) {
          message.warn($t('sys.onlineForm.currentRecordBookContainsNoInstanceCannotComplete'));
          return;
        }

        if (
          docInstanceList.value?.some(
            (item) => item.instanceStatus !== InstanceStatusValues.COMPLETED,
          )
        ) {
          message.warn(
            $t(
              'sys.onlineForm.thereAreUncompletedFormsInCurrentRecordBookPleaseCompleteBeforeCompletingRecordBook',
            ),
          );
          return;
        }

        Modal.confirm({
          title: $t(
            'sys.onlineForm.onceRecordBookIsCompletedItCannotBeFilledAgainPleaseOperateCarefully',
          ),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          async onOk() {
            await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
              {
                modelCategory: EntityModelCategoryEnum.ENTITY,
                modelKey: 'em_notebook',
                bsKey: 'archive',
              },
              { id: recordBookDetailInfo.value.id_ },
              {},
              { joinParamsToUrl: true },
            );
            message.success($t('sys.onlineForm.recordBookCompletedSuccessfully'));
            // 刷新记录本信息
            updateRecordBookCounter();
          },
          onCancel() {},
        });
      } else if (key === 'batch-print') {
        if (!recordBookDetailInfo.value.id_) {
          message.warn($t('sys.onlineForm.recordBookDoesNotExist'));
          return;
        }
        postFileTaskSubmit({
          tmplInstantId: recordBookDetailInfo.value.id_,
          type: 'NOTEBOOK',
        });
        message.success($t('sys.edhr.printTaskCreationWasSuccessful'));
      }
    } catch (err) {
      console.error('operation failed', err);
    } finally {
      btnLoading.value = false;
    }
  }

  async function onCreateNewSelf() {
    const r = await prepareCreate(dayjs());

    if (!r.proceed) {
      if (r.reason === 'limit') {
        message.warning(
          $t('sys.onlineForm.formCreateLimit', {
            formName: limitLabelMap[r?.createConfig?.timeUnit!],
            limit: r.checkResult?.limit,
          }),
        );
      } else if (r.reason === 'unSubmitted') {
        message.warn(
          $t(
            'sys.onlineForm.thereAreUnsubmittedFormInstancesPleaseCompleteBeforeCreatingNewInstance',
          ),
        );
      } else {
        message.error($t('sys.onlineForm.verificationFailedPleaseTryAgainLater'));
      }
      return;
    }

    const res = await gct.openUtil.modal(
      CreateNewSelfModal,
      {
        selectDocData: {},
        showTip: false,
      },
      {
        title: $t('sys.edhr.txnWithWork.addForm'),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (!res.ok) return;

    try {
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_notebook_inst',
          bsKey: 'save',
        },
        {
          notebook_id_: recordBookDetailInfo.value.id_,
          title_: res.params.description,
          tmpl_id_: recordBookDetailInfo.value.tmpl_id_,
        },
      );
      message.success(t('sys.createSuccess'));
      // 刷新表单实例生成记录列表
      updateInstanceCounter();
    } catch (e) {
      message.error($t('sys.onlineForm.creationFailed'));
    }
  }

  async function onEditDescription(data) {
    const res: any = await gct.openUtil.modal(
      EditSelfDescriptionModal,
      {
        data: { description: data.title },
      },
      {
        title: $t('sys.onlineForm.editRemarkIdentifier'),
        width: 640,
        okText: t('sys.okText'),
      },
    );
    if (res && res.ok) {
      await putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_notebook_inst',
          bsKey: 'updateByOfInstId',
        },
        {
          title_: res.params.description,
        },
        {
          id: data.id,
        },
      );
      message.success(t($t('sys.onlineForm.editRemarkIdentifierSuccess')));
      // 刷新表单实例生成记录列表
      updateInstanceCounter();
    }
  }

  const btnClickCallback = () => {
    updateInstanceCounter();
  };
</script>

<style scoped lang="less">
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
    border: 1px solid #e8ebf0;
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

    &.save-btn {
      border: 1px solid var(--ant-primary-color);
      background-color: var(--ant-primary-color);

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

    &.is-loading {
      opacity: 0.6;
      pointer-events: none;
    }
  }

  .content {
    display: flex;
    height: calc(100% - 54px);
  }

  .create-instance-btn {
    width: 20px;
    margin-left: 4px;
    padding: 4px;
    border-radius: 2px;
    background-color: var(--ant-primary-color);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    text-align: center;
  }
</style>
