<template>
  <BizBpmnDiagram :readonly="true" :inst-mode="true" />
</template>

<script setup lang="ts">
  import { watch, onBeforeUnmount } from 'vue';
  import { FlowNodeInstStatus, useGctFlow } from '@gct/flow';
  import { BizBpmnDiagram } from '@gct/flow/src/plugins/biz-bpmn';
  import { debounce } from 'lodash-es';
  import { getBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { getBizProcessDefinitionVersionById } from '/@/apis/gct-apaas/BizProcessDefinitionVersionController';
  import { getProcessInstanceInfo } from '/@/apis/gct-apaas/ProcessInstanceController';
  import { useGctBizBpmn } from '@gct/flow/src/plugins/biz-bpmn/hooks/useGctBpmn';
  import { BizNodeInstStatus, BizStatusToFlowStatus } from '@gct/flow/src/plugins/biz-bpmn/enums';

  const { setGctFlowData, reset, setNodeInstStatusMap, setReadonly, gctFlowData } =
    useGctFlow('bizBpmn');
  const { init } = useGctBizBpmn();

  const props = defineProps<{
    txnId?: string;
    instId?: string;
  }>();

  const getFlow = async () => {
    const { instId, txnId } = props;
    if (!instId) return;
    setGctFlowData([] as any);
    await getFlowJson(instId);
    await getNodeData(txnId);
  };

  const getFlowJson = async (id) => {
    const info: any = await getProcessInstanceInfo({ id });
    const res = await getBizProcessDefinitionVersionById({ id: info.procDefVerId });
    const json = res?.json ? JSON.parse(res?.json) : '';
    init(json, 'edhr');
    setReadonly(true);
  };

  const getNodeData = async (txnInstId) => {
    const res: any = await getBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_txn_node_status',
        bsKey: 'biz_search',
      },
      {
        txnInstId,
      },
    );
    const statusMaps = (res || []).reduce((map, e) => {
      map[e.nodeKey] = {
        status: BizStatusToFlowStatus[e.status],
        data: Object.assign(e, props),
      };
      return map;
    }, {});
    // 开始、结束节点没有日志记录，根据流程节点的状态，判断是否已经开始或结束
    if (res?.length && !res?.every((e) => e.status === BizNodeInstStatus.Waiting)) {
      const startNode = gctFlowData.value?.children[0];
      if (startNode) {
        statusMaps[startNode.id] = {
          status: FlowNodeInstStatus.COMPLETED,
        };
      }
    }
    if (res?.length && res?.every((e) => e.status === BizNodeInstStatus.Finished)) {
      const endNode = gctFlowData.value?.children?.slice(-1)[0];
      statusMaps[endNode.id] = {
        status: FlowNodeInstStatus.COMPLETED,
      };
    }
    setNodeInstStatusMap(statusMaps);
  };

  const getFlowDebounce = debounce(getFlow, 100);

  watch(
    () => props,
    () => {
      getFlowDebounce();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  onBeforeUnmount(() => {
    reset();
  });
</script>

<style></style>
