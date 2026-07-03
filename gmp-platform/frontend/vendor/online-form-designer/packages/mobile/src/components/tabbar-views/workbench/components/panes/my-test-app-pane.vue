<template>
  <PaneContainer :title="$t('sys.portal.myTestApp')" :isLoading="isLoading" :isEmpty="!appList.length">
    <EntryItem v-for="app in appList" :key="app.id" :entry="app" targetType="test-app" />
  </PaneContainer>
</template>

<script setup lang="ts">
  import PaneContainer from '../pane-container.vue';
  import EntryItem from '@mobile/components/common/entry-item.vue';
  import { getAppTenantRoleByRolesApps } from '@mobile/apis/gct-platform/AppController';
  import { UserRoleReqEnum } from '@mobile/type';
  import { onMounted, ref } from 'vue';
  import type { IApp } from '@mobile/type';
  import { getAppList } from './util';

  const isLoading = ref(false);
  const appList = ref<IApp[]>([]);

  const handleQueryList = async () => {
    try {
      isLoading.value = true;
      const res = await getAppTenantRoleByRolesApps(
        {
          roles: UserRoleReqEnum.TESTER,
        },
        { pageNo: 1, pageSize: 10 },
      );

      appList.value = getAppList(res?.data || [], true);
      isLoading.value = false;
    } catch (err) {
      isLoading.value = false;
    }
  };

  onMounted(handleQueryList);
</script>
