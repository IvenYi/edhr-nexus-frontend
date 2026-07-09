<template>
  <a-popover
    v-model:visible="visiblePopover"
    v-if="visible && nodeInst"
    placement="rightTop"
    overlayClassName="task-node-status__popover"
  >
    <template #content>
      <div class="rounded-8px overflow-hidden py16px" :style="{ width: `${props.width ?? 263}px` }">
        <component
          v-if="!nodeInst.handlerUserId"
          :is="contentComps[props.node?.type]"
          :data="nodeInst"
          :node="node"
          class="node-popover-comp-item"
        />
        <div v-else>
          <div class="title ks-row items-center">
            <div class="font-bold ks-col">
              {{ nodeInst.handlerUserName }}
            </div>
            <div
              class="gct-custom-tag"
              :style="{
                '--ant-primary-color': '#309c41',
                fontSize: '12px',
              }"
              >{{ t(`sys.bpmn.bizNodeInstStatus.${nodeInst.status}`) }}</div
            >
          </div>
          <div class="ks-row content">
            <div>{{ $t('sys.updateTime') }}：</div>
            <div>{{ nodeInst.modifyTime }}</div>
          </div>
        </div>
        <div
          v-show="showDetailBtn"
          class="primary-gct cursor-pointer px16px pt4px"
          @click="onViewDetail"
          >{{ $t('sys.edhr.clickToView') }}</div
        >
      </div>
    </template>
    <slot></slot>
  </a-popover>
  <slot v-else></slot>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent, inject } from 'vue';
  import type { IGctBpmnNode } from '../types';
  import { useGctFlow } from '../../../hooks/useGctFlow';
  import { BpmnNodeTypeEnum } from '../enums';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/hooks/index';
  import {
    openEdhrReworkProcessModal,
    openEdhrTxnSplitModal,
  } from '/@/projects/web-render/src/render/Event/utils/kitEdhr';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const modules = import.meta.glob('./node-popover-content/*.vue');
  const contentComps = Object.keys(modules).reduce((obj, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    const rename = name.replace('bpmn', 'biz');
    obj[rename] = defineAsyncComponent(modules[path]);
    return obj;
  }, {});

  const props = defineProps<{
    node: IGctBpmnNode;
    width?: number;
    visible?: boolean;
  }>();

  const emit = defineEmits(['update:visible']);
  const { t } = useI18n();

  const bizFlowKey = inject('bizFlowKey') as string;
  const { nodeInstStatusMap } = useGctFlow(bizFlowKey);
  const { openSingleDrawer } = useApaasEbr();
  const { mitt } = useMitt();

  const nodeInst = computed(() => {
    const inst = nodeInstStatusMap.value[props.node.id]?.data;
    console.log('nodeInst', inst, contentComps, props.node);
    return inst;
  });

  const visiblePopover = computed({
    get() {
      return props.visible;
    },
    set(val) {
      emit('update:visible', val);
    },
  });

  const showDetailBtn = computed(() => {
    if (
      (BpmnNodeTypeEnum.BpmnAllocat === props.node.type && nodeInst.value.componentKey) ||
      ([
        BpmnNodeTypeEnum.BpmnBizDocument,
        BpmnNodeTypeEnum.BpmnInBound,
        BpmnNodeTypeEnum.BpmnOutBound,
      ].includes(props.node.type) &&
        nodeInst.value.onlineFormInstId) ||
      [
        BpmnNodeTypeEnum.BpmnMaterialLoading,
        BpmnNodeTypeEnum.BpmnMaterialUnLoading,
        BpmnNodeTypeEnum.BpmnInspection,
        BpmnNodeTypeEnum.BpmnRelease,
      ].includes(props.node.type)
    ) {
      return true;
    }
    return false;
  });

  const onViewDetail = () => {
    if (
      [
        BpmnNodeTypeEnum.BpmnBizDocument,
        BpmnNodeTypeEnum.BpmnInBound,
        BpmnNodeTypeEnum.BpmnOutBound,
      ].includes(props.node.type)
    ) {
      openSingleDrawer({
        selfId: nodeInst.value.onlineFormInstId,
        title: $t('sys.onlineForm.formDetail'),
        isViewPage: true,
      });
      visiblePopover.value = false;
    } else if (props.node.type === BpmnNodeTypeEnum.BpmnAllocat) {
      if (nodeInst.value.componentKey) {
        visiblePopover.value = false;
      }
      // 返工配置
      if (nodeInst.value.componentKey === 'component_rework') {
        const { containerId, snId, txnInstId, snReworkId } = nodeInst.value;
        openEdhrReworkProcessModal({
          single: !!snId,
          opeType: 'detail',
          params: {
            taskType: snId ? 'sn' : 'container',
            id_: snId ? snReworkId : undefined, // SN 返工任务 ID
            txn_inst_id_: txnInstId,
            container_id_: containerId || undefined,
            sn_id_: snId || undefined,
          },
        });
      }
      // 拆分
      if (nodeInst.value.componentKey === 'component_split') {
        openEdhrTxnSplitModal({
          params: {
            isViewMode: true,
            container_id_: nodeInst.value.containerId || undefined,
            sn_id_: nodeInst.value.snId || undefined,
          },
        });
      }
    }
    // 通过事件总线触发 nodePopoverClick 事件
    mitt.emit('TXN_NODE_POPOVER_CLICK', {
      node: props.node,
      data: nodeInst.value,
    });
  };
</script>

<style lang="less" scoped>
  .task-node-status {
    &__popover {
      .ant-popover-inner-content {
        padding: 0;
      }
    }

    &__content {
      position: relative;
    }
  }

  .node-status {
    color: #8f8f8f;

    &::before {
      content: ' ';
      display: inline-block;
      width: 4px;
      height: 4px;
      margin-right: 4px;
      border-radius: 50%;
      background-color: #8f8f8f;
      vertical-align: middle;
    }

    &-RUNNING {
      color: #3168ec;

      &::before {
        background-color: #3168ec;
      }
    }

    &-COMPLETED {
      color: #309c41;
    }
  }

  .title {
    padding: 0 16px 8px;
    border-bottom: 1px solid #e8ebf0;
  }

  .content {
    padding: 8px 16px 0;
  }

  :deep(.node-popover-comp-item) {
    & > div {
      & > .ks-row {
        & > div {
          &:first-child {
            color: #5a5f6b;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            white-space: nowrap;
          }

          &:last-child {
            color: #1a1d23;
            word-break: break-all;
          }
        }
      }
    }

    .item-label {
      color: #5a5f6b;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }

    .item-value {
      color: #1a1d23;
      word-break: break-all;
    }
  }
</style>
