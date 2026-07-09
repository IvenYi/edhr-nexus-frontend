<template>
  <basic-page-render>
    <div class="h100% ks-column px16px pb16px">
      <app-dynamic-tabs
        v-model:active-key="activeKey"
        :config-id="tabsConfigId"
        :default-config="userId_task_rework"
        model-key="em_container"
        ref="AppDynamicTabsRef"
        class="h100%"
        @tab-click="onTabClick"
      >
        <template #tabContent="{ tab }">
          <TaskContent :query-params="tab.query" />
        </template>
      </app-dynamic-tabs>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import TaskContent from './content.vue';
  import { AppDynamicTabs, QUERY_DEFINITION_DATA } from './components/AppDynamicTabs/index';

  const userInfoStore = useUserStore();
  const activeKey = ref();
  const { userId_task_rework } = QUERY_DEFINITION_DATA;

  const tabsConfigId = computed(() => {
    const userId = userInfoStore.userInfo.userId;
    return `${userId}_task_rework_new1`;
  });

  const onTabClick = (tab) => {
    console.log('click', tab);
  };
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-editable) {
    height: 100%;

    .ant-tabs-content {
      height: 100%;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }
</style>
