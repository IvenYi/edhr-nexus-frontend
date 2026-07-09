<template>
  <div :class="[ns.b(), 'approval-task-modal']">
    <collapse-detail
      class="flex-shrink-0"
      :collapseInfo="collapseInfo"
      :defaultExpand="true"
      ref="collapseDetailRef"
    >
      <template #approval_status="{ item }">
        <approval-status-tag :value="item.name" />
      </template>
    </collapse-detail>

    <PreviewContainer
      :class="[ns.e('form')]"
      :loading="loading"
      :hasData="hasData"
      :basicInfoList="basicInfoList"
      :dataCenterMap="dataCenterMap"
      :formStateMap="formStateMap"
      :pageDataMap="pageDataMap"
      :defaultDataMap="defaultDataMap"
      :updatePageData="updatePageData"
    />

    <div class="approval-task-modal_footer">
      <div class="approval-task-modal_footer--left">
        <a-button @click="handleViewProcess">
          {{ t('sys.edhr.approvalProcess') }}
        </a-button>
        <a-button class="ml-2" @click="openMockFill" v-if="!detailMode">
          {{ $t('sys.edhr.designMode.SimulateFill') }}
        </a-button>
      </div>

      <div
        class="approval-task-modal_footer--right ks-col ks-row justify-end gap-8px"
        v-if="!detailMode"
      >
        <base-button
          v-for="item in actionButtonList"
          :key="item.type"
          :title="item.customTitle"
          v-bind="{ ...(item.style || {}) }"
          @click="handleBtnClick(item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { IModal, useNamespace } from '@gct/runtime';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import PreviewContainer from '/@online-form/views/render/preview-container.vue';
  import ApprovalStatusTag from '/@/projects/online-form/src/views/web-render/components/approval-status-tag/approval-status-tag.vue';
  import BaseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { PlatformEnum, RenderModeEnum, useRenderPageFactory } from '@gct/nocode-base';
  import { openApprovalFlowModal } from '/@/projects/web-render/src/render/Event/utils/kitEdhr';
  import { openMockReportUrl } from '/@/projects/online-form/src/views/render/__logic__/preview.logic';
  import { getDocControlProcessInfo } from '/@/apis/gct-apaas/DocControlProcessController';
  import { useApprovalButton } from './composable/useApprovalButton';

  const props = defineProps<{
    modal: IModal;
    detailMode: boolean;
    subjectData: {
      name: string;
      code: string;
      description: string;
      docBaseId: string;
      docVersionId: string;
      controlTmplType: string;
      businessId: string;
      status: string;
      [key: string]: any;
    };
    showMockBtn?: boolean;
    paramExtraProps?: {
      [key: string]: any;
    };
  }>();

  const { t } = useI18n();

  const ns = useNamespace('online-form-temp-info');

  const {
    loading,
    hasData,
    basicInfoList,
    pageDataMap,
    formStateMap,
    dataCenterMap,
    defaultDataMap,
    updatePageData,
  } = useRenderPageFactory(
    Object.assign(props.subjectData, { selfId: props.subjectData.businessId }),
    {
      factoryType: 'template',
      requestCallback: getCacheFormTempInfo,
      platformType: PlatformEnum.INTEGRATION_PAAS_SI,
      isDetailPage: () => props.detailMode,
      getBtnDisplayRules: () => false,
      paramExtraProps: props.paramExtraProps,
      isMockReport: false,
      renderModeType: RenderModeEnum.ViewMode,
    },
  );

  const { actionButtonList, renderActionButton, handleButtonFn } = useApprovalButton();

  const collapseInfo = computed(() => {
    return [
      {
        label: t('sys.name'),
        name: props.subjectData?.name || '--',
      },
      {
        label: t('sys.platform.code'),
        name: props.subjectData?.code || '--',
      },
      {
        label: t('sys.edhr.processChoice.status'),
        name: props.subjectData?.status,
        useSlot: true,
        slotName: 'approval_status',
        slotData: {},
      },
    ];
  });

  const templateInfo = computed(() => {
    if (props.subjectData.snapshot) {
      return JSON.parse(props.subjectData.snapshot);
    }
    return {};
  });

  async function getCacheFormTempInfo() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return templateInfo.value;
  }

  const tmplId = computed(() => {
    const { docBaseId, docVersionId } = props.subjectData;
    return `${docBaseId}:${docVersionId}`;
  });

  const taskId = ref('');
  const getControlInfo = async () => {
    const { controlTmplType } = props.subjectData;
    const res: any = await getDocControlProcessInfo({
      controlTmplType,
      tmplId: tmplId.value,
    });

    taskId.value = res?.operationsDTO?.taskId;

    actionButtonList.value = renderActionButton(
      res?.operationsDTO?.buttons || [],
      res?.operationsDTO?.nodeDef?.buttonConfig,
      {
        readonly: props.detailMode,
        isInit: false,
      },
    );
  };

  const handleBtnClick = async (btn) => {
    await handleButtonFn(btn, {
      taskId: taskId.value,
      tmplId: tmplId.value,
    });
    props.modal.dismiss({ ok: true });
  };

  const openMockFill = () => {
    openMockReportUrl({
      tid: props.subjectData.docVersionId,
      platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    });
  };

  /**
   * 查看审核设计流程
   */
  function handleViewProcess() {
    openApprovalFlowModal(
      {
        instId: props.subjectData.processInstanceId,
      },
      true,
    );
  }

  onMounted(async () => {
    await getControlInfo();
  });
</script>

<style lang="scss" scoped>
  $online-form-temp-info: ();

  @include b(online-form-temp-info) {
    @include set-component-css-var(online-form-temp-info, $online-form-temp-info);

    @include e(form) {
      flex: 1 1 auto;
      background-color: #e6e9ef;
    }

    display: flex;
    height: 100%;
    overflow: auto;

    @include e(body) {
    }

    display: flex;
    flex-direction: column;
  }

  .approval-task-modal {
    padding: 16px;
    padding-bottom: 0;
    height: 100%;
    display: flex;
    flex-direction: column;

    &_footer {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      // box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);

      &--right {
        button {
          margin-left: 12px;
        }
      }
    }
  }
</style>
