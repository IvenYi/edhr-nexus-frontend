<template>
  <div class="label-designer">
    <a-spin :spinning="spinning" size="large" wrapperClassName="w100% h100%">
      <designer-header class="label-designer-header" @toggleLoading="toggleLoading" />
      <div class="label-designer-content">
        <designer-toolkit class="label-designer-toolkit" />
        <designer-stage class="label-designer-stage" />
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import DesignerHeader from './header/header.vue';
  import DesignerToolkit from './toolkits/toolkit.vue';
  import DesignerStage from './stage/stage.vue';

  const spinning = ref(false);

  const toggleLoading = (flag: boolean) => {
    spinning.value = flag;
  };
</script>

<style lang="less" scoped>
  .label-designer {
    width: 100%;
    height: 100%;
    background-color: #f1f1f1;
    color: #333;

    :deep(.ant-spin-container) {
      height: 100%;
    }

    &-header {
      height: 56px;
    }

    &-content {
      display: flex;
      height: calc(100% - 56px);
    }

    &-nav {
      flex: none;
      width: 56px;
      border-right: 2px solid #f1f1f1;
      background-color: #fff;
    }

    &-toolkit {
      flex: none;
      width: 296px;
      border-right: 1px solid #f1f1f1;
      background-color: #f7f8fa;
    }

    &-stage {
      flex: 1;
      width: 10px;
    }
  }
</style>
