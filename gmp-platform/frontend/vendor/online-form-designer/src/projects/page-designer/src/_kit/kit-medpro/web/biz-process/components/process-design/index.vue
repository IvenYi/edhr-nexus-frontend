<template>
  <div class="bpmn-designer h100% w100%">
    <BpmnHeader v-if="!onlyFlow" @on-back="onBack" />
    <div
      class="bpmn-content"
      :style="{
        height: onlyFlow ? '100%' : 'calc(100% - 54px)',
      }"
    >
      <div class="bpmn-content-left relative">
        <BpmnVersions v-if="!onlyFlow" class="absolute top-24px left-24px z-10" />
        <BizBpmnDiagram :actions="actions[type]" :on-node-click="onNodeClick" />
      </div>
      <BpmnPanel v-if="!onlyFlow" :data="panelData" v-model:hidden="hidden" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import BpmnHeader from './design/bpmn-header.vue';
  import BpmnPanel from './design/bmpn-panel.vue';
  import BpmnVersions from './design/bpmn-versions.vue';
  import { BizBpmnDiagram } from '@gct/flow/src/plugins/biz-bpmn';
  import { computed, onMounted, ref, watch } from 'vue';
  import { useProcess } from './hook/useProcess';
  import { BizFlowModule, BpmnNodeTypeEnum } from '@gct/flow/src/plugins/biz-bpmn/enums';
  import { IModal } from '@gct/runtime';
  import { getActionsByTypes } from './constants';

  const props = withDefaults(
    defineProps<{
      onlyFlow?: boolean;
      id: string;
      modal?: IModal;
      type?: BizFlowModule;
      processInfo?: {
        id: string;
        name: string;
      };
    }>(),
    {
      type: 'medpro',
    },
  );

  const { nodeSelectedData, initProcess } = useProcess();

  const hidden = ref(false);

  const actions = {
    [BizFlowModule.Medpro]: [
      {
        key: BpmnNodeTypeEnum.BpmnForm,
        name: '表单节点',
        icon: 'iconfont:icon-biaodanjiedian',
        color: '#3168ec',
        group: '任务节点',
      },
      {
        key: BpmnNodeTypeEnum.BpmnExclusive,
        name: '条件分支',
        icon: 'iconfont:icon-fenzhi',
        color: '#088c49',
        group: '逻辑节点',
      },
      {
        key: BpmnNodeTypeEnum.BpmnParallel,
        name: '并行分支',
        icon: 'iconfont:icon-binghangfenzhi',
        color: '#FF980E',
        group: '逻辑节点',
      },
    ],
    /** 目前用到的edhr类型属于生产模块 */
    [BizFlowModule.Edhr]: getActionsByTypes([
      BpmnNodeTypeEnum.BpmnBizDocument,
      BpmnNodeTypeEnum.BpmnExclusive,
      BpmnNodeTypeEnum.BpmnParallel,
      BpmnNodeTypeEnum.BpmnTransaction,
      BpmnNodeTypeEnum.BpmnAllocat,
      BpmnNodeTypeEnum.BpmnMessage,
      // BpmnNodeTypeEnum.BpmnMaterialLoading,
      // BpmnNodeTypeEnum.BpmnMaterialUnLoading,
      BpmnNodeTypeEnum.BpmnLabelPrint,
    ]),
    /** 生产 */
    // product: getActionsByTypes([
    //   BpmnNodeTypeEnum.BpmnBizDocument,
    //   BpmnNodeTypeEnum.BpmnExclusive,
    //   BpmnNodeTypeEnum.BpmnParallel,
    //   BpmnNodeTypeEnum.BpmnTransaction,
    //   BpmnNodeTypeEnum.BpmnAllocat,
    //   BpmnNodeTypeEnum.BpmnMessage,
    // ]),
    /** 仓储 */
    [BizFlowModule.Stock]: getActionsByTypes([
      BpmnNodeTypeEnum.BpmnBizDocument,
      BpmnNodeTypeEnum.BpmnExclusive,
      BpmnNodeTypeEnum.BpmnParallel,
      BpmnNodeTypeEnum.BpmnTransaction,
      BpmnNodeTypeEnum.BpmnMessage,
      BpmnNodeTypeEnum.BpmnInBound,
      BpmnNodeTypeEnum.BpmnOutBound,
      // BpmnNodeTypeEnum.BpmnLabelPrint,
    ]),
    /** 检验 */
    inspection: getActionsByTypes([
      BpmnNodeTypeEnum.BpmnBizDocument,
      BpmnNodeTypeEnum.BpmnExclusive,
      BpmnNodeTypeEnum.BpmnParallel,
      BpmnNodeTypeEnum.BpmnTransaction,
      BpmnNodeTypeEnum.BpmnMessage,
      BpmnNodeTypeEnum.BpmnInspection,
      // BpmnNodeTypeEnum.BpmnLabelPrint,
    ]),
    /** 放行 */
    [BizFlowModule.Release]: getActionsByTypes([
      BpmnNodeTypeEnum.BpmnBizDocument,
      BpmnNodeTypeEnum.BpmnExclusive,
      BpmnNodeTypeEnum.BpmnParallel,
      BpmnNodeTypeEnum.BpmnTransaction,
      BpmnNodeTypeEnum.BpmnMessage,
      BpmnNodeTypeEnum.BpmnRelease,
      // BpmnNodeTypeEnum.BpmnLabelPrint,
    ]),
  };

  watch(
    () => props.id,
    (id) => {
      id && initProcess(id, props.type, props.onlyFlow);
    },
  );

  onMounted(() => {
    initProcess(props.id, props.type, props.onlyFlow);
  });

  const panelData = computed(() => {
    return nodeSelectedData.value;
  });

  function onNodeClick(node) {
    hidden.value = false;
    console.log('onNodeClick======', node);
  }

  function onBack() {
    props.modal?.dismiss({ ok: true });
  }
</script>

<style lang="less">
  @import './style/index.less';
</style>

<style lang="less" scoped></style>
