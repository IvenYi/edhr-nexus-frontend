<template>
  <basic-page-render>
    <!-- <div class="pl-16px pr-16px pb-16px h-full">
      <app-dynamic-tabs
        class="file-task-page"
        v-model:active-key="activeKey"
        :default-config="DefaultTabsConfig"
        ref="AppDynamicTabsRef"
      >
        <template #tabContent="{ tab }">
          <FileTaskContent />
        </template>
      </app-dynamic-tabs>
    </div> -->
    <div class="p-16px h-full">
      <FileTaskContent
        :can-download="fileTaskUsePerms.Download"
        :can-downloads="fileTaskUsePerms.BatchDownload"
        :can-batch-delete="fileTaskUsePerms.BatchDelete"
      />
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { AppDynamicTabs } from '@/components/AppDynamicTabs';
  import FileTaskContent from './content.vue';
  import { usePagePermissions } from '../../hooks/usePagePermissions';

  const activeKey = ref<string>('');
  const DefaultTabsConfig = [
    {
      id: 'task_all',
      name: $t('sys.edhr.all'),
      icon: 'icon-park:notes',
      color: 'var(--ant-primary-color)',
      query: {},
      createType: 'BUILT_IN',
      checked: true,
    },
  ];

  const fileTaskUsePerms = usePagePermissions('file-task');
</script>

<style scoped></style>
<style lang="less" scoped>
  .file-task-page {
    height: 100%;

    :deep(.ant-tabs) {
      height: 100%;
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }
</style>
