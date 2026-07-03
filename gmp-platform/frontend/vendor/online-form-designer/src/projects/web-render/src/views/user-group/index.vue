<template>
  <basic-page-render :use-bg-color="false">
    <div class="user-group-wrapper">
      <user-group-tree class="tree-wrap" />
      <user-group-container class="list-wrap" />
    </div>
  </basic-page-render>
</template>
<script setup lang="ts" name="user-group">
  import UserGroupTree from './components/user-group-tree.vue';
  import UserGroupContainer from './components/container/user-group-container.vue';
</script>

<style lang="less" scoped>
  .user-group-wrapper {
    display: flex;
    height: 100%;
    padding-bottom: 0;
    .tree-wrap {
      width: 260px;
      flex: none;
      margin-right: 6px;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .list-wrap {
      flex: 1;
      width: 10px;
      overflow: auto;
      display: flex;
      flex-direction: column;
    }
  }
</style>
