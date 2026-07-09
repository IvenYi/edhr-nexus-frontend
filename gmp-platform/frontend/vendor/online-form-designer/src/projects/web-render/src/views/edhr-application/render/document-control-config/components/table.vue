<template>
  <search-form :formData="formState" :initData="initSearchList" @on-query="onSearch" />
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="filterTableData"
    :loading="loading"
    :action="{ width: 100 }"
    :showPagination="false"
    :attributes="{
      treeConfig: {
        rowField: 'id',
        childrenField: 'child',
      },
    }"
  >
    <template #operate="{ row }">
      <table-action-auto
        :actions="[
          {
            label: t('sys.config'),
            onClick: () => onConfig(row),
          },
        ]"
        :stopButtonPropagation="true"
      />
    </template>
  </base-vxe-table>
</template>
<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import { getInterfaceApi } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { documentControlType } from '../enums';
  import { TableActionAuto } from '/@/components/Table';
  import { cloneDeep } from 'lodash-es';
  import SearchForm from '../../../components/search-form/index.vue';
  import BaseVxeTable from '../../../components/base-vxe-table/index.vue';

  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: t('sys.model.classificationName'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
  ];

  const columnDefinitions = [
    { title: t('sys.model.classificationName'), field: 'name', minWidth: 300, treeNode: true },
    { title: t('sys.modifier'), field: 'modifyUserName' },
    { title: t('sys.modifyTime'), field: 'modifyTime', minWidth: 176 },
  ];

  const props = defineProps<{
    type: documentControlType;
  }>();

  const emit = defineEmits(['on-config']);

  const formState = reactive<any>({
    name: undefined,
  });

  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const filterTableData = ref<any[]>([]);

  onMounted(() => getTableData());

  const getTableData = async () => {
    const res = await getInterfaceApi.getCategoryList({ moduleType: props.type });
    tableData.value = res || [];
    searchFunc();
  };

  const onConfig = async (record) => {
    emit('on-config', record);
  };

  function filterData(list, value) {
    return list.reduce((result, e) => {
      const newE = cloneDeep(e);
      if (e.name?.includes(value)) {
        result.push(newE);
      } else if (e.child && e.child?.length) {
        const arr = filterData(e.child, value);
        if (arr?.length) {
          newE.child = arr;
          result.push(newE);
        }
      }
      return result;
    }, []);
  }

  const searchFunc = (val?) => {
    loading.value = true;
    filterTableData.value = !val ? cloneDeep(tableData.value) : filterData(tableData.value, val);
    setTimeout(() => {
      loading.value = false;
    }, 100);
  };

  const onSearch = () => {
    searchFunc(formState.name?.trim());
  };

  defineExpose({
    getTableData,
  });
</script>
