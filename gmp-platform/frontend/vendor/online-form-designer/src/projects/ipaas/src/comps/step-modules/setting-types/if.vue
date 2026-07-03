<template>
  <div>
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <SimpleCollapse :title="$t('sys.appDesigner.approval.basicInfo')">
        <a-form-item :label="$t('sys.ipaas.conditionName')" name="nodeName" :rules="[{ required: true }]">
          <a-input
            v-model:value="formState.nodeName"
            size="small"
            :placeholder="$t('sys.inputText')"
            :disabled="readonly"
          />
        </a-form-item>
      </SimpleCollapse>
      <SimpleCollapse :title="$t('sys.appDesigner.approval.caseSetting')">
        <CaseEditor :data="nodeConfig" :readonly="readonly" />
      </SimpleCollapse>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { reactive } from 'vue';
  import type { NodeBizDataSchema } from '/@ipaas/types';
  import SimpleCollapse from '../__comps__/simple-collapse.vue';
  import CaseEditor from '../__comps__/case-editor.vue';

  const props = defineProps<{
    node: any;
    nodeData: NodeBizDataSchema.If;
    readonly: boolean;
  }>();

  const formState = reactive<NodeBizDataSchema.If>(props.nodeData);

  const nodeConfig = reactive<NodeBizDataSchema.If['nodeConfig']>(props.nodeData.nodeConfig);
</script>
<style lang="less" scoped></style>
