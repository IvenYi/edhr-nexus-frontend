<template>
  <basic-page :use-bg-color="false">
    <div class="org-member-wrapper">
      <user-org-tree
        class="org-tree-wrap"
        :treeApi="{
          init: getOrgList,
          add: postOrg,
          edit: putOrgById,
          drag: postOrgDrag,
          delete: deleteOrg,
          transfer2Delete: postOrgTransferAndDelete,
        }"
        :platformType="PlatformEnum.PLATFORM_MANAGE_ORG_USER"
      />
      <org-member-container class="org-user-list-wrap" />
    </div>
  </basic-page>
</template>
<script setup lang="ts" name="org-member">
  import { UserOrgTree } from '/@/components/UserCmp/index';
  import OrgMemberContainer from './components/org-member-container.vue';
  import { PlatformEnum } from '/@/components/UserCmp/constant/interface';
  import {
    getOrgList,
    postOrg,
    putOrgById,
    deleteOrg,
    postOrgDrag,
    postOrgTransferAndDelete,
  } from '/@/apis/gct-platform/OrgController';
</script>
<style lang="less" scoped>
  .org-member-wrapper {
    display: flex;
    height: 100%;
    padding-bottom: 0;
    .org-tree-wrap {
      width: 280px;
      flex: none;
      margin-right: 6px;
      background-color: #fff;
    }
    .org-user-list-wrap {
      flex: 1;
      width: 10px;
      background-color: #fff;
      padding: 15px;
    }
  }
</style>
