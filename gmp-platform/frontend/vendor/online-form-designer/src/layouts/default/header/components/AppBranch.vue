<template>
  <div class="flex items-center">
    <span> {{ appInfo.sourceType === 'IMPORT' ? '当前分支：' : '当前版本：' }}</span>
    <a-select class="w-96px" size="small" :value="branchId" @change="(e) => setBranchSession(e)">
      <a-select-option v-for="item in branches" :value="item.id" :key="item.id">{{
        appInfo.sourceType === 'IMPORT' ? item.seq : item.appVersion
      }}</a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { useBranch } from '/@/hooks/develop/useBranch';

  const { branchId, branches, setBranchSession } = useBranch();

  const { appInfo } = useAppInfoStore();
</script>

<style></style>
