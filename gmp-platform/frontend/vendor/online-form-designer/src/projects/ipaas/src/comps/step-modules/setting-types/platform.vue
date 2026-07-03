<template>
  <div>
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-form-item :label="$t('sys.appDesigner.inputContent')" :rules="[{ required: true }]">
        <a-textarea
          v-model:value="formState.body[0].value"
          :rows="4"
          :disabled="readonly"
          :placeholder="$t('sys.inputText')"
        />
      </a-form-item>
      <div class="text-12px text-#C3C3C3 mt4px"> {{ $t('sys.ipaas.defaultOrgTip') }} </div>
      <a-form-item :label="$t('sys.ipaas.defaultOrg')">
        <a-tree-select
          v-model:value="formState.defaultOrgId"
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :placeholder="$t('sys.chooseText')"
          allow-clear
          :tree-data="orgsOptions"
          tree-node-filter-prop="name"
          :disabled="readonly"
          :fieldNames="{ label: 'name', value: 'id' }"
          dropdownClassName="gct-custom-select-dropdown"
          size="small"
        >
          >
        </a-tree-select>
      </a-form-item>
      <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" :disabled="readonly" />
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { GctFlowNode } from '@gct/flow';
  import type { NodeBizDataSchema, NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { computed, onMounted, ref } from 'vue';
  import DebugButton from '../__comps__/debug-button.vue';
  import { getTenantManagementOrgList } from '/@/apis/gct-platform/TenantManagementOrgController';
  import { listToTree } from '/@/utils/helper/treeHelper';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const orgsOptions = ref<any[]>([]);
  const orgsList = ref<any[]>([]);

  const formState = computed<NodeBizDataSchema.Platform['nodeConfig']>({
    get() {
      return props.nodeData.bizData.nodeConfig as any;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig = value;
    },
  });

  onMounted(() => {
    getOrgData();
  });

  const getOrgData = async () => {
    const res = await getTenantManagementOrgList();
    orgsList.value = res || [];
    orgsOptions.value = listToTree(res || [], { pid: 'parentId' });
  };

  const handleOrgChange = (val) => {
    if (!val) formState.value.defaultOrgName = '';
    else {
      const ids = val.split('/');
      const list = ids.reduce((arr, item) => {
        const obj = orgsList.value.find((org) => org.id === item);
        if (obj) arr.push(obj.name);
        return arr;
      }, []);
      formState.value.defaultOrgName = list.join('/');
    }
  };
</script>
<style lang="less" scoped></style>
