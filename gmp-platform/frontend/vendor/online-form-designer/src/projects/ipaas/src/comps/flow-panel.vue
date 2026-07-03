<template>
  <div class="h100% ks-column overflow-hidden">
    <div class="steps">
      <div class="steps-scroller" ref="StepsScroller">
        <span
          class="step-item"
          :class="[
            'step-item__' + item,
            {
              active: item === nodeStep,
              finished: index <= nodeSteps.findIndex((e) => e === nodeData?.data.step),
            },
          ]"
          v-for="(item, index) in nodeSteps"
          :key="item"
        >
          <span v-if="index > nodeSteps.findIndex((e) => e === nodeData?.data.step)">
            {{ index + 1 }}.{{ $t(`sys.ipaas.steps.${item}`) }}
          </span>
          <span v-else @click="toggleStep(item)">
            {{ index + 1 }}.{{ $t(`sys.ipaas.steps.${item}`) }}
          </span>
          <i class="iconfont icon-a-Rightarrow"></i>
        </span>
        <!-- 调试预览 -->
        <span
          v-if="
            debugNodeMap[nodeData?.data?.bizData?.nodeId] &&
            !flowReadonly &&
            ((flowSelectedId && debugNodeMap[flowSelectedId] && !isElseCase) ||
              ![BpmnNodeTypeEnum.BpmnExclusive, BpmnNodeTypeEnum.BpmnParallel].includes(
                nodeData?.data?.type,
              ))
          "
          class="step-item"
          :class="[
            'step-item__' + PanelStep.Debug,
            {
              active: PanelStep.Debug === nodeStep,
              finished: true,
            },
          ]"
          @click="toggleStep(PanelStep.Debug)"
        >
          <span> {{ nodeSteps.length + 1 }}.{{ $t(`sys.ipaas.steps.${PanelStep.Debug}`) }} </span>
        </span>
      </div>
    </div>
    <div class="ks-col overflow-hidden ks-column">
      <component
        :key="nodeData?.id + '_' + fversion"
        :is="nodeStepComp"
        :node="nodeData"
        :node-data="nodeData?.data"
        :node-steps="nodeSteps"
        :node-step="nodeStep"
        @toggle-step="toggleStep"
        class="ks-col"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, computed, watch, ref, nextTick } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { useFlow } from '/@ipaas/hooks/useFlow';
  import {
    BpmnNodeTypeEnum,
    TriggerType,
    PanelStep,
    ConnectorType,
    EndpointType,
  } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

  const stepModules: any = import.meta.glob('./step-modules/*.vue');
  const stepModulesMap = Object.keys(stepModules).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map[name] = defineAsyncComponent(stepModules[path]);
    return map;
  }, {});

  const { gctFlowData, nodeSelectedData: nodeData, flowSelectedId } = useGctFlow();
  const { fversion, debugNodeMap, debugNodeInfo, flowReadonly } = useFlow();

  const StepsScroller = ref();

  // 当前节点当前步骤
  const nodeStep = ref<PanelStep | undefined>();

  const nodeStepComp = computed(() => {
    const step = nodeStep.value;
    if (step) {
      const name = ('step-' + step).toLocaleLowerCase();
      return stepModulesMap[name];
    } else {
      return null;
    }
  });

  const nodeSteps = computed(() => {
    const type = nodeData.value?.data.type as BpmnNodeTypeEnum;
    // const fNode = nodeData.value?.data.fNode as FlowNodeTypeEnum;
    const steps = nodeData.value?.data.steps as PanelStep[];

    if (steps) {
      return steps;
    }

    // 分支
    // if (fNode === FlowNodeTypeEnum.Switch) {
    //   return [PanelStep.Branch, PanelStep.Setting];
    // }

    // if (fNode === FlowNodeTypeEnum.Condition) {
    //   return [PanelStep.Setting];
    // }
    // 连接器;
    if (type === BpmnNodeTypeEnum.BpmnTrigger) {
      const triggerType = nodeData.value!.data.triggerType as TriggerType;
      if (triggerType === TriggerType.Timed) {
        return [PanelStep.Trigger, PanelStep.Timer, PanelStep.Setting];
      }
      return [PanelStep.Trigger, PanelStep.Access, PanelStep.Setting];
    }
    if (type === BpmnNodeTypeEnum.BpmnConnector) {
      if (nodeData.value!.data.connector === ConnectorType.App) {
        return [PanelStep.Connector, PanelStep.Apps, PanelStep.Setting];
      }
      return [PanelStep.Connector, PanelStep.Setting];
    }
    // if (type === BpmnNodeTypeEnum.BpmnApiResponse) {
    // }
    return [PanelStep.Setting];
    // return [];
  });

  const isElseCase = computed(() => {
    return (
      flowSelectedId.value &&
      debugNodeMap.value[flowSelectedId.value]?.input?.data?.bizData?.endpointType ===
        EndpointType.else
    );
  });

  watch(
    () => debugNodeInfo.value.completed,
    (val) => {
      if (val === 2 && debugNodeMap.value[nodeData.value?.data?.bizData?.nodeId]) {
        nodeStep.value = PanelStep.Debug;
      }
    },
  );

  watch(
    [() => nodeData.value?.id, () => flowSelectedId.value],
    ([nodeId, flowId]) => {
      if (
        flowId &&
        nodeId &&
        debugNodeMap.value[nodeId] &&
        debugNodeMap.value[flowId] &&
        !isElseCase.value
      ) {
        nodeStep.value = PanelStep.Debug;
      } else if (nodeId) {
        nodeStep.value =
          debugNodeInfo.value.completed === 2 &&
          !!debugNodeMap.value[nodeData.value?.data?.bizData?.nodeId] &&
          ![BpmnNodeTypeEnum.BpmnExclusive, BpmnNodeTypeEnum.BpmnParallel].includes(
            nodeData.value?.data?.type,
          ) &&
          !flowReadonly.value
            ? PanelStep.Debug
            : nodeData.value?.data.step;
      } else {
        nodeStep.value = undefined;
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    () => debugNodeInfo.value.completed,
    (val) => {
      if (!val && nodeStep.value === PanelStep.Debug) nodeStep.value = nodeData.value?.data.step;
    },
  );

  const toggleStep = async (step: PanelStep) => {
    nodeStep.value = step;
    await nextTick();
    StepsScroller.value
      .querySelector('.step-item__' + step)
      .scrollIntoView({ behavior: 'smooth', inline: 'center' });
  };
</script>

<style lang="less" scoped>
  .steps {
    padding: 12px;
    border-bottom: 1px solid #e0e3ea;
    overflow: hidden;

    .steps-scroller {
      width: max-content;
    }

    .step-item {
      font-size: 12px;
      color: #c3c3c3;

      & > span {
        cursor: pointer;
      }

      & > .iconfont {
        font-size: 12px;
        line-height: 1em;
        margin: 0 5px;
      }

      &:last-child .iconfont {
        display: none;
      }

      &.active > span {
        color: var(--ant-primary-color);
      }

      &.finished {
        color: #797a7d;
      }
      &:not(.finished) {
        span {
          cursor: not-allowed;
        }
      }
    }
  }
</style>
