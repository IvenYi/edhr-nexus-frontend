<template>
  <div class="p16px">
    <div class="mb12px">
      <span>{{ $t('sys.pageDesigner.name') }}：</span>
      <span>{{ row.name_ }}</span>
    </div>
    <a-table :columns="columns" :data-source="data" :pagination="false" @expand="expandRow">
      <template #expandedRowRender="{ record }">
        <a-table
          class="use-info-sub-table"
          :columns="innerColumns"
          :data-source="record.modelData.data"
          :pagination="false"
          @change="(paginationInfo) => handleTableChange(paginationInfo, record)"
        />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  import {
    getMedProModelMetaModelDataAssociation,
    postMedProModelMetaDataAssociation,
  } from '/@/apis/gct-apaas/MedProCommonController';
  import { ModelAssociationResponse } from '/@/apis/gct-apaas/model';
  import { TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { id, modelKey, row } = defineProps<{
    id: string;
    modelKey: string;
    row: any;
  }>();
  onMounted(() => {
    open();
  });

  const columns = [
    {
      title: $t('数据列表'),
      dataIndex: 'modelName',
      key: 'modelName',
    },
  ];
  const innerColumns = [
    {
      title: $t('sys.name'),
      dataIndex: 'name_',
      key: 'name_',
      ellipse: true,
    },
    {
      title: $t('sys.description'),
      dataIndex: 'description_',
      key: 'description_',
      ellipse: true,
    },
    {
      title: $t('sys.modifier'),
      dataIndex: 'modify_user_name_',
      key: 'modify_user_name_',
      width: 150,
      ellipse: true,
    },
    {
      title: $t('sys.modifyTime'),
      dataIndex: 'modify_time_',
      key: 'modify_time_',
      width: 200,
      ellipse: true,
    },
  ];
  const data = ref<ModelAssociationResponse[]>();
  //sub table的分页
  const pagination = ref<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    size: 'small',
    showQuickJumper: false,
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });
  //每种类型的分页集合
  const paginationMap = ref<{ string?: TablePaginationConfig }>({});
  const resolveCallback = ref();
  const open = async () => {
    const res = await getMedProModelMetaModelDataAssociation({
      id,
      modelKey,
    });
    data.value = res?.map((d: any, i) => {
      paginationMap.value[d.modelKey as string] = {
        ...pagination.value,
        total: d.dataCount,
      };
      return {
        id,
        key: i,
        modelData: { data: [] },
        ...d,
      };
    });
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  const expandRow = async (expanded, row) => {
    if (!expanded) {
      return;
    }
    const { modelKey, fieldKey, fieldType, id } = row;
    const result = await postMedProModelMetaDataAssociation({
      id,
      modelKey,
      fieldKey,
      fieldType,
      pageNo: 1,
      pageSize: 9999999,
    });
    paginationMap.value[row.modelKey].total = result.totalCount;
    paginationMap.value[row.modelKey].current = 1;
    paginationMap.value[row.modelKey].pageSize = 10;
    row.modelData.data = result.data;
  };
  const handleTableChange = async (paginationInfo, row) => {
    const { modelKey, fieldKey, fieldType, id } = row;
    const { current, pageSize } = paginationInfo;
    const result = await postMedProModelMetaDataAssociation({
      id,
      modelKey,
      fieldKey,
      fieldType,
      pageNo: current,
      pageSize: pageSize,
    });
    paginationMap.value[row.modelKey].total = result.totalCount;
    paginationMap.value[row.modelKey].current = current;
    paginationMap.value[row.modelKey].pageSize = pageSize;
    row.modelData.data = result.data;
  };
</script>

<style scoped lang="less">
  :deep(.use-info-sub-table) {
    .ant-table {
      margin: -16px !important;

      .ant-table-container {
        border: none;

        .ant-table-thead > tr > th {
          background: #fff !important;
        }
      }
    }
  }
</style>
