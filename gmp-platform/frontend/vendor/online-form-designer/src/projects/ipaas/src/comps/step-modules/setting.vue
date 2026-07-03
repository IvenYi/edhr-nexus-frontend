<template>
  <div class="overflow-hidden">
    <component :is="settingsModulesMap[type]" :node="node" />
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, computed } from 'vue';
  import type { GctFlowNode } from '@gct/flow';
  import { FlowNodeTypeEnum } from '@gct/flow';

  const settingModules: any = import.meta.glob('./setting-types/*.vue');

  const props = defineProps<{
    node: GctFlowNode.Basic;
  }>();
  const settingsModulesMap = Object.keys(settingModules).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map[name] = defineAsyncComponent(settingModules[path]);
    return map;
  }, {});

  const type = computed(() => {
    const t =
      props.node?.type === FlowNodeTypeEnum.App ? props.node.data.service ?? '' : props.node.type;
    return t;
    // return t.replace(/([a-zA-Z])/, (match, p1) => p1.toUpperCase());
  });
</script>

<style lang="less" scoped>
  :deep(.ant-form-vertical) {
    .ant-form-item {
      margin: 0;
      & + .ant-form-item {
        margin-top: 8px;
      }
    }
    .ant-form-item-label {
      line-height: 22px;
      padding: 0;
      label {
        font-size: 12px;
        color: #797a7d;
      }
    }
  }

  :deep(.ant-collapse) {
    font-size: 12px;
    .ant-collapse-header {
      padding: 12px 0;
      color: #212528;
      .ant-collapse-arrow {
        margin: 0;
      }
    }
    .collapse-icon-down {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
      font-size: 16px !important;
    }

    .ant-collapse-item-active {
      .collapse-icon-down {
        transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
      }
    }
  }
  :deep(
      .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
    ) {
    padding: 0;
  }
  :deep(.ant-input-sm),
  :deep(.ant-select-sm),
  :deep(.ant-input-number-sm input) {
    font-size: 12px;
  }
</style>
