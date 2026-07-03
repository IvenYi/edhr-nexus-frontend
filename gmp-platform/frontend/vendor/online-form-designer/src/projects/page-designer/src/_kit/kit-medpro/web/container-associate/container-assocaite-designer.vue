<template>
  <a-row :gutter="[12, 0]">
    <a-col span="12" class="to-select-box-col">
      <div class="table-wrap">
        <div class="search-box h-60px">
          <a-form-item :label="t('sys.kit.containerName')">
            <a-input style="width: 100%">
              <template #suffix>
                <i class="iconfont icon-sousuo1"></i>
              </template>
            </a-input>
          </a-form-item>
        </div>
        <div class="text-[#212528] text-14px mb-8px">
          {{ t('sys.pageDesigner.ToBeSelect') }}
        </div>
        <a-table
          size="middle"
          :data-source="dataSource"
          :columns="leftColumns"
          :row-selection="{}"
          :loading="loading"
          :pagination="showPagination ? paginationAttr : false"
          bordered
          :scroll="{ x: 180 * leftColumns.length, y: 300 }"
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.key === 'index' && serialNumber">
              {{ index + 1 }}
            </template>
          </template>
        </a-table>
      </div>
    </a-col>
    <a-col span="12" class="be-selected-box-col">
      <div class="table-wrap">
        <div class="text-[#212528] text-14px mb-8px mt-60px">
          {{ t('sys.pageDesigner.beSelected') }}
          <a-button danger class="" style="float: right; bottom: 7px">
            {{ t('sys.kit.delAll') }}
          </a-button>
        </div>
        <a-table
          bordered
          size="middle"
          :data-source="dataSource"
          :columns="[
            ...rightColumns,
            { key: 'action', title: t('sys.operation'), align: 'center', width: 80 },
          ]"
          :pagination="showPagination ? paginationAttr : false"
          :scroll="{ x: 200 * rightColumns.length, y: 300 }"
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.key === 'index' && serialNumber">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'action'">
              <a danger>{{ t('sys.delete') }}</a>
            </template>
          </template>
        </a-table>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="gct-container-associate-designer">
  import { ref, toRefs, computed, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // @ts-ignore
  import vxeRenderTable from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable/index.vue';
  import { IContainerAssociate } from './schema';
  import { QueryDataOptions } from '../../../../components/widgets/web/data/data-table/type';
  const { t } = useI18n();
  const defProps = defineProps<{ widget: IContainerAssociate }>();
  const { serialNumber, pageSize, showPagination } = toRefs(defProps.widget.props);

  const dataSource = [
    {
      name_: '示例批次名称',
      qty_: '示例数量',
      container_modality_id_: '示例形态',
      product_id_: '示例产品',
    },
  ];
  const pageSizeOptions = reactive([10, 20, 30, 40, 50]);
  const total = ref(0);
  const loading = ref(false);

  const pagination = reactive<Required<QueryDataOptions>>({
    pageSize: pageSize.value,
    pageNo: 1,
    query: {},
    exp: '',
    sorts: [],
    foreignFields: [],
  });

  const paginationAttr = computed(() => {
    return {
      current: pagination.pageNo,
      pageSize: pageSize.value,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: pageSizeOptions.map((i) => i + ''),
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  const leftColumns = computed(() => {
    const colWidgets = defProps.widget.children?.[0] || [];
    const columns = colWidgets.map((widget) => {
      return {
        title: widget.alias,
        dataIndex: widget.props.field,
        key: widget.props.field,
      };
    });
    if(serialNumber.value) {
      columns.unshift({ title: '序号', dataIndex: 'index', key: 'index', width: 80 })
    }
    return columns;
  });

  const rightColumns = computed(() => {
    const colWidgets = defProps.widget.children?.[1] || [];
    const columns = colWidgets.map((widget) => {
      return {
        title: widget.alias,
        dataIndex: widget.props.field,
        key: widget.props.field,
      };
    });
    if(serialNumber.value) {
      columns.unshift({ title: '序号', dataIndex: 'index', key: 'index', width: 80 })
    }
    return columns;
  });
</script>

<style lang="scss" scoped>
  .table-wrap {
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);
  }
  :deep(.ant-pagination) {
    position: relative;
    text-align: right;
  }
  :deep(.ant-pagination-total-text) {
    position: absolute;
    left: 0;
  }
</style>
