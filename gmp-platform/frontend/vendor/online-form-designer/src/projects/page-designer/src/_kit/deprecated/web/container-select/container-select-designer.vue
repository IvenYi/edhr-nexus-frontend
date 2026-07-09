<template>
  <a-row :gutter="[12, 0]" class="mt16px">
    <a-col :span="widget.props.txnType === 'em_txn_container_combine' ? 8 : 12">
      <div class="to-selected-box">
        <div class="table-wrap">
          <div class="search-box">
            <a-form-item :label="t('sys.kit.containerName')">
              <a-input style="width: 100%">
                <template #suffix>
                  <!-- <search-outlined /> -->
                  <i class="iconfont icon-sousuo1"></i>
                </template> </a-input
            ></a-form-item>
          </div>
          <div class="text-[#212528] text-14px mb8px">
            {{ t('sys.pageDesigner.ToBeSelect') }}
          </div>
          <a-table
            size="middle"
            :data-source="dataSource"
            :columns="leftCols"
            :row-selection="{}"
            bordered
            :scroll="{ x: 180 * leftCols.length, y: 300 }"
          >
            <template #bodyCell="{ column, index }">
              <template v-if="column.key === 'i'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-col>
    <a-col
      :span="widget.props.txnType === 'em_txn_container_combine' ? 16 : 12"
      class="be-selected-box-col"
    >
      <div>
        <div class="table-wrap">
          <div class="text-[#212528] text-14px mb8px mt55px">
            {{ t('sys.pageDesigner.beSelected') }}
            <a-button danger class="" style="float: right; bottom: 7px">{{
              t('sys.kit.delAll')
            }}</a-button>
          </div>
          <a-table
            bordered
            size="middle"
            :data-source="dataSource"
            :columns="[
              ...rightCols,
              { key: 'action', title: t('sys.operation'), align: 'center', width: 80 },
            ]"
            :pagination="false"
            :scroll="{ x: 200 * rightCols.length, y: 300 }"
          >
            <template #bodyCell="{ column }">
              <template
                v-if="
                  column.key === 'combine_qty_' &&
                  widget.props.txnType === 'em_txn_container_combine'
                "
              >
                <a-input-number :min="0" />
              </template>
              <template
                v-if="
                  column.key === 'close_' && widget.props.txnType === 'em_txn_container_combine'
                "
              >
                <a-switch />
              </template>
              <template v-if="column.key === 'action'">
                <a danger>{{ t('sys.delete') }}</a>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="gct-container-select">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { leftSimpleCols, containerCols, rightSimpleCols, editorRighCols } from './columns';

  const props = defineProps(widgetProps);

  const { t } = useI18n();

  const dataSource = [
    {
      name_: '示例批次名称',
      qty_: '示例数量',
      container_modality_id_: '示例形态',
      product_id_: '示例产品',
    },
  ];
  const leftCols = computed(() => {
    if (
      props.widget.props.txnType === 'em_txn_container_association' ||
      props.widget.props.txnType === 'em_txn_container_disassociation'
    ) {
      return containerCols;
    }
    return leftSimpleCols;
  });
  const rightCols = computed(() => {
    if (
      props.widget.props.txnType === 'em_txn_container_association' ||
      props.widget.props.txnType === 'em_txn_container_disassociation'
    ) {
      return rightSimpleCols;
    }
    return editorRighCols;
  });
</script>

<style lang="less" scoped>
  .tag {
    margin: 0;
    margin-bottom: 12px;
    border-radius: 0;
  }

  .is-selected {
    outline: var(--ant-primary-color) solid 1px;
  }

  :deep(.active) {
    background-color: rgb(13 170 156 / 10%);
  }

  :deep(.ant-pagination) {
    margin: 10px 0 0;
  }

  .table-wrap {
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);
  }

  .title-icon {
    display: inline-block;
    position: relative;
    top: 1px;
    width: 2px;
    height: 12px;
    background-color: var(--ant-primary-color);
  }
</style>
