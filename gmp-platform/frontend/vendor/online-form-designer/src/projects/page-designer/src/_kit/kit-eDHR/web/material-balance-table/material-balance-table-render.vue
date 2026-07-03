<template>
  <div
    :style="{
      height: style.height ? `${style.height}px` : '100%',
    }"
  >
    <vxe-grid
      class="default vxetable"
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :height="style.height ? `${style.height}px` : '100%'"
      v-bind="{
        'column-config': {
          resizable: true,
        },
      }"
    >
      <template #empty>
        <a-empty :image="simpleImage" :description="$t('sys.noData')" />
      </template>
    </vxe-grid>
  </div>
</template>

<script setup lang="ts" name="gct-material-balance-table">
  import { ref, toRefs } from 'vue';
  import { type IMaterialBalanceTable } from './schema';
  import { Empty } from 'ant-design-vue';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{ widget: IMaterialBalanceTable }>();

  const columns = ref([]);
  const tableData = ref<any[]>([]);
  const loading = ref(false);
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const { style } = toRefs(props.widget);
  async function getCols(params: { materialNo: string; operationId?: string }) {
    loading.value = true;
    try {
      const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_balance_statistics_config',
          bsKey: 'get_balance_statistics_data',
        },
        {
          production_identification_id_: params.materialNo,
          routing_operation_id_: params.operationId,
        },
      );
      columns.value = (res?.field || []).map((e) => {
        return {
          title: e.field_name_,
          field: e.field_key_,
          showOverflow: true,
          showHeaderOverflow: true,
          formatter: ({ cellValue, row, column }) => {
            const field = column.field;
            return row._DICT?.[field]?.[row[field]] || row[field] || '--';
          },
        };
      });
      tableData.value = transformSourceData(res.data || [], res.dict);
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  }

  defineExpose({
    reload: getCols,
  });
</script>

<style scoped lang="less">
  :deep(.vxe-table) {
    --vxe-table-column-padding-default: 11px 0;
  }
</style>
