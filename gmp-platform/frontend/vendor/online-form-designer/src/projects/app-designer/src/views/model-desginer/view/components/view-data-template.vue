<template>
  <basic-table
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    class="model-designer-basic-table"
    :columns="dataTemplateColumns"
    :dataSource="tableData"
  >
    <template #headerTop>
      <div style="text-align: right">
        <a-button @click="handleNew" type="primary">{{ t('sys.new') }}</a-button>
      </div>
    </template>
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        <span>{{ index + 1 }}</span>
      </template>
      <template v-if="column.key === 'type'">
        {{ ch_TempType[record.type] }}
      </template>
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDo'),
                confirm: handleRowDelete.bind(null, record.id),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { dataTemplateColumns } from '../constant/columns';
  // import openWindow from '/@app-designer/tools/openWindow';
  import { DataTemplateInfo } from '../../entity/components/data-template/type';
  import { deleteExcelTmpl, getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';
  import { ExcelTmplResponse } from '/@/apis/gct-apaas/model';
  import dataTemplateDesignerNew from '../../entity/components/data-template/components/data-template-designer-new/index.vue';

  const props = defineProps<{
    model;
  }>();

  const { t } = useI18n();
  const tableData = ref<ExcelTmplResponse[]>([]);

  const ch_TempType = {
    IMPORT: t('sys.import'),
    EXPORT: t('sys.export'),
  };

  const handleNew = () => {
    // openModal();
    openTemplateModal();
  };

  const initTableData = async () => {
    tableData.value = (await getExcelTmplList({ modelKey: props.model.key })) || [];
  };

  watch(
    () => props.model.key,
    () => {
      initTableData();
    },
    {
      immediate: true,
    },
  );

  const onRefresh = () => {
    initTableData();
  };

  // 设计
  // const handleDesign = (id: string) => {
  //   openWindow('#/data-template-designer/' + props.model.key + '/' + id);
  // };

  // 编辑
  const handleRowEdit = (data: DataTemplateInfo) => {
    // openModal(true, { ...data, edit: true });
    openTemplateModal({ ...data, edit: true });
  };

  // 删除
  const handleRowDelete = async (id: string) => {
    await deleteExcelTmpl({ ids: id });
    message.success('删除成功');
    onRefresh();
  };

  const openTemplateModal = async (data?) => {
    const res = await gct.openUtil.fullScreen(dataTemplateDesignerNew, {
      data,
      modelInfo: props.model,
    });
    if (res.ok && res.params?.refresh) {
      onRefresh();
    }
  };
</script>

<style lang="less" scoped></style>
