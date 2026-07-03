<template>
  <basic-table
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    class="model-designer-basic-table data-template-basic-table"
    :columns="dataTemplColumns"
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
            {
              label: t('sys.design'),
              ifShow: !record.version,
              onClick: handleDesign.bind(null, record.id),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
  <data-template-modal
    @register="registerDataTemplate"
    :modelKey="model.key"
    @refresh="onRefresh"
  />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { dataTemplateColumns } from './constant/columns';
  import DataTemplateModal from './modal/data-template-modal.vue';
  import openWindow from '/@app-designer/tools/openWindow';
  import { DataTemplateInfo } from './type';
  import { deleteExcelTmpl, getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';
  import { ExcelTmplResponse } from '/@/apis/gct-apaas/model';
  import dataTemplateDesignerNew from './components/data-template-designer-new/index.vue';

  const props = defineProps<{
    model;
  }>();

  const { t } = useI18n();
  const [registerDataTemplate, { openModal }] = useModal();
  const tableData = ref<ExcelTmplResponse[]>([]);

  const ch_TempType = {
    IMPORT: t('sys.app.importTemplate'),
    EXPORT: t('sys.app.exportTemplate'),
  };

  const handleNew = async () => {
    // openModal();
    // await gct.openUtil.fullScreen(dataTemplateDesignerNew, { data: null, modelInfo: props.model });
    openTemplateModal();
  };

  const initTableData = async () => {
    tableData.value = (await getExcelTmplList({ modelKey: props.model.key })) || [];
  };

  const dataTemplColumns = dataTemplateColumns.map((i) => {
    if (i.dataIndex == 'type') {
      i['sorter'] = (a, b) => {
        if (a.type == 'IMPORT' && b.type == 'EXPORT') {
          return 1;
        }
        if (a.type == 'EXPORT' && b.type == 'IMPORT') {
          return -1;
        }
        return 0;
      };
      i['showSorterTooltip'] = false;
    }
    return i;
  });

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
  const handleDesign = (id: string) => {
    openWindow('#/data-template-designer/' + props.model.key + '/' + id);
  };

  // 编辑
  const handleRowEdit = async (data: DataTemplateInfo) => {
    if (data.version) {
      openTemplateModal({ ...data, edit: true });
    } else {
      openModal(true, { ...data, edit: true });
    }
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

<style lang="less" scoped>
  .data-template-basic-table.vben-basic-table {
    :deep(.ant-table-column-sorters) {
      justify-content: flex-start;
      .ant-table-column-title {
        flex: none;
      }
    }
  }
</style>
