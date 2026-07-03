<template>
  <div class="p-16px">
    <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item label="项目分类" name="categoryId">
            <a-select
              ref="select"
              v-model:value="formState.category_id_"
              :options="treeData"
              :fieldNames="{ label: 'name_', value: 'id_' }"
              :filter-option="
                (input: string, option: any) => {
                  return option.name_.indexOf(input.toLowerCase()) >= 0;
                }
              "
              showArrow
              showSearch
              :placeholder="t('sys.chooseText')"
            />
          </a-form-item>
        </a-col>

        <!-- <a-col :span="8">
          <a-form-item :label="t('sys.webRender.edhrApplication.itemValueType')" name="type_">
            <a-select
              v-model:value="formState.type_"
              allowClear
              :placeholder="
                t('sys.pleaseSelectSth', { sth: t('sys.webRender.edhrApplication.itemValueType') })
              "
            >
              <a-select-option v-for="item in DYN_F_TYPE" :key="item" :value="item">
                {{ t('sys.pageDesigner.dynamicFormType.' + item) }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col> -->
      </a-row>
    </a-form>
    <div class="flex">
      <div>
        <div class="section-title">{{ $t('sys.appDesigner.newViewField.candidateArea') }}</div>
        <a-table
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onSelect: onSelect,
            onSelectAll: onSelectAll,
          }"
          row-key="id_"
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          @change="handleTableChange"
          :loading="loading"
          :scroll="{ y: '40vh' }"
          size="middle"
          ref="tableContainerRef"
        />
      </div>
      <div class="ml-16px">
        <div class="section-title">{{ $t('sys.appDesigner.newViewField.selectedArea') }}</div>
        <a-table
          row-key="id_"
          :columns="selectedColumns"
          :data-source="selectedRows"
          :pagination="false"
          :scroll="{ y: '40vh' }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <table-action-auto
                :actions="[
                  {
                    label: t('sys.delete'),
                    color: 'error',
                    // popConfirm: {
                    //   title: t('sys.sureToDelete'),
                    //   confirm: () => handleDelete(record),
                    // },
                    onClick: () => handleDelete(record),
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { ref, reactive, onMounted, inject, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import type { TableColumnsType, TablePaginationConfig, TreeSelectProps } from 'ant-design-vue';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import { DYN_F_TYPE } from '/@web-render/views/edhr-application/enums';
  import { EntityModelCategoryEnum } from '@gct/runtime';

  const { t } = useI18n();

  const props = defineProps<{
    selected?: any[];
  }>();

  const formState: {
    category_id_?: string;
    type_?: string;
  } = reactive({
    category_id_: undefined,
    type_: undefined,
  });

  const selectedRows = ref<any[]>(props.selected ?? []);
  const selectedRowKeys = ref<string[]>(selectedRows.value.map((item) => item.id_));
  const loading = ref<boolean>(false);
  const tableData = ref([]);
  const treeData = ref<TreeSelectProps['treeData']>([]);

  const commonColumns = [
    {
      title: $t('sys.webRender.edhrApplication.projectName'),
      dataIndex: 'name_',
      key: 'name_',
      ellipsis: true,
    },
    {
      key: 'type_',
      dataIndex: 'type_',
      title: t('sys.webRender.edhrApplication.valueFieldType'),
      customRender: ({ text }) => t(`sys.pageDesigner.dynamicFormType.${text}`),
      ellipsis: true,
    },
  ];
  const columns: TableColumnsType = commonColumns;

  const selectedColumns: TableColumnsType = [
    {
      title: t('sys.index'),
      key: 'index',
      width: 60,
      customRender: ({ text, record, index }) => {
        return index + 1;
      },
      align: 'center',
    },
    ...commonColumns,
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      align: 'center',
      width: 80,
    },
  ];

  const getTableData = async () => {
    loading.value = true;

    const res11: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_collection_category_relation',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        query: {
          'ref_field_key_.eq': 'entries_',
          'ref_master_id_.eq': formState.category_id_,
          'ref_model_key_.eq': 'em_data_collection_category',
        },
      },
    );

    if (res11 && res11.data) {
      const ids = res11.data.map((item) => item.data_collection_id_);

      const res222: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'listByIds',
          modelKey: 'em_data_collection_entry',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { ids: ids.join(',') },
      );

      tableData.value = res222?.data ?? [];
    }
    loading.value = false;
  };

  const handleTableChange = (paginationInfo) => {
    getTableData();
  };

  onMounted(async () => {
    const result: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_data_collection_category',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {},
    );
    console.log('data', result.data);

    if (result && result.data) {
      treeData.value = result.data;
      if (result.data[0]?.id_) {
        formState.category_id_ = result.data[0]?.id_;
        getTableData();
      }
    }
  });

  watch(
    () => formState,
    () => {
      getTableData();
    },
    {
      deep: true,
    },
  );

  const onSelect = (record: any, selected: boolean) => {
    const index = selectedRows.value.findIndex((item) => item.id_ === record.id_);
    if (selected) {
      index === -1 && selectedRows.value.push(record);
    } else {
      selectedRows.value.splice(index, 1);
    }
    selectedRowKeys.value = selectedRows.value.map((item) => item.id_);
  };

  const onSelectAll = (selected: boolean, _: any[], changeRows: any[]) => {
    // debugger;
    if (selected) {
      changeRows.forEach((record) => {
        const index = selectedRows.value.findIndex((item) => item.id_ === record.id_);
        index === -1 && selectedRows.value.push(record);
      });
    } else {
      const deleteIds = changeRows.map((item) => item.id_);
      selectedRows.value = selectedRows.value.filter((row) => !deleteIds.includes(row.id_));
    }
    selectedRowKeys.value = selectedRows.value.map((item) => item.id_);
  };

  const handleDelete = (record: { id_: string }) => {
    const keyIndex = selectedRowKeys.value.findIndex((item) => item === record.id_);
    const rowIndex = selectedRows.value.findIndex((item) => item.id_ === record.id_);
    selectedRowKeys.value.splice(keyIndex, 1);
    selectedRows.value.splice(rowIndex, 1);
  };

  const modal = inject<any>('modal');
  modal.ok = async () => {
    try {
      const result = {
        ok: true,
        data: selectedRows.value,
      };
      return result;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style lang="less" scoped>
  .section-title {
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &::before {
      content: '';
      display: block;
      height: 16px;
      width: 4px;
      background: var(--ant-primary-color);
      margin-right: 8px;
    }
  }
</style>
