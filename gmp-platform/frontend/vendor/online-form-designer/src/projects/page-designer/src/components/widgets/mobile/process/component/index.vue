<template>
  <div ref="histortyRef" class="approval-history relative">
    <div
      class="approval-history-title text-[16px] text-[#242424]"
      :class="[needSticky && 'sticky-node']"
    >
      <div v-if="showTitle" class="pt6px pb8px font-500 text-center bg-[#ffffff]">
        {{ title }}
      </div>
      <div class="py8px ks-row px16px">
        <div class="ks-col">
          <!-- {{ ch_ProcessStatusMap[logInfo.status] }} -->
          {{ $t('sys.process.index') + processStatus }}
        </div>
        <div class="text-[12px] text-[#474747]">
          <span v-if="logInfo.duration" class="text-[#8F8F8F]">
            {{ $t('sys.pageDesigner.totalTimeSpent') }}：
          </span>
          {{ logInfo.duration }}
        </div>
      </div>
    </div>
    <div class="bg-[#FFFFFF] rounded-4px p16px text-[12px]">
      <div class="process-node-wrap pl16px">
        <div v-for="(item, i) in logData" :key="i" class="process-node">
          <!-- 审批节点 -->
          <ApprovalNode
            v-if="item.type === BpmnNodeTypeEnum.BpmnApproval"
            :data="item"
            :key="i"
            :type="type"
            :titleHeight="titleHeight"
            :hiddenOpinion="hiddenOpinion"
            :hiddenSignature="hiddenSignature"
            :isCompeleted="
              logInfo?.status !== ProcessStatusEnum.COMPLETED && i === (logData?.length ?? 0) - 1
            "
          />
          <!-- 开始、消息、脚本节点 -->
          <div
            v-else
            class="process-node-title text-[14px] font-500 mb8px ks-row-middle"
            :style="{
              '--type-color': '#309C41',
              '--status-color':
                logInfo?.status !== ProcessStatusEnum.COMPLETED && i === (logData?.length ?? 0) - 1
                  ? '#3168EC'
                  : '#309C41',
            }"
          >
            <div class="ell ks-col w50px" :title="item.name">{{ item.name }}</div>
            <div
              v-if="item.startTime && item.type !== BpmnNodeTypeEnum.BpmnStart"
              class="text-[#666666] text-[12px] font-400"
            >
              {{ item.startTime }}
            </div>
          </div>
          <div
            v-if="
              item.type !== BpmnNodeTypeEnum.BpmnEnd && item.type !== BpmnNodeTypeEnum.BpmnApproval
            "
            class="process-node-content bg-[#FBFBFC] rounded-4px ks-row p8px flex"
          >
            <div class="process-node-content-left mr8px flex-1">
              <div class="avator-wrap flex mb8px">
                <div class="ks-row-center mr-8px">
                  <img
                    :src="item.avatar ? MOBILE_MINIO_PATH + item.avatar : avatorDefault"
                    width="24"
                    height="24"
                    style="border-radius: 50%"
                  />
                </div>
                <div
                  class="ell text-[12px] text-[#666666] mt4px text-center mw50px"
                  :title="item.username"
                >
                  {{ item.username }}
                </div>
              </div>
              <div class="process-node-content-main ks-col">
                <!-- 开始节点/脚本节点 -->
                <div
                  v-if="
                    item.type === BpmnNodeTypeEnum.BpmnSubmit ||
                    item.type === BpmnNodeTypeEnum.BpmnJs
                  "
                  class="node-type-msg circle"
                  :style="{
                    '--type-color':
                      item.type === BpmnNodeTypeEnum.BpmnSubmit ? '#3168EC' : '#309C41',
                  }"
                >
                  {{ item.message }}
                </div>
                <!-- 消息节点 -->
                <div v-else-if="item.type === BpmnNodeTypeEnum.BpmnMessage" class="node-type-msg">
                  <span v-show="item.success" class="text-[#309C41] mr14px">
                    {{ $t('sys.pageDesigner.numOfSuccesses', { num: ` ${item.success} ` }) }}
                  </span>
                  <span v-show="item.error" class="text-[#F54547]">
                    {{ $t('sys.pageDesigner.numOfError', { num: ` ${item.error} ` }) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="process-node-content-right w128px text-right text-[#8F8F8F] ks-column">
              <div>{{ item.endTime }}</div>
              <div v-if="item.duration" class="ks-col ks-row-end justify-end">
                耗时: {{ item.duration }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { BpmnNodeTypeEnum, ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import ApprovalNode from './approval-node.vue';
  import avatorDefault from '/@/assets/images/avator-default.png';
  import { ProcessHistory } from '/@/apis/gct-apaas/model';
  import { ProcessHistoryResult } from '@mobile/apis/gct-apaas/model';
  import { getProcessApprovalLogApproveHistory } from '/@/apis/gct-apaas/ProcessApprovalLogController';
  import { parentObserver } from '/@/components/PaasBpmnLog/hooks/useObserver';
  import { ch_ProcessStatusMap, ProcessStatusEnum } from '@gct/runtime';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const props = defineProps<{
    /**流程id */
    processId: string;
    /**是否显示标题区域 */
    showTitle?: boolean;
    /**标题 */
    title?: string;
    /**是否隐藏审批意见 */
    hiddenOpinion?: boolean;
    /**是否隐藏签名 */
    hiddenSignature?: boolean;
    /** 渲染类型 */
    type: string;
    /** 流程实例id */
    instanceId?: string;
  }>();
  const histortyRef = ref();

  const needSticky = ref(false);

  const logData = ref<ProcessHistory[]>([]);

  const logInfo = ref<ProcessHistoryResult>({});

  onMounted(async () => {
    if (props.type === 'render') {
      parentObserver(histortyRef, (isNeed) => {
        needSticky.value = isNeed;
      });
    } else {
      logInfo.value.duration = '1天12小时26分钟';
      logInfo.value.status = 'COMPLETED';

      logData.value = processData.value;
    }
  });

  const titleHeight = computed(() => {
    let height = 0;
    if (props.showTitle && props.title) height += 40;
    return height;
  });

  const processStatus = computed(() => {
    const status = ch_ProcessStatusMap[logInfo.value?.status as ProcessStatusEnum];
    return status ? $t(status) : '';
  });

  watch(
    () => props.instanceId,
    (id) => {
      console.log('id', id);

      if (id) getHistoryData();
    },
    {
      immediate: true,
    },
  );

  async function getHistoryData() {
    const res: any = await getProcessApprovalLogApproveHistory({
      id_: props.instanceId,
    });
    logInfo.value = res;

    logData.value = res?.processHistoryList || [];
  }

  const processData = ref<ProcessHistory[]>([
    {
      name: '开始节点',
      type: BpmnNodeTypeEnum.BpmnStart,
      message: '发起',
      username: '系统',
      startTime: '2024-08-14 16:38',
    },
    {
      name: '消息节点',
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
          username: '张三',
          approval: ButtonTypeEnum.Reassign,
          approvalMsg: '这里是审批意见',
          startTime: '2024-08-14 16:38',
          endTime: '2024-08-14 16:38',
          duration: '8分钟',
          signature: './imgs/sign.png',
        },
      ],
    },
    {
      name: '结束节点',
      type: BpmnNodeTypeEnum.BpmnEnd,
      startTime: '2024-08-14 16:38',
      endTime: '2024-08-14 16:38',
    },
  ]);
</script>
<style lang="less" scoped>
  .process-node-wrap {
    border-left: 1px dashed #e0e3ea;
    .process-node {
      & + .process-node {
        margin-top: 28px;
      }

      &-title {
        position: relative;
        &::before {
          content: ' ';
          display: block;
          width: 6px;
          height: 6px;
          position: absolute;
          top: 7px;
          left: -19px;
          background-color: var(--status-color);
          border-radius: 50%;
          box-shadow: 0 0 0 2px hsl(from var(--status-color) h s 93%);
        }
      }
    }
  }
  .node-type-msg {
    color: var(--type-color);
    height: 100%;
    display: flex;
    align-items: flex-end;
    position: relative;

    // &.circle {
    //   &::before {
    //     content: ' ';
    //     display: inline-block;
    //     width: 4px;
    //     height: 4px;
    //     border-radius: 50%;
    //     background-color: var(--type-color);
    //     position: absolute;
    //     left: 0;
    //     bottom: 8px;
    //   }
    // }
  }

  .sticky-node {
    background-color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 9;
  }
  .mw50px {
    max-width: 50px;
  }
</style>
