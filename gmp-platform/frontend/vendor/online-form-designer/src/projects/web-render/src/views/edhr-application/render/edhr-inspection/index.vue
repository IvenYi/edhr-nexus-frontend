<template>
  <PageLayout :class="[ns.b()]">
    <template #left>
      <CategorySider
        :class="[ns.e('sider')]"
        :module="CategoryModuleEnum.INSPECTION"
        v-model:value="fetchParams.categoryId"
        :siderTitle="t('sys.categoryOfSth')"
        :can-create="visibleFormPerms.InsertCate"
        :can-rename="visibleFormPerms.RenameCate"
        :can-delete="visibleFormPerms.DeleteCate"
        :value-empty="true"
      />
    </template>
    <template #header>
      <PageHeader2
        :title="t('sys.edhr.inspection.report')"
        :params="fetchParams"
        @search="() => load(true)"
        @add="() => createEdhrTmpl()"
        :show-add="visibleFormPerms.Insert"
      />
    </template>
    <template #content>
      <EdhrEmbedGrid
        :data="tableData"
        v-model:pagination="pagination"
        @link="(row) => openEdhrDetail(row!)"
      >
        <template #actions="{ row }">
          <GridBtns :actions="getRowActions(row)" :max-dispaly-count="3" />
        </template>
      </EdhrEmbedGrid>
    </template>
  </PageLayout>
</template>

<script lang="ts" setup name="edhr-router">
  import { pick } from 'lodash-es';
  import { computed, onMounted } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import {
    CategoryModuleEnum,
    EdhrVersionAction,
  } from '/@/projects/online-form/src/views/web-render/constant';
  import { CategorySider } from '/@/projects/online-form/src/views/web-render/category';
  import { PageLayout, PageHeader2 } from '/@/projects/online-form/src/views/web-render/components';
  import {
    isEnableApproveControl,
    isShowAction,
    isShowApprovalControlAction,
    useEdhrVersion,
  } from '/@/projects/online-form/src/views/web-render/hooks';
  import EdhrEmbedGrid from '/@/projects/online-form/src/views/web-render/edhr/edhr-embed-grid.vue';
  import { ActionItem } from '/@/components/Table';
  import { BasicAction } from '/@web-render/utils/UserappPermissions';
  import { GridBtns } from '/@/components/ui';
  import { DhrPermissionEnum } from '/@/perms/index';

  const ns = useNamespace('edhr-router');
  const { t } = useI18n() as any;
  const {
    fetchParams,
    tableData,
    versionActions,
    versionParentActions,
    executeAction,
    createEdhrTmpl,
    openEdhrDetail,
    load,
    form2dhrUsePerms,
  } = useEdhrVersion(CategoryModuleEnum.INSPECTION);

  const visibleFormPerms = computed(() => {
    return {
      InsertCate: form2dhrUsePerms.value[DhrPermissionEnum.InsertCate],
      RenameCate: form2dhrUsePerms.value[DhrPermissionEnum.RenameCate],
      DeleteCate: form2dhrUsePerms.value[DhrPermissionEnum.DeleteCate],
      Insert: form2dhrUsePerms.value[BasicAction.Insert],
    };
  });

  const pagination = computed({
    get() {
      return pick(fetchParams, ['current', 'pageSize', 'total']);
    },
    set(v) {
      Object.assign(fetchParams, v);
    },
  });

  onMounted(() => {
    load(true);
  });

  /** 获取对应的操作配置 */
  const getRowActions = (row: any): ActionItem[] => {
    const isParent = !row.version;
    let actions = isParent ? versionParentActions : versionActions;
    // 默认版本不需要设为默认操作
    if (!isParent && row.default) {
      actions = actions.filter((item) => item.action !== EdhrVersionAction.SET_DEFAULT_VERSION);
    }
    const result = actions
      .filter((action) => {
        /**
         * !: 根据应用区分useControl还是useApproveControl
         */
        const getShowAction = isEnableApproveControl() ? isShowApprovalControlAction : isShowAction;
        return getShowAction(action.action, row);
      })
      .map((action) => {
        return {
          label: t(action.label),
          // 删除给红色
          color: action.action === EdhrVersionAction.DELETE_VERSION ? 'error' : undefined,
          onClick: () => {
            executeAction(action.action, row);
          },
        } as ActionItem;
      });
    return result;
  };
</script>

<style lang="scss" scoped>
  $edhr-router: ();

  @include b(edhr-router) {
    @include set-component-css-var(edhr-router, $edhr-router);
  }
</style>
