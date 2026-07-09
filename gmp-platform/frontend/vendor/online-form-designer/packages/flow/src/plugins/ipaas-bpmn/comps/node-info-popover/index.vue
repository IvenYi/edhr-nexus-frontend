<template>
  <a-popover placement="rightTop">
    <template #content>
      <component :is="nodeComponents[node.type]" :node="node" :config-data="configData" />
      <div
        v-if="node?.data?.bizData?.endpointType !== EndpointType.ldap"
        class="node-popover mt4px"
      >
        <div class="node-popover-item">
          <div class="node-popover-label">节点ID：</div>
          <div class="node-popover-content max-w190px">
            <!-- <div class="ks-col ell">{{ node?.data?.bizData?.nodeId }}</div> -->
            <copy-module-key
              v-if="node?.data?.bizData?.nodeId"
              :moduleKey="node?.data?.bizData?.nodeId"
            />
          </div>
        </div>
      </div>
    </template>
    <slot></slot>
  </a-popover>
</template>
<script setup lang="ts">
  import { defineAsyncComponent } from 'vue';
  import { IGctBpmnNode } from '../../types';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

  defineProps<{
    node: IGctBpmnNode;
    configData: any;
  }>();

  const nodes: any = import.meta.glob('./node-type/*.vue');

  const nodeComponents = Object.keys(nodes).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map[name] = defineAsyncComponent(nodes[path]);
    return map;
  }, {});
</script>
<style lang="less" scoped>
  :deep(.copy-wrap) {
    span {
      font-size: 12px !important;
    }
    i {
      font-size: 14px;
    }
  }
</style>
