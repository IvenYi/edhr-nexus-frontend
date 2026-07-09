<template>
  <div class="base-vxe-table-wrapper">
    <div class="base-vxe-table-area">
      <vxe-grid
        class="gct-edhr-vxetable vxetable default"
        :column-config="{
          minWidth: 100,
          useKey: true,
          resizable: true,
        }"
        :show-header-overflow="true"
        :edit-config="{ trigger: 'manual', mode: 'row' }"
        :row-config="{ isHover: true, useKey: true, isCurrent: true }"
        :scroll-y="{ enabled: true, scrollToTopOnChange: true, oSize: 5, gt: 30 }"
        min-height="88"
        :height="height"
        ref="xTable"
        :data="dataSource"
        :loading="loading"
        :loadingConfig="{
          text: $t('sys.loadingText'),
        }"
        :columns="columns"
        :auto-resize="autoResize"
        :seq-config="{ seqMethod }"
        v-on="events"
        v-bind="attributes"
      >
        <template #default="{ column, row }">
          <span>
            {{ renderWithFormatter(column, row) }}
          </span>
        </template>

        <template #material_status_render="{ column: { field }, row: record }">
          <MaterialStatusLabel :value="record[field]" />
        </template>

        <template #work_status_render="{ column: { field }, row: record }">
          <InstanceStatusLabel :instance-status="record[field]" />
        </template>
        <template #control_status_render="{ column: { field }, row: record }">
          <ControlStatusTag v-if="record.controlStatus" :value="record[field]" />
        </template>

        <template #value_i18n_render="{ column: { field, params }, row: record }">
          <span
            v-if="record[field]"
            :title="t(`${params.i18nPrefix}.${record[field]}`)"
            class="flex items-center"
          >
            <img v-if="params.icon" :src="svgUtils[record[field]]" class="w18px h18px mr-4px" />
            {{ t(`${params.i18nPrefix}.${record[field]}`) }}
          </span>
        </template>

        <template #is_link_lot_render="{ column: { field }, row: record }">
          <span v-if="record[field]" :title="record[field]">
            {{ record[field] }}
          </span>
          <a-tag v-else color="error">
            {{ $t('sys.onlineForm.noAssociation') }}
          </a-tag>
        </template>
        <template #is_link_lot_list_render="{ column: { field }, row: record }">
          <span v-if="record[field] && record[field].length" :title="record[field]">
            {{ record[field]?.join(',') }}
          </span>
          <a-tag v-else color="error">
            {{ $t('sys.onlineForm.noAssociation') }}
          </a-tag>
        </template>

        <template #custom_render="{ column, row: record, rowIndex }">
          <slot name="custom_item" v-bind="{ record, column, rowIndex }"></slot>
        </template>

        <template #action="{ row, rowIndex }">
          <slot name="operate" v-bind="{ row, rowIndex }"></slot>
        </template>

        <template #empty>
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </template>
      </vxe-grid>
    </div>
    <div class="text-right mt10px" v-if="showPagination && dataSource.length">
      <a-pagination class="pagination-total-left" v-bind="paginationAttr" @change="onSizeChange" />
    </div>
  </div>
</template>

<script setup lang="ts" name="base-vxe-table">
  import { computed, ref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormTypeEnum } from '@gct/nocode-base';
  import {
    InstanceStatusLabel,
    MaterialStatusLabel,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import ViewOnlineForm from '/@web-render/assets/svg/view-online-form.svg';
  import TextOnlineForm from '/@web-render/assets/svg/text-online-form.svg';
  import ProccessOnlineForm from '/@web-render/assets/svg/proccess-online-form.svg';
  import BaseOnlineForm from '/@web-render/assets/svg/base-online-form.svg';
  import FileOnlineForm from '/@web-render/assets/svg/file-online-form.svg';
  import { ControlStatusTag } from '/@online-form/views/web-render/components';
  import { specialColumns, baseColumnConfig } from './utils';

  import type { TablePaginationConfig } from 'ant-design-vue';

  const { t } = useI18n();

  const svgUtils = {
    [FormTypeEnum.TEXT]: TextOnlineForm,
    [FormTypeEnum.BASE]: BaseOnlineForm,
    [FormTypeEnum.PROCESS]: ProccessOnlineForm,
    [FormTypeEnum.VIEW]: ViewOnlineForm,
    [FormTypeEnum.FILE]: FileOnlineForm,
  };

  const props = withDefaults(
    defineProps<{
      loading: boolean;
      /** 表格高度自适应 */
      autoResize?: boolean;
      /**固定高度 */
      height?: string;
      dataSource: any;
      /**列配置 */
      tableColumns: any;
      showPagination: boolean;
      pagination?: TablePaginationConfig;
      action?: any;
      events?: Record<string, Function>;
      attributes?: Record<string, any>;
    }>(),
    {
      dataSource: [],
      tableColumns: [],
      height: '100%',
      autoResize: true,
      action: {},
    },
  );

  /** 支持列绘制的时候使用formatter */
  function renderWithFormatter(column, row) {
    const { type, field, formatter, params = {} } = column;
    if (type === 'checkbox' || type === 'radio') {
      return;
    }
    const cellValue = row[field];
    if (formatter && typeof formatter === 'function') {
      return formatter({ cellValue, row, column });
    }
    return cellValue || params.defaultValueStr || '--';
  }

  const xTable = ref();
  const emit = defineEmits(['request-table-data', 'checkbox-change', 'radio-change']);

  // 生成最终列配置
  const columns = [
    // specialColumns.seq,
    ...props.tableColumns.map((col) => ({
      ...baseColumnConfig,
      ...col,
      slots: col.slots ? { ...baseColumnConfig.slots, ...col.slots } : baseColumnConfig.slots,
    })),
    { ...specialColumns.action, ...props.action },
  ];

  const paginationAttr = computed(() => {
    if (props.pagination) {
      return {
        current: props.pagination.current,
        pageSize: props.pagination.pageSize,
        total: props.pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30', '40', '50'],
        showTotal: (total) => t('sys.component.table.total', { total }),
      };
    }
    return {};
  });

  function seqMethod({ rowIndex }) {
    if (!props.showPagination) return rowIndex + 1;
    if (!props.pagination) return rowIndex + 1;
    const start = rowIndex + 1;
    return (props.pagination.current - 1) * props.pagination.pageSize + start;
  }

  const onSizeChange = (current, pageSize) => {
    emit('request-table-data', { current, pageSize });
  };

  defineExpose({
    getRef: () => xTable.value,
  });
</script>

<style scoped lang="less">
  .base-vxe-table-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .base-vxe-table-area {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
