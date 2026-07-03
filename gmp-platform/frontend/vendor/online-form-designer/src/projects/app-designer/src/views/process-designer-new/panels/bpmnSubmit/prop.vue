<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse
      :title="t('sys.process.initiatorPage')"
      :tooltip="t('sys.process.initiatorPageTip')"
    >
      <NodeBindingPage :data="node.data!" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.process.initiatorBtns')">
      <NodeBtns :node="node" />
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import NodeBindingPage from '../../components/node-binding-page.vue';
  import NodeBtns from '../../components/node-btns.vue';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';

  const props = defineProps<{
    node: GctBpmnNode.BpmnSubmit;
  }>();

  const { t } = useI18n();

  const formState = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });
</script>
<style lang="less" scoped></style>
