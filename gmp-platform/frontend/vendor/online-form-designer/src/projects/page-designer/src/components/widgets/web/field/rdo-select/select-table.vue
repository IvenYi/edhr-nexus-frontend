<template>
  <div class="w600px">
    <vxeRefTable
      ref="vxeTable"
      :tree-config="treeConfig"
      :height="300"
      :loading="loading"
      v-model="tableData"
      :tableColumns="columns"
      :headerSort="false"
      :rowSelectionRadio="selectMode === 'single'"
      :rowSelection="selectMode === 'multiple'"
      @radioEvent="radioEvent"
      @checkboxEvent="checkboxEvent"
      @cellClickEvent="cellClickEvent"
      :row-config="rowConfig"
      :checkboxConfig="checkboxConfig"
      :radioConfig="radioConfig"
      isTree
    >
      <template #field="{ widget, row, rowIndex }">
        <table-cell
          v-if="
            (widget.props.parentField && !row.version_) ||
            (row.version_ && !widget.props.parentField) ||
            widget.type === 'rdo-input'
          "
          class="ell w100% pt13px! pb13px!"
          :widget="widget"
          :rowValue="row"
          :index="rowIndex"
          :rowReadonly="true"
        />
        <span v-else></span>
      </template>
    </vxeRefTable>
    <div class="text-right mt10px" v-if="tableData?.length">
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
  import { ref, onMounted, nextTick, reactive, computed, watch } from 'vue';
  import { transformData, transformSourceData } from '../../../hooks/utils';

  const props = defineProps<{
    tableColumns: any[];
    modelValue?: string;
    getRdoAsyncOptions: Function;
    selectMode?: 'multiple' | 'single' | undefined;
    rowConfig?: any;
    checkboxConfig?: any;
    radioConfig?: any;
    rdoVersion?: boolean;
    isSearch?: boolean;
    searchValue?: string;
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

  const columns = computed(() => {
    return props.tableColumns.map((i, idx) => {
      if (idx) {
        return i;
      }
      return {
        ...i,
        minWidth: 150,
      };
    });
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
  const treeConfig = {
    transform: true,
    rowField: 'id_',
    parentField: 'base_id_',
    expandAll: true,
  }; //表格选中行的样式
  // 表格事件
  const radioEvent = (record) => {
    if (props.rdoVersion && record.children?.length) {
      const row = record.children.filter((i) => i.default_);
      checkedRow(row[0]);
    } else {
      checkedRow(record);
    }

    emit('changeSelect', record);
  };
  const cellClickEvent = (record) => {
    // 行点击事件存在冲突暂时注释
    // checkedRow(record);
    // emit('changeSelect', record);
  };
  /**分页 */
  function showSizeChange(current, pageSize) {
    pagination.pageNo = current;
    pagination.pageSize = pageSize;
    getRdoTableData(props.searchValue);
  }
  function checkedRow(record) {
    const rdoTable = vxeTable.value?.getXtable();
    if (rdoTable) {
      rdoTable.clearCurrentRow();
      rdoTable.setRadioRow(record);
      rdoTable.setCurrentRow(record);
    }
  }
  function checkboxEvent(rows: any[], row) {
    emit('changeSelect', rows, row);
  }
  const getRdoTableData = async (keyword?: string, query?: any) => {
    console.log('keyword11', keyword, props.searchValue);
    loading.value = true;
    const { res } = await props.getRdoAsyncOptions(keyword, {
      ...pagination,
      ...query,
    });
    const rdodata = res?.data
      ?.map((i) => {
        const defaulrRow = i.__CHILDREN__?.find((k) => k.default_);
        const parentId = props.isSearch ? i.id_ + ':' + defaulrRow?.id_ : i.id_;
        const __CHILDREN__ =
          i.__CHILDREN__?.map((node) => {
            const { id_, base_id_ } = node;
            const __VALUE__ = base_id_ ? `${base_id_}:${id_}` : id_;
            return { ...node, __VALUE__, base_id_: parentId };
          }) || [];
        const DEFAULT = __CHILDREN__.find((i) => i.default_);
        return [
          { ...i, id_: parentId, __DEFAULT__: transformData(DEFAULT, res.dict) },
          ...__CHILDREN__,
        ];
      })
      .flat();

    tableData.value = transformSourceData(rdodata, res.dict);
    total.value = res.totalCount;
    pagination.pageNo = res.pageNo;
    pagination.pageSize = res.pageSize;
    await nextTick();
    tableData.value.forEach((i) => {
      if (i.id_ === value.value) {
        checkedRow(i);
      }
      if (i.children?.length) {
        i.children.forEach((n) => {
          if (n.__VALUE__ === value.value) {
            checkedRow(n);
          }
        });
      }
    });
    const rdoTable = vxeTable.value?.getXtable();
    rdoTable.setAllTreeExpand(true);
    initSelected();
    loading.value = false;
  };

  const initSelected = async () => {
    const tableEl = vxeTable.value?.getXtable();
    tableEl?.clearCheckboxRow();
    tableEl?.clearRadioRow();
    await nextTick();
    if (!value.value?.length) return;
    const selected = [];
    tableData.value.forEach((i) => {
      if (props.selectMode === 'single') {
        // 选中子用__VALUE__判断，父用id判断
        if ((!props.isSearch && i?.__VALUE__ === value.value) || i?.id_ === value.value) {
          console.log('i', i, value.value);
          tableEl.setRadioRow(i);
          tableEl.setCurrentRow(i);
        }
      } else {
        if (value.value?.includes(i.id_)) {
          selected.push(i);
        }
      }
    });
    if (props.selectMode !== 'single') {
      tableEl.setCheckboxRow(selected, true);
    }
  };
  watch(
    () => value.value,
    () => {
      initSelected();
    },
  );
  onMounted(() => {
    getRdoTableData();
  });
  defineExpose({
    initSelected,
    search: getRdoTableData,
    getTableData: () => tableData.value,
    getTableEl: () => vxeTable.value?.getXtable(),
  });
</script>
<style scoped lang="less"></style>
