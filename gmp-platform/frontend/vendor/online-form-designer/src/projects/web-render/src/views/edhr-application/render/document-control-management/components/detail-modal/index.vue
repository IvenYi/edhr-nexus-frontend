<template>
  <div v-if="showLog" class="absolute top-0px left-0px z-10 bg-[#f7f8fa] h100% w100%">
    <OperationLogWrap
      :tmplId="tmplId"
      :procDefType="ProcDefType.DOC_CONTROL_APPROVE"
      :showTable="false"
      @close="showLog = false"
    />
  </div>
  <ControlPath v-if="showControlPath" :tmplId="tmplId" @on-close="showControlPath = false" />
  <div class="ks-column detail-container relative">
    <div class="ks-col overflow-auto content">
      <PreviewContent v-bind="$props" />
    </div>
    <div class="h62px ks-row-middle w100% footer z-9">
      <a-button type="link" @click="showLog = true">
        <i class="iconfont icon-a-Group427318493 mr-4px !text-14px"></i>
        {{ $t('sys.menu.operationLog') }}
      </a-button>
      <a-button type="link" @click="showControlPath = true">
        <i class="iconfont icon-liucheng1 mr-4px !text-14px"></i>
        {{ $t('sys.edhr.controlPath') }}
      </a-button>
      <a-button type="link" @click="openMockFill" v-if="showMockBtn">
        {{ $t('sys.edhr.designMode.SimulateFill') }}
      </a-button>
      <div class="ks-col ks-row justify-end px24px gap-8px">
        <a-button
          @click="
            modal.dismiss({
              ok: true,
            })
          "
        >
          {{ $t('sys.cancel') }}
        </a-button>
        <baseButton
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
  import { computed, onMounted, ref, toRaw } from 'vue';
  import PreviewContent from './preview-content.vue';
  import ControlPath from './control-path.vue';
  import OperationLogWrap from '/@/projects/online-form/src/views/integration/apaas_si/render/operation-log/operation-log-wrap.vue';
  import { getDocControlProcessInfo } from '/@/apis/gct-apaas/DocControlProcessController';
  import { IModal } from '@gct/runtime';
  import { PlatformEnum } from '@gct/nocode-base';
  import { useActionButton, IActionButtonItem } from '../hooks/useControlBtn';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { excApprovalOperate } from '/@/projects/online-form/src/approval';
  import { openMockReportUrl } from '/@online-form/views/render/__logic__/preview.logic';
  import { isEmpty } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import { ProcDefType } from '/@/projects/online-form/src/views/integration/apaas_si/render/operation-log/types';

  const props = defineProps<{
    modal: IModal;
    data: any;
    readonly?: boolean;
    isInit?: boolean;
    showMockBtn?: boolean;
  }>();

  const showLog = ref(false);
  const showControlPath = ref(false);
  const actionButtonList = ref<IActionButtonItem[]>([]);
  const { renderActionButton } = useActionButton();
  const taskId = ref();

  onMounted(() => {
    getControlInfo();
  });

  const tmplId = computed(() => {
    const { docBaseId, docVersionId } = props.data;
    return `${docBaseId}:${docVersionId}`;
  });

  const getControlInfo = async () => {
    const { controlTmplType } = props.data;
    const res: any = await getDocControlProcessInfo({
      controlTmplType,
      tmplId: tmplId.value,
    });
    const operationsDTO = res.operationsDTO;
    const nodeDef = operationsDTO?.nodeDef;
    actionButtonList.value = renderActionButton(
      operationsDTO?.buttons || [],
      nodeDef?.buttonConfig,
      {
        readonly: props.readonly,
        isInit: props.isInit,
      },
    );
    taskId.value = operationsDTO?.taskId;
  };

  const onCloseModal = () => {
    props.modal.dismiss();
  };

  const handleBtnClick = async (btn) => {
    if (btn.type === 'Cancel') {
      onCloseModal();
      return;
    }
    const signResult = await excApprovalOperate(btn);

    if (!signResult) return;

    const buttonConfig = JSON.stringify({
      title: btn.customTitle,
      color: btn.style?.backgroundColor,
    });
    const baseParams = {
      taskId: taskId.value,
      btnKey: btn.isCustom ? btn.flowAction : btn.type,
      tmplId: tmplId.value,
      buttonConfig,
    };
    // 需要签名或审批意见
    if (typeof signResult === 'object') {
      const signature = toRaw(signResult.signature);
      Object.assign(baseParams, {
        opinion: signResult.comment,
        signature: !isEmpty(signature) ? JSON.stringify([signature]) : undefined,
      });
    }
    await btn.api(baseParams);
    message.success($t('sys.operatingTitle'));
    props.modal.dismiss({
      ok: true,
    });
  };

  const openMockFill = () => {
    openMockReportUrl({
      tid: props.data.docVersionId,
      platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    });
  };
</script>
<style lang="less" scoped>
  .detail-container {
    height: calc(100vh - 55px);

    .content {
      background-color: #e6e9ef;
    }

    .footer {
      box-shadow: 0px -4px 4px 0px rgba(0, 0, 0, 0.08);
    }
  }
</style>
