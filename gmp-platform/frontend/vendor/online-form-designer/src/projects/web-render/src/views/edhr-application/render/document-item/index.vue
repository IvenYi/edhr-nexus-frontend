<template>
  <basic-page-render>
    <div class="document-item-wrapper">
      <CategorySider
        class="tree-wrap"
        :module="CategoryModuleEnum.CHECK_LIST_MODULE"
        folderNoClick
        v-model:value="categoryId"
        :siderTitle="t('sys.categoryOfSth', { sth: t('sys.webRender.edhrApplication.item') })"
        :can-create="userActions.InsertCate"
        :can-rename="userActions.RenameCate"
        :can-delete="userActions.DeleteCate"
      />
      <document-item-container class="list-wrap" :categoryId="categoryId" />
    </div>
  </basic-page-render>
</template>

<script setup lang="ts" name="document-item">
  import { ref, computed } from 'vue';
  import CategorySider from '/@online-form/views/web-render/category/category-sider.vue';
  import { CategoryModuleEnum } from '/@online-form/views/web-render/constant';
  import DocumentItemContainer from './document-item-container.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

  const { t } = useI18n();

  const categoryId = ref();

  const userActions = computed(() => {
    const page = 'document-item';
    return {
      InsertCate: !!getPermissionByKey(page, 'InsertCate'),
      RenameCate: !!getPermissionByKey(page, 'RenameCate'),
      DeleteCate: !!getPermissionByKey(page, 'DeleteCate'),
    };
  });
</script>

<style scoped lang="less">
  .document-item-wrapper {
    display: flex;
    height: 100%;
    padding-bottom: 0;
    .tree-wrap {
      width: 260px;
      flex: none;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-right: 1px solid #e9e9e9;
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
