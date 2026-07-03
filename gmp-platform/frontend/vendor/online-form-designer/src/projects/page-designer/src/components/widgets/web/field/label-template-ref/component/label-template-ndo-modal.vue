<template>
  <div class="py-24px px-40px gct-tmpl-modal">
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
              dropdown-class-name="vxe-table--ignore-clear"
              @change="getDataSource()"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.printDesigner.labelName')">
            <a-input
              v-model:value="formData.name"
              :placeholder="t('sys.inputText')"
              clearable
              @keyup.enter="getDataSource()"
              @change="
                (e) => {
                  !formData.name && getDataSource();
                }
              "
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <vxe-table
      class="select-none"
      ref="tableRef"
      :data="tableData"
      :height="400"
      :column-config="{ resizable: true }"
      :tree-config="{}"
      :row-config="{ isHover: true, keyField: 'id' }"
      :radio-config="{ highlight: true, trigger: 'row', reserve: true }"
      :class="{
        vxetable: true,
        default: true,
      }"
      @radio-change="radioChangeEvent"
    >
      <vxe-column type="radio" width="40" />
      <vxe-column field="name" :title="t('sys.name')" show-overflow>
        <template #default="{ row }">
          <div class="ks-row">
            <span class="gct-text-overflow" :title="row.name">{{ row.name }}</span>
          </div>
        </template>
      </vxe-column>
      <vxe-column field="description" :title="t('sys.description')" show-overflow>
        <template #default="{ row }">
          <div class="ks-row">
            <span class="gct-text-overflow" :title="row.description">{{ row.description }}</span>
          </div>
        </template>
      </vxe-column>
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
  import { nextTick, onMounted, ref, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, IModal } from '@gct/runtime';
  import { VxeTableInstance } from 'vxe-table';
  import { getPrintDesignerRdoPageList } from '/@/apis/gct-apaas/PrintDesignerController';
  import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';

  const props = defineProps<{
    selected?: IParams;
    modal: IModal;
    moduleType: string;
    className?: string;
    modelKey?: string;
    isAlll?: boolean;
  }>();

  const { t } = useI18n();
  const formData = ref({ categoryId: props.selected?.categoryId || '', name: '' });
  const selectedVal = ref<RowVO>();
  const tableRef = ref<VxeTableInstance>();
  const pageForm = ref({
    pageNo: 1,
    pageSize: 10,
  });
  const categoryOptions = ref<any[]>([]);
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
      props.selected && setSelectRow(props.selected);
    });
    getCategoryData();
  });

  const tableData = ref<RowVO[]>([]);

  const radioChangeEvent = (params) => {
    selectedVal.value = { ...params.row };
  };

  const setSelectRow = (row) => {
    const $table = tableRef.value;
    if ($table) {
      $table.setRadioRow(row);
    }
  };

  function showSizeChange(current, pageSize) {
    pageForm.value.pageNo = current;
    pageForm.value.pageSize = pageSize;
    getDataSource();
  }
  const getCategoryData = () => {
    getCategoryList({ module: props.moduleType }).then((res) => {
      categoryOptions.value = res || [];
      if (!formData.value.categoryId && res && res.length) {
        formData.value.categoryId = res[0].id;
      }
    });
  };
  const onSave = () => {
    return {
      ok: true,
      params: {
        selected: selectedVal.value,
      },
    };
  };

  useModal(onSave);

  const getDataSource = () => {
    formData.value.name = formData.value?.name?.trim();
    getPrintDesignerRdoPageList({
      ...formData.value,
      ...pageForm.value,
      moduleType: props.moduleType,
      modelKey: props.modelKey,
    }).then(async (res: any) => {
      tableData.value = res.data.map((e) => {
        delete e.children;
        return {
          ...e,
          categoryId: formData.value.categoryId,
          id: e.baseId + ':' + e.id,
        };
      });
      total.value = res.totalCount;
      await nextTick();
      const checkedVal = tableData.value.find((i) => i.id == props.selected?.id);
      checkedVal && setSelectRow(checkedVal);
    });
  };

  watch(
    () => formData.value.categoryId,
    () => {
      if (formData.value.categoryId) {
        getDataSource();
      } else {
        tableData.value = [];
        total.value = 0;
      }
    },
    {
      immediate: true,
    },
  );
</script>
<style lang="less" scoped>
  .gct-tmpl-modal {
    :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
      color: var(--ant-primary-color);
    }

    :deep(.ant-form) {
      .ant-form-item-label {
        padding: 0;
      }
      .ant-form-item .ant-form-item-label > label {
        &::after {
          display: block;
        }
      }
    }
  }
  .vxetable {
    --vxe-table-row-hover-radio-checked-background-color: #e6eeff;
    --vxe-table-row-radio-checked-background-color: #e6eeff;
    --vxe-table-row-checkbox-checked-background-color: #e6eeff;
    --vxe-table-row-hover-checkbox-checked-background-color: #e6eeff;
  }
  :deep(.vxe-table--render-default .vxe-body--column:not(.col--ellipsis)) {
    padding: 11px 0s;
  }
  :deep(.vxe-table--render-default .vxe-body--column.col--ellipsis) {
    height: 44px;
  }
  :deep(.vxe-table--render-default .vxe-cell) {
    padding-left: 16px;
    padding-right: 16px;
  }
</style>
