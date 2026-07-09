<template>
  <div class="designer">
    <designer-header class="designer-header" />
    <div class="designer-content">
      <designer-toolkit class="designer-toolkit" />
      <designer-stage class="designer-stage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import DesignerHeader from './header/header.vue';
  import DesignerToolkit from './toolkits/toolkit.vue';
  import DesignerStage from './stage/stage.vue';
</script>

<style lang="less" scoped>
  .designer {
    width: 100%;
    height: 100%;
    background-color: #f1f1f1;
    color: #333;

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
      width: 264px;
      border-right: 2px solid #f1f1f1;
      background-color: #fff;
    }

    &-stage {
      flex: 1;
      width: 10px;
    }
  }
</style>
