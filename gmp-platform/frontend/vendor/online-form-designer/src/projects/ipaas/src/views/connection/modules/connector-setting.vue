<template>
  <div :class="[ns.b()]">
    <CategorySider
      class="h-full mr-20px"
      :module="CategoryModuleEnum.CONNECTOR"
      v-model:value="categoryId"
      :siderTitle="t('sys.category')"
      :canCreate="userActions.AddCate"
      :canRename="userActions.RenameCate"
      :canDelete="userActions.DeleteCate"
    />
    <ConnectorSettingTable :categoryId="categoryId" class="h-full pt-20px flex-1 w-1" :userActions="userActions" />
  </div>
</template>

<script lang="ts" setup name="connector-setting">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CategorySider, CategoryModuleEnum } from '/@ipaas/comps/category';
  import { ref } from 'vue';
  import ConnectorSettingTable from './connector-setting-table.vue';

  defineProps<{
    userActions: { [key: string]: boolean };
  }>();

  const { t } = useI18n();
  const ns = useNamespace('connector-setting');
  const categoryId = ref<string | undefined>(undefined);
</script>

<style lang="scss" scoped>
  $connector-setting: ();

  @include b(connector-setting) {
    @include set-component-css-var(connector-setting, $connector-setting);

    @include e(sider) {
      height: 100%;
    }

    @include e(table) {
      height: 100%;
    }

    display: flex;
    height: 100%;
  }
</style>
