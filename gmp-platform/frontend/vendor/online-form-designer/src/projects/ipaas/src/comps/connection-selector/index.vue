<template>
  <div class="p24px">
    <a-form :model="form">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item :label="$t('sys.category')">
            <a-tree-select
              v-model:value="form.categoryId"
              show-search
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :placeholder="$t('sys.ipaas.pleaseSelectCategory')"
              :tree-data="treeData"
              :field-names="{ label: 'name', value: 'id' }"
              dropdown-class-name="gct-custom-select-dropdown"
              tree-node-filter-prop="name"
              @change="onTreeChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="$t('sys.name') + ' / ' + 'KEY'">
            <a-input
              v-model:value="form.keyword"
              :placeholder="$t('sys.ipaas.pleaseEnterFlowNameOrKey')"
              clearable
              @keyup.enter="
                pageForm.pageNo = 1;
                getFlowData();
              "
              @change="
                (e) => {
                  !form.keyword && getFlowData();
                }
              "
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <vxe-table
      ref="tableRef"
      show-overflow
      :data="tableData"
      :height="400"
      :column-config="{ resizable: true }"
      :tree-config="{}"
      :row-config="{ isHover: true, keyField: 'id', height: 44 }"
      :radio-config="{
        highlight: true,
        trigger: 'row',
        reserve: true,
        checkRowKeys,
      }"
      :class="{
        default: true,
      }"
      @radio-change="radioChangeEvent"
    >
      <vxe-column type="radio" width="50" show-overflow />
      <vxe-column field="name" :title="$t('sys.integration.flowName')" show-overflow />
      <vxe-column field="key" :title="$t('sys.integration.flowKey')" show-overflow />
      <vxe-column field="mark" :title="$t('sys.developer.appCenter.description')" show-overflow />
      <vxe-column field="modifyUserName" :title="$t('sys.modifier')" show-overflow width="90" />
      <vxe-column field="modifyTime" :title="$t('sys.modifyTime')" show-overflow width="170" />
    </vxe-table>
    <div class="mt12px">
      <a-pagination
        v-bind="paginationAttr"
        @change="showSizeChange"
        class="pagination-total-left"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
  import { listToTree } from '/@/utils/helper/treeHelper';
  import { getFlowCategoryList } from '/@/apis/gct-ipaas2/FlowCategoryController';
  import { getFlowListCategoryOnline } from '/@/apis/gct-ipaas2/FlowMainController';
  import { FlowMainResp, PageBaseFlowMainResp } from '/@/apis/gct-ipaas2/model';
  import { useModal } from '@gct/runtime';
  import { VxeTableInstance } from 'vxe-table';

  const props = defineProps<{
    value?: IData | IData[];
  }>();

  const tableRef = ref<VxeTableInstance>();
  const form = ref<{ categoryId?: string; keyword?: string }>({});
  const treeData = ref([]);
  const tableData = ref<Array<FlowMainResp>>([]);
  const checkRowKeys = ref<string[]>();
  const selectedRows = ref<object[]>([]);
  const total = ref(0);
  const pageForm = ref({
    pageNo: 1,
    pageSize: 10,
  });

  const paginationAttr = computed(() => {
    return {
      current: pageForm.value.pageNo,
      pageSize: pageForm.value.pageSize,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showTotal: (total) => $t('sys.component.table.total', { total }),
    };
  });

  onMounted(() => {
    nextTick(() => {
      if (props.value) {
        setSelectRow(props.value[0]);
      }
    });
    getAllCategory();
  });

  function showSizeChange(current, pageSize) {
    pageForm.value.pageNo = current;
    pageForm.value.pageSize = pageSize;
    getFlowData();
  }

  const radioChangeEvent = ({ row }) => {
    console.log('radio---', row);
    selectedRows.value = [row];
  };

  const getAllCategory = async () => {
    const res = await getFlowCategoryList({ module: 'flow' });
    treeData.value = listToTree(res || [], { pid: 'parentId' });
    if (!form.value.categoryId) {
      form.value.categoryId = treeData.value[0]?.id;
      getFlowData();
    }
  };

  const getFlowData = async () => {
    if (!form.value.categoryId) return;
    const res: PageBaseFlowMainResp = await getFlowListCategoryOnline({
      ...form.value,
      ...pageForm.value,
    });
    tableData.value = res?.data || [];
    total.value = res.totalCount;
  };

  const setSelectRow = (row) => {
    const $table = tableRef.value;
    if ($table) {
      $table.setRadioRow(row);
    }
  };

  const onTreeChange = (id) => {
    if (id) {
      getFlowData();
    }
  };

  const onSave = () => {
    return {
      ok: true,
      selectedkeys: selectedRows.value.map((e) => e.id),
      selectedRows: toRaw(selectedRows.value),
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped>
  :deep(.vxe-table--render-default .vxe-body--row.row--radio) {
    background-color: hsl(from var(--ant-primary-color) h s 94%);
  }
</style>
