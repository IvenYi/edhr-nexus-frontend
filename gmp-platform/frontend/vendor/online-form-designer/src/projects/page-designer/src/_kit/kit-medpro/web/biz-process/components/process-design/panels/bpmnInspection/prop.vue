<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="props.node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="$t('sys.edhr.userConfig')">
      <form-item
        :label="$t('sys.edhr.canHandleUser')"
        :inline="false"
        is-first
        :rules="[
          {
            required: false,
          },
        ]"
      >
        <ApprovalUserSelectConfig
          v-model:modelValue="formState.visibleUsers"
          :placeholder="$t('sys.edhr.canHandleUserPlaceholder')"
          :showTabs="['User', 'Org', 'Role', 'UserGroup']"
          :disabled="paasBpmnReadonly"
        />
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { computed, inject, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import formItem from '../../components/form-item.vue';
  import ApprovalUserSelectConfig from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnInspection;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);

  const { t } = useI18n();
  const formState = computed<any>({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });
</script>
<style lang="less" scoped></style>
