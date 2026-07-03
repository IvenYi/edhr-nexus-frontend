<template>
  <div class="gct-bi-data-source">
    <empty-page v-if="isEmpty" @reset="handleReset" />
    <list-page v-else @reset="handleReset" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import emptyPage from './components/empty.vue';
  import listPage from './components/list/index.vue';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { getDatabaseList } from '/@/apis/gct-platform/DatabaseController';

  const usePathQuery = usePathQueryStore();

  const isEmpty = ref(true);

  const handleReset = (val) => {
    isEmpty.value = val;
  };

  onMounted(async () => {
    const res = await getDatabaseList({ appId: usePathQuery.getAid() || '' });
    if (res?.length) {
      isEmpty.value = false;
    }
  });
</script>
<style lang="less" scoped>
  .gct-bi-data-source {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
</style>
