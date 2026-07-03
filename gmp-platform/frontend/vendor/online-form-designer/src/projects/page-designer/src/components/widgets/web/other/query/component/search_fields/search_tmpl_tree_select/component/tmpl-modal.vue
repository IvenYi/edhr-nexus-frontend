<template>
  <div class="py-24px px-40px">
    <a-form :model="formData">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item :label="t('sys.category')">
            <a-select
              v-model:value="formData.categoryId"
              style="width: 100%"
              :placeholder="t('sys.chooseText')"
              :options="categoryOptions"
              :fieldNames="{ label: 'name', value: 'id' }"
              @change="getDataSource()"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.name')">
            <a-input
              v-model:value="formData.name"
              :placeholder="t('sys.inputText')"
              clearable
              @pressEnter="getDataSource()"
              @change="(e) => !e.data && getDataSource()"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <vxe-table
      ref="tableRef"
      :data="tableData"
      height="auto"
      :column-config="{ resizable: true }"
      :tree-config="{}"
      :row-config="{ isHover: true, keyField: 'id' }"
      :checkbox-config="
        multiple ? { highlight: true, trigger: 'row', reserve: true, checkStrictly: true } : {}
      "
      :radio-config="multiple ? {} : { highlight: true, trigger: 'row', reserve: true }"
      :class="{
        vxetable: true,
        default: true,
      }"
      @checkbox-change="checkboxChangeEvent"
      @radio-change="radioChangeEvent"
    >
      <vxe-column v-if="multiple" type="checkbox" width="40" />
      <vxe-column v-else type="radio" width="40" :resizable="false" />
      <vxe-column field="name" :title="t('sys.name')" show-overflow tree-node>
        <template #default="{ row }">
          {{ row.version || row.name }}
          <span v-if="row.default" class="gct-custom-tag ml4px">{{ t('sys.default') }}</span>
        </template>
      </vxe-column>
      <vxe-column field="description" :title="t('sys.description')" show-overflow />
      <vxe-column
        field="modifyUserName"
        :title="t('sys.appDesigner.modifier')"
        width="100"
        show-overflow
      />
      <vxe-column field="modifyTime" :title="t('sys.appDesigner.modificationTime')" width="170" />
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
  import { nextTick, onMounted, ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, IModal, getInterfaceApi } from '@gct/runtime';
  import { VxeTableInstance } from 'vxe-table';
  import { getFormRelateListAllCategory } from '@/apis/gct-apaas/FormRelateController';
  import { getPrintDesignerRdoPageList } from '/@/apis/gct-apaas/PrintDesignerController';

  const props = defineProps<{
    selected: IParams;
    modal: IModal;
    moduleType: IParams;
    multiple: Boolean;
  }>();

  const { t } = useI18n();
  const formData = ref({ categoryId: '', name: '' });
  const selectedVal = ref<RowVO[]>([]);
  const categoryOptions = ref([]);
  const tableRef = ref<VxeTableInstance>();
  const pageForm = ref({
    pageNo: 1,
    pageSize: 10,
  });
  const total = ref(0);
  const paginationAttr = computed(() => {
    return {
      current: pageForm.value.pageNo,
      pageSize: pageForm.value.pageSize,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  interface RowVO {
    id: string;
    name: string;
    desc: string;
    modifier: string;
    modifyTime: string;
    default?: number;
    categoryId?: string;
    children?: RowVO[];
  }

  onMounted(() => {
    nextTick(() => {
      if (props.selected) {
        setSelectRow(props.selected);
        selectedVal.value = props.selected || [];
      }
    });
    getCategoryData();
  });

  const tableData = ref<RowVO[]>([]);

  const checkboxChangeEvent = ({ checked, row }) => {
    if (checked) {
      selectedVal.value?.push(row);
    } else {
      selectedVal.value = selectedVal.value?.filter((e) => e.id !== row.id);
    }
  };

  const radioChangeEvent = (params) => {
    selectedVal.value = [{ ...params.row }];
  };

  const setSelectRow = (rows) => {
    const $table = tableRef.value;
    if ($table) {
      $table.setCheckboxRow(rows, true);
    }
  };

  function showSizeChange(current, pageSize) {
    pageForm.value.pageNo = current;
    pageForm.value.pageSize = pageSize;
    getDataSource();
  }

  const onSave = () => {
    return {
      ok: true,
      params: {
        selected: selectedVal.value,
      },
    };
  };

  useModal(onSave);

  const getCategoryData = () => {
    getFormRelateListAllCategory({ moduleType: props.moduleType }).then((res) => {
      categoryOptions.value = res;
      formData.value.categoryId = res[0]?.id;
      formData.value.categoryId && getDataSource();
    });
  };

  const getDataSource = () => {
    if (!formData.value.categoryId) {
      tableData.value = [];
      total.value = 0;
      return;
    }
    if (props.moduleType === 'label_module') {
      getPrintDesignerRdoPageList({
        ...formData.value,
        ...pageForm.value,
        moduleType: props.moduleType,
      }).then(async (res) => {
        tableData.value =
          res?.data?.map((e) => {
            const item = {
              ...e,
              children: e.children?.map((f) => {
                return {
                  ...f,
                  id: f.baseId + ':' + f.id,
                  categoryId: e.categoryId,
                };
              }),
              id: e.id,
            };
            return item;
          }) || [];
        total.value = res.totalCount;
        await nextTick();
        tableRef.value?.setAllTreeExpand(true);
      });
    } else {
      getInterfaceApi
        .getTmplsList({
          ...formData.value,
          ...pageForm.value,
          moduleType: props.moduleType,
        })
        .then(async (res) => {
          tableData.value =
            res?.data?.map((e) => {
              const item = {
                ...e,
                children: e.children?.map((f) => {
                  return {
                    ...f,
                    id: f.baseId + ':' + f.id,
                    categoryId: e.categoryId,
                  };
                }),
                id: e.id,
              };
              return item;
            }) || [];
          total.value = res.totalCount;
          await nextTick();
          tableRef.value?.setAllTreeExpand(true);
        });
    }
  };
</script>
<style lang="less">
  :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
    color: var(--ant-primary-color);
  }
</style>
