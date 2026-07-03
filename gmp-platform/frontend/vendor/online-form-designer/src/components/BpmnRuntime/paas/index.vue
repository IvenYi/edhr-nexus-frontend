<template>
  <div class="h100% relative">
    <PaasBpmnDiagram :readonly="true" :inst-mode="true" />
    <div class="absolute top-16px right-136px text-[#242424] text-[12px]" style="line-height: 26px">
      <span v-for="item in statusSamples" :key="item.value" class="ml12px status-item">
        <span
          class="inline-block w6px h6px rounded-50% mr8px"
          :style="{ backgroundColor: item.color }"
        ></span>
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { watch, onBeforeUnmount, computed } from 'vue';
  import {
    useGctFlow,
    NodeInstStatusMap,
    FlowNodeInstStatus,
    FlowNodeInstStatusColor,
  } from '@gct/flow';
  import { PaasBpmnDiagram, useGctPaasBpmn } from '@gct/flow/src/plugins/paas-bpmn';
  import { getPmProcessDefinitionVersionById } from '/@/apis/gct-apaas/PmProcessDefinitionVersionController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getProcessGraphGraphInfo } from '/@/apis/gct-apaas/ProcessGraphController';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';

  const { setNodeInstStatusMap, reset } = useGctFlow();
  const { init } = useGctPaasBpmn();
  const { t } = useI18n();

  const props = defineProps<{
    instanceId: string; // 表单实例 id
  }>();

  const paasNodeStatusMap = {
    FINISHED: FlowNodeInstStatus.COMPLETED,
    APPROVING: FlowNodeInstStatus.RUNNING,
    UNSTART: FlowNodeInstStatus.PENDING,
  };

  const statusSamples = computed(() => {
    return [
      FlowNodeInstStatus.COMPLETED,
      FlowNodeInstStatus.RUNNING,
      FlowNodeInstStatus.PENDING,
    ].map((e) => {
      return {
        value: e,
        color: FlowNodeInstStatusColor[e],
        label: t(`sys.process.flowNodeInstStatus.${e}`),
      };
    });
  });

  onBeforeUnmount(() => {
    reset();
  });

  watch(
    () => props.instanceId,
    async (procInstanceId) => {
      if (!procInstanceId) return;
      const res: any[] =
        (await getProcessGraphGraphInfo({
          procInstanceId,
        })) || [];
      const verId = res[0]?.versionId;
      if (verId) getProcessJson(verId, res);
    },
    {
      immediate: true,
    },
  );

  async function getProcessJson(id, data) {
    const res: any = await getPmProcessDefinitionVersionById({
      id,
    });
    if (res?.json) init(res?.json);
    const nodeStatusMap: NodeInstStatusMap = (data ?? []).reduce(
      (total: NodeInstStatusMap, item) => {
        let ids: string[] = [item.id];
        if (
          (item.type === BpmnNodeTypeEnum.BpmnExclusive ||
            item.type === BpmnNodeTypeEnum.BpmnParallel) &&
          item.operationName
        ) {
          const caseIds = item.operationName.split('#')[1];
          ids.push(...caseIds.split(','));
        }
        ids.forEach((id) => {
          total[id!] = {
            status: paasNodeStatusMap[item.status],
            data: {
              ...item,
              modelKey: res.modelKey,
              statusMsg: paasNodeStatusMap[item.status],
            },
          };
        });
        return total;
      },
      {},
    );
    setNodeInstStatusMap(nodeStatusMap);
  }
</script>

<style></style>
