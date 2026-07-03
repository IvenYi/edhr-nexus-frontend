<template>
  <div ref="histortyRef" class="approval-history relative">
    <div
      class="approval-history-title w100% text-[16px] text-[#242424]"
      :class="[needSticky && 'sticky-node']"
    >
      <div v-if="showTitle" class="pt6px pb8px font-500 ell break-all" :title="title">
        {{ title }}
      </div>
      <div v-if="!isTable && logDetail?.duration" class="py8px ks-row-middle">
        <div
          v-if="logDetail?.status"
          class="ell ks-col break-all"
          :title="
            $t('sys.process.processStatus', {
              status: $t(ch_ProcessStatusMap[logDetail?.status || '']),
            })
          "
        >
          {{
            $t('sys.process.processStatus', {
              status: $t(ch_ProcessStatusMap[logDetail?.status || '']),
            })
          }}
        </div>
        <div class="text-[12px] text-[#474747]">
          {{ $t('sys.pageDesigner.totalTimeSpent') }}：{{ logDetail?.duration }}
        </div>
      </div>
    </div>
    <div v-if="!isTable" class="bg-[#FFFFFF] rounded-4px p16px text-[12px]">
      <div v-if="!logDetail?.processHistoryList?.length" class="py8px">
        <a-empty :image="simpleImage" />
      </div>
      <div v-else class="process-node-wrap pl16px">
        <div v-for="(item, i) in logDetail?.processHistoryList ?? []" :key="i" class="process-node">
          <!-- 审批节点 -->
          <ApprovalNode
            v-if="item.type === BpmnNodeTypeEnum.BpmnApproval"
            :data="item"
            :key="i"
            :titleHeight="titleHeight"
            :isDesign="isDesign"
            :hiddenOpinion="hiddenOpinion"
            :hiddenSignature="hiddenSignature"
            :isLastNode="i === (logDetail?.processHistoryList?.length ?? 0) - 1"
            :isCompeleted="
              logDetail?.status !== ProcessStatusEnum.COMPLETED &&
              i === (logDetail?.processHistoryList?.length ?? 0) - 1
            "
          />
          <!-- 开始、消息、脚本节点 -->
          <div
            v-else
            class="process-node-title text-[14px] font-500 mb8px ks-row-middle"
            :style="{
              '--type-color': '#309C41',
              '--status-color':
                logDetail?.status !== ProcessStatusEnum.COMPLETED &&
                i === (logDetail?.processHistoryList?.length ?? 0) - 1
                  ? '#3168EC'
                  : '#309C41',
            }"
          >
            <div class="ell ks-col break-all" :title="item.name">{{ item.name }}</div>
            <div v-if="item.startTime" class="text-[#666666] text-[12px] font-400">
              {{ item.startTime }}
            </div>
          </div>
          <div
            v-if="
              item.type !== BpmnNodeTypeEnum.BpmnEnd && item.type !== BpmnNodeTypeEnum.BpmnApproval
            "
            class="process-node-content bg-[#FBFBFC] rounded-4px ks-row p8px"
          >
            <div class="process-node-content-left mr12px">
              <div class="avatar-wrap w42px">
                <div class="ks-row-center">
                  <img
                    :src="item.avatar ? '/minio/' + item.avatar : avatarDefault"
                    width="32"
                    height="32"
                    style="border-radius: 50%"
                  />
                </div>
                <div
                  class="ell text-[12px] text-[#666666] mt4px text-center break-all"
                  :title="item.username"
                >
                  {{ item.username }}
                </div>
              </div>
            </div>
            <div class="process-node-content-main ks-col">
              <!-- 开始节点/脚本节点 -->
              <div
                v-if="
                  item.type === BpmnNodeTypeEnum.BpmnSubmit || item.type === BpmnNodeTypeEnum.BpmnJs
                "
                class="node-type-msg circle"
                :style="{
                  '--type-color': item.type === BpmnNodeTypeEnum.BpmnSubmit ? '#3168EC' : '#309C41',
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
            <div class="process-node-content-right w148px text-right text-[#8F8F8F] ks-column">
              <div>{{ item.endTime }}</div>
              <div v-if="item.duration" class="ks-col ks-row-end justify-end">
                {{ $t('sys.integration.timeConsuming') }}: {{ item.duration }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <vxe-table
        :data="tableData"
        :height="264"
        show-overflow="title"
        :column-config="{
          resizable: true,
        }"
        :class="{
          default: true,
        }"
      >
        <vxe-column type="seq" :title="$t('sys.pageDesigner.index')" width="60" />
        <vxe-column
          field="name"
          :title="$t('sys.appDesigner.approval.nodeName')"
          min-width="100px"
        />
        <vxe-column field="username" :title="$t('sys.pageDesigner.handler')" min-width="100px" />
        <vxe-column
          field="message"
          :title="$t('sys.pageDesigner.handleOperation')"
          min-width="160px"
        >
          <template #default="{ row }">
            <div v-if="row.type === BpmnNodeTypeEnum.BpmnApproval">
              {{ $t(`sys.process.paasBpmnButtonEvent.${row.approval}`) }}
            </div>
            <div v-else-if="row.type === BpmnNodeTypeEnum.BpmnMessage">
              <span v-show="row.success">
                {{ $t('sys.pageDesigner.numOfSuccesses', { num: row.success }) }}
                <span v-show="row.error">，</span>
              </span>
              <span v-show="row.error">
                {{ $t('sys.pageDesigner.numOfError', { num: row.error }) }}
              </span>
            </div>
            <div v-else>{{ row.message }}</div>
          </template>
        </vxe-column>
        <vxe-column field="endTime" :title="$t('sys.pageDesigner.handleTime')" min-width="180px" />
        <vxe-column
          v-if="!hiddenOpinion"
          field="approvalMsg"
          :title="$t('sys.appDesigner.approval.opinion')"
          min-width="90px"
        />
        <vxe-column
          v-if="!hiddenSignature"
          field="signature"
          :title="$t('sys.model.sign')"
          min-width="80px"
        >
          <template #default="{ row }">
            <a-image
              v-if="row.signature"
              :width="38"
              :height="22"
              :src="isDesign ? row.signature : `/minio/${row.signature}`"
              :fallback="imageError"
            >
              <template #previewMask>
                <i class="iconfont icon-chakan1"></i>
              </template>
            </a-image>
          </template>
        </vxe-column>
        <template #empty>
          <a-empty :image="simpleImage" />
        </template>
      </vxe-table>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import ApprovalNode from './components/approval-node.vue';
  import avatarDefault from './imgs/avatar-default.png';
  import { parentObserver } from './hooks/useObserver';
  import { useLog } from './hooks/uselog';
  import imageError from '/@page-designer/assets/image-error.svg';
  import { ProcessHistoryResult } from '/@/apis/gct-apaas/model';
  import { ch_ProcessStatusMap, ProcessStatusEnum } from '@gct/runtime';
  import { Empty } from 'ant-design-vue';

  const props = defineProps<{
    /**流程实例id */
    instanceId?: string;
    /**是否显示标题区域 */
    showTitle?: boolean;
    /**标题 */
    title?: string;
    /**是否开启表格样式 */
    isTable?: boolean;
    /**是否隐藏审批意见 */
    hiddenOpinion?: boolean;
    /**是否隐藏签名 */
    hiddenSignature?: boolean;
    /**是否是设计模式 */
    isDesign?: boolean;
    /**设计模式，假数据 */
    info?: ProcessHistoryResult;
  }>();

  const histortyRef = ref();
  const needSticky = ref(false);
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const { logDetail, init } = useLog();

  const titleHeight = computed(() => {
    let height = 0;
    if (props.showTitle && props.title) height += 40;
    if (!props.isTable) height += 40;
    return height;
  });

  const tableData = computed(() => {
    const list = logDetail.value?.processHistoryList ?? [];
    return list.reduce((data: any[], item: any) => {
      if (item.type === BpmnNodeTypeEnum.BpmnEnd) {
        return data;
      }
      if (item.type === BpmnNodeTypeEnum.BpmnApproval) {
        data.push(
          ...(item.approvalList.filter((e) => e.approval) || []).map((e: any) => {
            try {
              const signature = e.signature ? JSON.parse(e.signature).url : '';
              return { ...e, signature, name: item.name };
            } catch (error) {
              return {
                ...e,
                name: item.name,
              };
            }
          }),
        );
      } else data.push(item);
      return data;
    }, []);
  });

  watch(
    () => props.instanceId,
    (id) => {
      if (id) init(id);
    },
    {
      immediate: true,
    },
  );

  onMounted(async () => {
    if (!props.isDesign) {
      parentObserver(histortyRef, (isNeed) => {
        needSticky.value = isNeed;
      });
    } else {
      logDetail.value = props.info;
    }
  });
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
    padding-left: 9px;

    &.circle {
      &::before {
        content: ' ';
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--type-color);
        position: absolute;
        left: 0;
        bottom: 8px;
      }
    }
  }

  :deep(.ant-image-img) {
    width: 100%;
    height: 100%;
    vertical-align: top;
  }

  .sticky-node {
    background-color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 9;
  }
  :deep(.vxe-table--render-default .vxe-body--column.col--ellipsis) {
    height: 44px;
  }
</style>
