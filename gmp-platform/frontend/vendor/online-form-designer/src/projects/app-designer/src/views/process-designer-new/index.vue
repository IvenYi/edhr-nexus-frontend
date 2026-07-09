<template>
  <div class="bpmn-designer h100% w100%">
    <BpmnHeader v-if="!onlyFlow" />
    <div class="bpmn-content">
      <div class="bpmn-content-left relative">
        <BpmnVersions v-if="!onlyFlow" class="absolute top-24px left-24px z-10" />
        <PaasBpmnDiagram :on-node-created="onNodeCreated" :on-node-click="onNodeClick" />
        <BpmnGlobal
          v-if="!onlyFlow"
          class="absolute top-16px right-128px z-10"
          @click="onClickGlobal"
        />
      </div>
      <BpmnPanel v-if="!onlyFlow" :data="panelData" v-model:hidden="hidden" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import BpmnHeader from './design/bpmn-header.vue';
  import BpmnPanel from './design/bmpn-panel.vue';
  import BpmnVersions from './design/bpmn-versions.vue';
  import BpmnGlobal from './design/bpmn-global.vue';
  import { PaasBpmnDiagram } from '@gct/flow/src/plugins/paas-bpmn';
  import { computed, onMounted, ref } from 'vue';
  import { useProcess } from './hook/useProcess';

  const props = defineProps<{
    onlyFlow?: boolean;
    id?: string;
  }>();

  const { globalData, onNodeCreated, nodeSelectedData, initProcess } = useProcess();

  const hidden = ref();
  const isGLobal = ref(true);

  onMounted(() => {
    initProcess(props.id, props.onlyFlow);
  });

  const panelData = computed(() => {
    return isGLobal.value ? globalData.value : nodeSelectedData.value;
  });

  function onNodeClick() {
    hidden.value = false;
    isGLobal.value = false;
  }

  function onClickGlobal() {
    hidden.value = false;
    isGLobal.value = true;
  }
</script>

<style lang="less">
  @import './style/index.less';
</style>

<style lang="less" scoped></style>
