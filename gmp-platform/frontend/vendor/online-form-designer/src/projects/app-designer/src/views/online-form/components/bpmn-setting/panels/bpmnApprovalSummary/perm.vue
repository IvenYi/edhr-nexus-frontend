<template>
  <div>
    <a-form :model="formState" layout="vertical">
      <SimpleCollapse :title="t('sys.appDesigner.approval.buttonPerm')">
        <OpConfig
          :edit-ops="opBtns"
          v-model:value="formState!.buttonConfig"
          :show-opinion-config="true"
          :disabled-flow-actions="disabledFlowActions"
          :isShowCustomBtn="false"
          :no-control-config="true"
        />
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { OpConfig } from '/@online-form/approval';
  import { NodeTypeOperateButtonMap } from '../../constant';
  import { ButtonFlowAction, ButtonTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
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

  const opBtns = computed(() => {
    return NodeTypeOperateButtonMap[props.node?.type]?.filter(e => e.operate !== ButtonTypeEnum.Save);
  })

  onMounted(() => {
    if (props.node.data?.buttonConfig) {
      // eslint-disable-next-line vue/no-mutating-props
      props.node.data.buttonConfig = props.node.data?.buttonConfig?.filter(e => e.type !== ButtonTypeEnum.Save)
    }
  })
</script>

<style></style>
