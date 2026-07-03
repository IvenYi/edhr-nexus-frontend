<template>
  <a-tabs v-model:activeKey="activeKey" centered class="lo-panel-container">
    <a-tab-pane :key="PanelTypeEnum.Basic" tab="基础信息">
      <basic-info />
    </a-tab-pane>
    <a-tab-pane :key="PanelTypeEnum.Variable" tab="变量信息">
      <variable-info />
    </a-tab-pane>
    <a-tab-pane :key="PanelTypeEnum.Control" tab="控件信息">
      <control-info />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import BasicInfo from '../panels/basic-info.vue';
  import VariableInfo from '../panels/variable-info.vue';
  import ControlInfo from '../panels/control-info.vue';

  import { PanelTypeEnum } from '../../types';
  import { useLo } from '../../hooks/useLo';

  const { panel, setPanel } = useLo();

  const activeKey = computed({
    get() {
      return unref(panel);
    },
    set(value) {
      setPanel(unref(value));
    },
  });
</script>

<style lang="less" scoped>
  .lo-panel-container {
    height: 100%;
    overflow: hidden;

    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }
</style>
