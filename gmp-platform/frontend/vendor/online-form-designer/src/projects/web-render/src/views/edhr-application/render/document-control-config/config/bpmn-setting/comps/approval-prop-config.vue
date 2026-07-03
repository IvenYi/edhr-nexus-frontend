<template>
  <SimpleCollapse :class="ns.b()" :title="t('sys.appDesigner.approval.approvalConfig')">
    <form-item
      required
      :label="t('sys.appDesigner.approval.approvalUser')"
      :inline="false"
      is-first
    >
      <approval-user-select-config v-model:modelValue="formState!.targetUserConfig" />
    </form-item>
  </SimpleCollapse>
</template>

<script lang="ts" setup name="approval-prop-config">
  import { useNamespace } from '@gct/runtime';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import approvalUserSelectConfig from './approval-user-select-config.vue';
  import SimpleCollapse from './simple-collapse.vue';
  import FormItem from './form-item.vue';

  const { t } = useI18n();

  const ns = useNamespace('approval-prop-config');

  const props = defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();

  const formState = computed({
    get() {
      return props.node.data!;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });
</script>

<style lang="scss" scoped>
  $approval-prop-config: (
    height: auto,
  );

  @include b(approval-prop-config) {
    @include set-component-css-var(approval-prop-config, $approval-prop-config);
    height: getCssVar(approval-prop-config, height);
  }
</style>
