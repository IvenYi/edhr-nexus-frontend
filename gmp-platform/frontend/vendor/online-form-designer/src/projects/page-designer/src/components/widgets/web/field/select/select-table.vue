<template>
  <div class="w600px">
    <vxeRefTable
      ref="vxeTable"
      :height="300"
      :loading="loading"
      v-model="tableData"
      :tableColumns="tableColumns"
      :headerSort="false"
      :rowSelectionRadio="selectMode === 'single'"
      :rowSelection="selectMode === 'multiple'"
      :selectTheEntireRow="true"
      :emptyText="emptyText || $t('sys.noData')"
      @checkboxEvent="checkboxEvent"
      @radioEvent="radioEvent"
    >
      <template #field="{ widget, row, rowIndex }">
        <table-cell
          class="ell w100% pt13px! pb13px!"
          :widget="widget"
          :rowValue="row"
          :index="rowIndex"
          :rowReadonly="true"
        />
      </template>
    </vxeRefTable>
    <div class="text-right mt10px" v-if="tableData?.length && total">
      <a-pagination
        v-bind="paginationAttr"
        @change="showSizeChange"
        class="pagination-total-left"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    vxeRefTable,
    tableCell,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { ref, onMounted, nextTick, reactive, computed } from 'vue';
  import {
    transformData,
    transformSourceData,
  } from '/@page-designer/components/widgets/hooks/utils';
  import { getQueryDateByKeyWord } from '/@page-designer/components/widgets/hooks/listhook';

  const props = defineProps<{
    tableColumns: any[];
    modelValue?: string;
    getAsyncOptions: Function;
    selectMode: 'multiple' | 'single' | undefined;
    emptyText?: string;
    searchValue?: string;
    keywordFieldKeys?: string[];
  }>();
  const emit = defineEmits(['changeSelect']);
  const value = computed<any>(() => props.modelValue || undefined);
  const vxeTable = ref(null);
  const loading = ref(false);
  const total = ref(0);
  const pagination = reactive({
    pageSize: 20,
    pageNo: 1,
  });
  const pageSizeOptions = [10, 20, 30];
  const paginationAttr = computed(() => {
    return {
      current: pagination.pageNo,
      pageSize: pagination.pageSize,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: pageSizeOptions.map((i) => i + ''),
      showTotal: (total) => $t('sys.component.table.total', { total }),
    };
  });
  const tableData = ref([]);
  // 表格事件
  const radioEvent = (record) => {
    checkedRow(record);
    emit('changeSelect', record);
  };

  const checkboxRow = ref<any[]>([]);

  function checkboxEvent(rows: any[]) {
    console.log('rows', rows, value.value);
    // 未选中的数据
    const notRows = tableData.value.filter((row) => {
      const i = rows.findIndex((item) => item.id_ === row.id_);
      return i === -1;
    });
    // 从已选中中，把当前页未选中的数据排除掉
    checkboxRow.value = checkboxRow.value.filter((row) => {
      const i = notRows.findIndex((item) => item.id_ === row.id_);
      return i === -1;
    });
    // 根据已选中value值排除下删除的值
    checkboxRow.value = checkboxRow.value.filter((row) => {
      const i = value.value.findIndex((item) => item === row.id_);
      return i !== -1;
    });
    // 设置入新选中的数据
    rows.forEach((row) => {
      const i = checkboxRow.value.findIndex((item) => item.id_ === row.id_);
      if (i === -1) {
        checkboxRow.value.push(row);
      }
    });
    emit('changeSelect', checkboxRow.value);
  }
  /**分页 */
  function showSizeChange(current, pageSize) {
    pagination.pageNo = current;
    pagination.pageSize = pageSize;
    const queryData =
      props.searchValue &&
      getQueryDateByKeyWord({
        searchField: props.keywordFieldKeys,
        keyword: props.searchValue,
      });

    getTableData(queryData ? { queryData } : {});
  }
  function checkedRow(record) {
    const tableEl = vxeTable.value?.getXtable();
    if (tableEl) {
      tableEl.clearCurrentRow();
      tableEl.setRadioRow(record);
      tableEl.setCurrentRow(record);
    }
  }
  const getTableData = async (query?: any) => {
    loading.value = true;
    const res = await props.getAsyncOptions({ ...pagination, ...query });

    tableData.value = transformSourceData(
      res.valueList?.map((i) => i._item),
      res.dict,
    );
    total.value = res.totalCount;
    await nextTick();
    initSelected();
    loading.value = false;
  };
  const initSelected = async () => {
    const tableEl = vxeTable.value?.getXtable();
    tableEl?.clearCheckboxRow();
    tableEl?.clearRadioRow();
    await nextTick();
    const selected = [];
    (tableData.value || []).forEach((i) => {
      if (props.selectMode === 'multiple') {
        if (value.value?.includes(i.id_)) {
          selected.push(i);
        }
      } else {
        if (i.id_ === value.value) {
          tableEl.setRadioRow(i);
          tableEl.setCurrentRow(i);
        }
      }
    });
    if (props.selectMode === 'multiple') {
      tableEl.setCheckboxRow(selected, true);
    }
  };
  onMounted(() => {
    getTableData();
  });
  defineExpose({
    tableData,
    search: getTableData,
    initSelected,
  });
</script>
<style scoped lang="less"></style>
