<template>
  <div class="bpmn-panel">
    <global-setting
      class="bpmn-panel__setting"
      :class="{
        'bpmn-panel__setting--active': globalSettingVisible,
      }"
    />
    <element-info :key="currentElementId" :element="currentElementId" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import ElementInfo from '../panels/element-info.vue';
  import GlobalSetting from '../panels/global-setting.vue';

  import { useBpmn } from '../../hooks/useBpmn';

  const { globalSettingVisible, currentElementId } = useBpmn();
</script>

<style lang="less" scoped>
  .bpmn-panel {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;

    &__setting {
      position: absolute;
      top: 0;
      left: 0;
      transition: all 0.3s;
      z-index: 100;
      width: 100%;
      transform: translateX(100%);

      &--active {
        transform: translateX(0);
      }
    }
  }
</style>
../../hooks/useBpmnDesigner
