<template>
  <div
    v-if="!props.refForm"
    class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed"
  >
    <span class="text-[#c3c3c3] text-14px"> {{ $t('sys.pageDesigner.selectRefProcessForm') }}</span>
  </div>
  <approvalHistoryComp
    v-else
    :show-title="props.showTitle"
    :title="props.title"
    :is-table="props.compType === 'table'"
    :is-design="true"
    :info="histortyInfo"
    :hidden-opinion="!props.showOpinion"
    :hidden-signature="!props.showSignature"
  />
</template>
<script setup lang="ts">
  import { toRefs } from 'vue';
  import { ApprovalHistory } from '/@page-designer/types/web';
  import approvalHistoryComp from '/@/components/PaasBpmnLog/index.vue';
  import { BpmnNodeTypeEnum, ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import signSample from '/@/components/PaasBpmnLog/imgs/sign.png';
  import { ProcessStatusEnum } from '@gct/runtime';

  const defProps = defineProps<{ widget: ApprovalHistory }>();

  const { props } = toRefs(defProps.widget);

  const histortyInfo = {
    duration: '1天12小时26分钟',
    status: ProcessStatusEnum.COMPLETED,
    processHistoryList: [
      {
        name: '开始节点',
        type: BpmnNodeTypeEnum.BpmnSubmit,
        message: '发起',
        username: '张三',
        startTime: '2024-08-14 16:38',
        endTime: '2024-08-14 16:38',
      },
      {
        name: '消息节点',
        message: '成功',
        type: BpmnNodeTypeEnum.BpmnMessage,
        success: 50,
        error: 50,
        startTime: '2024-08-14 16:38',
        endTime: '2024-08-14 16:38',
        duration: '1天12小时26分钟',
        username: '系统',
      },
      {
        name: '脚本节点',
        type: BpmnNodeTypeEnum.BpmnJs,
        message: '成功',
        startTime: '2024-08-14 16:38',
        endTime: '2024-08-14 16:38',
        duration: '1天12小时26分钟',
        username: '系统',
      },
      {
        name: '审批节点',
        type: BpmnNodeTypeEnum.BpmnApproval,
        startTime: '2024-08-14 16:38',
        endTime: '2024-08-14 16:38',
        approvalList: [
          {
            username: '系统',
            approval: ButtonTypeEnum.Approve,
            approvalMsg: '这里是审批意见',
            startTime: '2024-08-14 16:38',
            endTime: '2024-08-14 16:38',
            duration: '8分钟',
            signature: signSample,
          },
        ],
      },
      {
        name: '结束节点',
        type: BpmnNodeTypeEnum.BpmnEnd,
        startTime: '2024-08-14 16:38',
        endTime: '2024-08-14 16:38',
      },
    ],
  };
</script>
<style lang="less" scoped></style>
