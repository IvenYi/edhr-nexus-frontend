<template>
  <basic-page :use-bg-color="false">
    <div class="user-wrap">
      <org-tree class="org-tree-wrap" />
      <user-list class="user-list-wrap" />
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import OrgTree from './components/org-tree.vue';
  import UserList from './components/user-list.vue';
</script>

<style lang="less" scoped>
  .user-wrap {
    display: flex;
    height: 100%;
    padding-bottom: 0;
    .org-tree-wrap {
      width: 280px;
      flex: none;
      margin-right: 6px;
      background-color: #fff;
    }
    .user-list-wrap {
      flex: 1;
      width: 10px;
      background-color: #fff;
      padding: 15px;
    }
  }
</style>
