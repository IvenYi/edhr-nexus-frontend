<template>
  <PageLayout :class="[ns.b()]">
    <template #left>
      <CategorySider
        ref="categorySiderRef"
        :class="[ns.e('sider')]"
        :module="CategoryModuleEnum.ONLINE_FORM"
        v-model:value="fetchParams.categoryId"
        :siderTitle="t('sys.categoryOfSth')"
        :can-create="visibleFormPerms.InsertCate"
        :can-rename="visibleFormPerms.RenameCate"
        :can-delete="visibleFormPerms.DeleteCate"
        :value-empty="true"
        :show-import="visibleFormPerms.Import"
        @import="onImport"
      />
    </template>
    <template #header>
      <PageHeader2
        v-if="isInEDHR"
        :title="formTitle"
        :params="fetchParams"
        @search="() => load(true)"
        @add="() => createFormTmpl()"
        :show-add="visibleFormPerms.Insert"
        :show-export="visibleFormPerms.Export"
        @export="onExport"
      />
      <PageHeader
        v-else
        :title="formTitle"
        v-model:query="fetchParams.query"
        @search="() => load(true)"
        @add="() => createFormTmpl()"
        :show-add="visibleFormPerms.Insert"
      />
    </template>
    <template #content>
      <FormEmbedGrid
        v-if="isInEDHR"
        :data="tableData"
        :formTitle="formTitle"
        v-model:pagination="pagination"
        @link="(row) => openFormDetail(row.id!)"
      >
        <template #actions="{ row }">
          <GridBtns :actions="getRowActions(row)" :max-dispaly-count="3" />
        </template>
      </FormEmbedGrid>
      <FormVersionTable
        v-else
        :formTitle="formTitle"
        :data="tableData"
        v-model:pagination="pagination"
        @link="(row) => openFormDetail(row.id!)"
      >
        <template #actions="{ row }">
          <GridBtns :actions="getRowActions(row)" :max-dispaly-count="5" />
        </template>
      </FormVersionTable>
    </template>
  </PageLayout>
</template>

<script lang="ts" setup name="online-form-router">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { CategoryModuleEnum, FormVersionAction } from '../constant';
  import { CategorySider } from '../category';
  import { PageLayout, PageHeader, PageHeader2 } from '../components';
  import {
    isShowAction,
    isShowApprovalControlAction,
    isEnableApproveControl,
    useFormVersion,
  } from '../hooks';
  import { pick } from 'lodash-es';
  import { computed, onMounted, ref } from 'vue';
  import { ActionItem } from '/@/components/Table';
  import { BasicAction } from '/@web-render/utils/UserappPermissions';
  import { GridBtns } from '/@/components/ui';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import FormEmbedGrid from './form-embed-grid.vue';
  import FormVersionTable from './form-version-table.vue';
  import { DhrPermissionEnum } from '/@/perms/index';
  import { FormTypeEnum, OfficeTypeEnum } from '@gct/nocode-base';
  import { openImportModal } from './import';
  import { openExportModal } from './export';

  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(
    () => appInfoStore.appInfo.suiteKey === 'eDHR' || appInfoStore.appInfo.suiteKey === 'MEDPRO',
  );

  const props = withDefaults(
    defineProps<{
      title?: string;
    }>(),
    {},
  );

  const categorySiderRef = ref();
  const formTitle = computed(() => {
    return props.title ?? t('sys.pageDesigner.fieldCmp.online_form');
  });

  const { t } = useI18n() as any;

  const ns = useNamespace('online-form-router');
  const {
    fetchParams,
    tableData,
    versionActions,
    versionParentActions,
    executeAction,
    createFormTmpl,
    openFormDetail,
    load,
    form2dhrUsePerms,
  } = useFormVersion();

  const visibleFormPerms = computed(() => {
    if (!isInEDHR.value) {
      // 如果不是 eDHR，不需要权限限制，全部允许
      return {
        InsertCate: true,
        RenameCate: true,
        DeleteCate: true,
        Insert: form2dhrUsePerms.value[BasicAction.Insert],
        Import: true,
        Export: true,
      };
    }
    return {
      InsertCate: form2dhrUsePerms.value[DhrPermissionEnum.InsertCate],
      RenameCate: form2dhrUsePerms.value[DhrPermissionEnum.RenameCate],
      DeleteCate: form2dhrUsePerms.value[DhrPermissionEnum.DeleteCate],
      Insert: form2dhrUsePerms.value[BasicAction.Insert],
      Import: form2dhrUsePerms.value[DhrPermissionEnum.Import],
      Export: form2dhrUsePerms.value[DhrPermissionEnum.Export],
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
    const isFileForm = row.formType === FormTypeEnum.FILE;
    const baseActions = isParent ? versionParentActions : versionActions;
    const isWord = row.officeType === OfficeTypeEnum.WORD;

    const result = baseActions
      .filter((item) => {
        // 默认版本不需要“设为默认”
        if (!isParent && row.default && item.action === FormVersionAction.SET_DEFAULT_VERSION) {
          return false;
        }

        if (item.action === FormVersionAction.VERSION_DIFF) {
          /** 子版本少于两个的不显示版本对比 */
          if (isParent && row.children.length < 2) {
            return false;
          }
          // 文本表单类型不显示版本对比
          if (isFileForm) {
            return false;
          }

          // word类型的表单不需要显示版本对比
          if (isWord) {
            return false;
          }
        }

        // 文件表单类型不能显示设计按钮
        if (isFileForm && item.action === FormVersionAction.DESIGN_VERSION) {
          return false;
        }

        // 非文件表单类型不能显示模拟填报按钮
        if (!isFileForm && item.action === FormVersionAction.SIMULATION_FILLING) {
          return false;
        }

        /**
         * !: 根据应用区分useControl还是useApproveControl
         */
        const getShowAction = isEnableApproveControl() ? isShowApprovalControlAction : isShowAction;
        return getShowAction(item.action, row);
      })
      .map((item) => ({
        label: t(item.label),
        color: item.action === FormVersionAction.DELETE_VERSION ? 'error' : undefined, // 删除给红色
        onClick: () => executeAction(item.action, row),
      }));

    return result;
  };

  const onImport = async (categoryKey?: string) => {
    const res = await openImportModal(categoryKey);
    if (res.ok) {
      // 非取消的时候关闭模态框,重新加载数据
      load(true);
      // 刷新的分类侧边栏
      categorySiderRef.value?.refresh();
    }
  };
  const onExport = () => {
    openExportModal();
  };
</script>

<style lang="scss" scoped>
  $online-form-router: ();

  @include b(online-form-router) {
    @include set-component-css-var(online-form-router, $online-form-router);
  }
</style>
