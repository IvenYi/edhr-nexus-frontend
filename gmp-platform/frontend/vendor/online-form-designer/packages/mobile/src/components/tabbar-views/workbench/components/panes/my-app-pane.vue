<template>
  <PaneContainer :title="$t('sys.portal.myApp')" :isLoading="isLoading" :isEmpty="!appList.length">
    <EntryItem v-for="app in appList" :key="app.id" :entry="app" targetType="app" />
  </PaneContainer>
</template>

<script setup lang="ts">
  import PaneContainer from '../pane-container.vue';
  import EntryItem from '@mobile/components/common/entry-item.vue';
  import { getAppPageGetListReleasedApp } from '@mobile/apis/gct-platform/AppController';
  import { onMounted, ref } from 'vue';
  import type { IApp } from '@mobile/type';
  import { getAppList } from './util';

  const isLoading = ref(false);
  const appList = ref<IApp[]>([]);

  const handleQueryList = async () => {
    try {
      isLoading.value = true;
      const res = await getAppPageGetListReleasedApp();
      appList.value = getAppList(res || [], false);
      isLoading.value = false;
    } catch (err) {
      isLoading.value = false;
    }
  };

  onMounted(handleQueryList);
</script>
