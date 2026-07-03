<template>
  <a-dropdown :class="[ns.b()]">
    <a
      class="ant-dropdown-link"
      @click.prevent="onViewOperation(getCurrentOperation(row)?.current, row)"
    >
      <span :class="ns.e('label')" :title="getCurrentOperation(row)?.current?.label">
        {{ getCurrentOperation(row)?.current?.label || '--' }}
      </span>
      <span
        v-if="!!getCurrentOperation(row)?.options?.length"
        style="font-size: 12px"
        class="ml-2 p-x-4px inline-block bg-[#e6f7ff] text-[#1890ff] border-rd-xl"
      >
        {{ getCurrentOperation(row)?.options?.length }}
        <DownOutlined />
      </span>
    </a>
    <template #overlay v-if="!!getCurrentOperation(row)?.options?.length">
      <a-menu>
        <a-menu-item
          v-for="op in getCurrentOperation(row)?.options"
          :key="op.value"
          @click="onViewOperation(op, row)"
        >
          <span :class="ns.e('label')" :title="op.label">{{ op.label }}</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <ViewOperationDialog ref="viewOperationDialog" :widget="widget.props.workFlowNodes" />
</template>

<script lang="ts" setup name="routing-operation">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ref } from 'vue';
  import { IBusinessTable } from '../../schema';
  import ViewOperationDialog from './view-operation-dialog.vue';

  const { t } = useI18n();
  const ns = useNamespace('routing-operation');

  const props = withDefaults(
    defineProps<{
      widget: IBusinessTable;
      column: any;
      row: any;
      rowIndex: number;
    }>(),
    {},
  );

  const viewOperationDialog = ref();

  function getCurrentOperation(rowData) {
    const fieldKey = props.column.props.field;
    const fieldVal = rowData[fieldKey];
    // 获取当前操作
    const operationList = fieldVal?.split(',') ?? [];
    const opLabelList = rowData._DICT[fieldKey]?.[fieldVal] ?? [];

    const currentOperation = {
      label: opLabelList[0],
      value: operationList[0],
    };
    let nextOptions: any[] = [];
    if (operationList?.length > 1) {
      nextOptions = operationList.slice(1)?.map((op, index) => {
        return {
          label: opLabelList[index + 1],
          value: op,
        };
      });
    }

    return {
      current: currentOperation,
      options: nextOptions,
    };
  }

  function onViewOperation(op: any, rowValue) {
    const routingIdKey = props.widget?.props?.routingField || 'routing_id_';
    const routingId = rowValue?.[routingIdKey];
    const _routingId = routingId?.includes(':') ? routingId.split(':')[1] : routingId;
    viewOperationDialog.value.onOpen(op, {
      ...rowValue,
      routing_id__ri_: _routingId,
    });
  }
</script>

<style lang="scss" scoped>
  $routing-operation: ();

  @include b(routing-operation) {
    @include set-component-css-var(routing-operation, $routing-operation);

    @include e(label) {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>
