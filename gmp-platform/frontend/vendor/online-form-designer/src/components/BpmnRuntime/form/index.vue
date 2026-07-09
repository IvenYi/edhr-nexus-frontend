<template>
  <BpmnDiagram :readonly="true" :inst-mode="true" />
</template>

<script setup lang="ts">
  import { watch, onBeforeUnmount } from 'vue';
  import { useGctFlow, NodeInstStatusMap } from '@gct/flow';
  import { BpmnDiagram, useGctBpmn } from '@gct/flow/src/plugins/bpmn';
  import { getProcessPathFindAllByOfInstanceId } from '/@/apis/gct-apaas/ProcessPathController';
  import { useFlowNodeUserEcho } from '../form-tmpl/logic';

  const { init: echoInit, calcNodeStatusMap } = useFlowNodeUserEcho();
  const { setNodeInstStatusMap, reset } = useGctFlow();
  const { init } = useGctBpmn();

  const props = defineProps<{
    ofInstId: string; // 表单实例 id
    /** 所属模型key */
    modelKey: string;
    api?: Function;
  }>();

  onBeforeUnmount(() => {
    reset();
  });

  watch(
    () => props.ofInstId,
    async (value) => {
      if (!value) return;
      const res = await (props.api || getProcessPathFindAllByOfInstanceId)({
        ofInstanceId: value,
        processInstanceId: value,
      });

      // 处理执行到的节点
      const paths = res?.paths || [];
      const defVerJson = res?.proDefVer?.json;
      init(defVerJson);
      const nodeStatusMap: NodeInstStatusMap = paths.reduce((total: NodeInstStatusMap, item) => {
        let ids: string[] = item.nodeKey ? [item.nodeKey] : item.caseId?.split(':');
        ids.forEach((id) => {
          total[id!] = {
            status: item.approveStatus,
            data: item,
          };
        });

        return total;
      }, {});

      // 处理未执行到的节点
      await echoInit(props.modelKey);
      const flow = JSON.parse(defVerJson!) as any;
      const undoNodeStatusMap = await calcNodeStatusMap(flow, Object.keys(nodeStatusMap));
      Object.assign(nodeStatusMap, undoNodeStatusMap);

      // 设置节点状态
      console.log('流程节点节点状态nodeStatusMap', nodeStatusMap);
      setNodeInstStatusMap(nodeStatusMap);
    },
    {
      immediate: true,
    },
  );
</script>

<style></style>
