<template>
  <div class="wrapper">
    <a-button type="link" class="important-pl-0px" @click="addParam">
      <template #icon>
        <plus-outlined />
      </template>
      {{ $t('sys.bi.param.add') }}</a-button
    >
    <div class="mt-4px" v-if="params.length > 0">
      <ToolkitContentParam v-for="param in params" :key="param.id" :value="param" />
    </div>
    <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="null" />
  </div>
</template>

<script setup lang="ts">
  import ToolkitContentParam from './toolkit-content-param.vue';
  import { useParam } from '/@online-form/views/designer/hooks/useParam';
  import { Empty } from 'ant-design-vue';

  const { params, addParam } = useParam();
</script>

<style lang="less" scoped>
  .wrapper {
    max-height: 50vh;
    overflow-y: auto;
    padding: 12px;
  }
</style>
