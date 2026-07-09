<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form :formData="formState" :initData="initSearchList" @on-query="getTableData">
        <template #custom_comp="{ item, formState }">
          <a-tree-select
            v-model:value="formState[item.model]"
            show-search
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            allow-clear
            show-arrow
            :tree-data="categoryOptions"
            :placeholder="item.placeholder || t('sys.inputTextTip', { name: item.label })"
            :fieldNames="{ children: 'child', label: 'name', value: 'id' }"
            tree-node-filter-prop="name"
            dropdownClassName="gct-custom-select-dropdown"
            @dropdownVisibleChange="onDropdownVisibleChange"
          />
        </template>
      </search-form>
      <a-tabs class="flex-1" v-model:activeKey="activeTabKey">
        <a-tab-pane key="1" :tab="$t('sys.menu.todo.todo')">
          <TaskTodo ref="TaskToDoRef" :can-handle="formTaskUsePermsHandle" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$t('sys.menu.todo.done')">
          <TaskDone ref="TaskDoneRef" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useTask } from './useTask';
  import { useI18n } from '/@/hooks/web/useI18n';
  import TaskTodo from './todo.vue';
  import TaskDone from './done.vue';

  import { usePagePermissions } from '../../hooks/usePagePermissions';
  import SearchForm from '../../components/search-form/index.vue';
  import { getInterfaceApi } from '@gct/runtime';
  import { message } from 'ant-design-vue';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  const appInfoStore = useAppInfoStore();

  const isMedPro = () => {
    return appInfoStore.appInfo.suiteKey === 'MEDPRO';
  };

  const TaskToDoRef = ref();
  const TaskDoneRef = ref();
  const { formState, activeTabKey } = useTask();
  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: t('sys.edhr.controlFileName'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },

    {
      type: 'select',
      label: t('sys.edhr.controlFileType'),
      id: 'controlTmplType',
      model: 'controlTmplType',
      options: [
        { label: t('sys.edhr.formTmpl'), value: 'FORM' },
        { label: t('sys.edhr.edhrTmpl'), value: 'EDHR' },
      ],
      onChange: onTypeChange,
    },

    {
      type: 'categoryTreeSelect',
      label: t('sys.edhr.subcategory'),
      id: 'categoryId',
      model: 'categoryId',
    },

    {
      type: 'input',
      label: t('sys.edhr.controlFileCode'),
      id: 'code',
      model: 'code',
      maxLength: 32,
    },
  ];

  const formTaskUsePermsHandle = computed(() => {
    const page = isMedPro() ? 'audit-center' : 'approval-doc-task';
    return usePagePermissions(page)?.value[isMedPro() ? 'TmplHandle' : 'Handle'];
  });

  const categoryOptions = ref<any[]>();
  const getCategory = async (moduleType) => {
    categoryOptions.value = (await getInterfaceApi.getCategoryList({ moduleType })) || [];
  };

  function onTypeChange(val) {
    formState.categoryId = undefined;
    categoryOptions.value = [];
    if (val) {
      getCategory(val === 'FORM' ? 'online_form_module' : 'edhr_module');
    }
  }

  const onDropdownVisibleChange = (visible) => {
    if (visible && !formState.controlTmplType) {
      message.warn(
        `${t('sys.pageDesigner.pleaseSelectFirstSth', { sth: t('sys.edhr.controlFileType') })}`,
      );
    }
  };

  const getTableData = () => {
    if (activeTabKey.value === '1') {
      TaskToDoRef.value.getTableData(1);
    } else if (activeTabKey.value === '2') {
      TaskDoneRef.value.getTableData(1);
    }
  };

  onMounted(() => {
    const controlTmplType =
      formState.controlTmplType === 'FORM' ? 'online_form_module' : 'edhr_module';
    getCategory(controlTmplType);
  });
</script>

<style lang="less" scoped>
  .ant-tabs {
    :deep(.ant-tabs-content-holder) {
      height: calc(100% - 62px);
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }

    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden !important;
      }
    }
  }
</style>
