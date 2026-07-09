<template>
  <div>
    <a-form :model="formState" layout="vertical">
      <SimpleCollapse :title="t('sys.appDesigner.approval.buttonPerm')">
        <OpConfig
          :edit-ops="NodeTypeOperateButtonMap[node.type]"
          v-model:value="formState!.buttonConfig"
          :show-opinion-config="true"
          :disabled-flow-actions="disabledFlowActions"
        />
      </SimpleCollapse>
      <SimpleCollapse :title="t('sys.appDesigner.approval.fieldPrem')">
        <form-item :inline="false" is-first>
          <field-auth-config v-model:fieldConfig="formState!.fieldConfig" isApproval />
        </form-item>
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import FormItem from '../../comps/form-item.vue';
  import fieldAuthConfig from '../../comps/field-auth-config.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { OpConfig } from '/@online-form/approval';
  import { NodeTypeOperateButtonMap } from '../../constant';
  import { ButtonFlowAction } from '@gct/flow/src/plugins/bpmn/enums';
  import { useGctFlow } from '@gct/flow';

  const { t } = useI18n();
  const { gctFlowDataMap } = useGctFlow();

  const props = defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();

  const disabledFlowActions = computed(() => {
    const { mainFlowNode } = gctFlowDataMap.value[props.node.id];
    return mainFlowNode ? undefined : [ButtonFlowAction.StartNode, ButtonFlowAction.EndNode];
  });

  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });
</script>

<style></style>
