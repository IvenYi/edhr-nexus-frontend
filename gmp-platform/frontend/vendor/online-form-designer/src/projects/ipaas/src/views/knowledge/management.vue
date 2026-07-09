<template>
  <basic-page>
    <div class="h-full flex flex-col">
      <div class="flex-none flex items-center p-16px">
        <a-alert :message="$t('sys.ipaas.exportApplicationTip')" banner />
        <a-button type="primary" class="ml-[auto]" @click="handleImport">{{ $t('sys.ipaas.importApplication') }}</a-button>
        <a-button type="primary" class="ml-16px" @click="handleExport">{{ $t('sys.ipaas.exportApplication') }}</a-button>
      </div>
      <div class="h-1px flex-1 p-16px important-pt-0px grid grid-cols-4 grid-gap-16px grid-rows-1">
        <ListComp module="type" :title="$t('sys.ipaas.appCategoryList')" :list="categoryList" :active-id="categoryId" />
        <ListComp module="app" :title="$t('sys.ipaas.appList')" :list="appList" :active-id="appId" />
        <ListComp module="brand" :title="$t('sys.ipaas.brandList')" :list="brandList" :active-id="brandId" />
        <ListComp module="version" :title="$t('sys.ipaas.versionList')" :list="versionList" :active-id="versionId" />
      </div>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import ListComp from './components/list-comp.vue';
  import { useKnowledge } from './hooks/useKnowledge';
  import KnowledgeImport from './components/knowledge-import/index.vue';
  import { GctDialog } from '/@/utils/Dialog';

  const {
    loadCats,
    categoryList,
    appList,
    brandList,
    versionList,
    categoryId,
    appId,
    brandId,
    versionId,
  } = useKnowledge();

  loadCats();

  const handleImport = () => {
    GctDialog.open(KnowledgeImport, {
      options: {
        title: 'xx',
      },
      callback: async () => {
        // getTableData(1);
      },
    });
  };
</script>

<style lang="less" scoped></style>
