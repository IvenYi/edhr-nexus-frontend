<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.edhr.matrriaLoadingConfig')">
      <form-item
        :label="$t('sys.edhr.bomInit')"
        :inline="true"
        :tooltip="$t('sys.edhr.bomInitTips')"
        is-first
      >
        <div class="flex justify-end">
          <a-switch v-model="formState.bomInit" :disabled="paasBpmnReadonly" size="small" />
        </div>
      </form-item>
      <form-item
        :label="$t('sys.edhr.labelParsingRules')"
        :inline="false"
        :is-first="false"
        required
      >
        <RdoTreeSelect
          v-model="formState.labelParsingRules"
          modelKey="em_barcode_parsing_rules"
          :disabled="paasBpmnReadonly"
          :attr="{
            size: 'small',
          }"
        />
      </form-item>
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
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import formItem from '../../components/form-item.vue';
  import ApprovalUserSelectConfig from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import { computed, inject, onMounted, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import RdoTreeSelect from '/@web-render/views/edhr-application/components/rdo-tree-select/rdo-tree-select.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnMaterialLoading;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);
  const { t } = useI18n();

  const formState: any = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  onMounted(async () => {});
</script>
<style lang="less" scoped></style>
