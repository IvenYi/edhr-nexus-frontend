<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.pageDesigner.businessConfigProp')">
      <form-item
        :label="$t('sys.edhr.bizComp')"
        :inline="false"
        is-first
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select
          v-model:value="formState.bizCompId"
          :placeholder="t('sys.chooseText')"
          :options="optionsData"
          :disabled="paasBpmnReadonly"
          dropdown-class-name="gct-project-select-dropdown"
          showArrow
          allowClear
          :fieldNames="{ label: 'text', value: 'value' }"
          size="small"
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
          v-model="formState.visibleUsers"
          :placeholder="$t('sys.edhr.canHandleUserPlaceholder')"
          :showTabs="['User', 'Org', 'Role', 'UserGroup']"
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
  import { computed, inject, onMounted, provide, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';

  const props = defineProps<{
    node: GctBpmnNode.BpmnAllocat;
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

  const optionsData = ref([]);

  onMounted(async () => {
    getOptions();
  });

  async function getOptions() {
    const res: any = await getEnumModelFieldPageList({
      enumModelId: 'enu_txn_component',
      enumModelKey: 'enu_txn_component',
    });
    optionsData.value = res?.data || [];
  }
</script>
<style lang="less" scoped></style>
