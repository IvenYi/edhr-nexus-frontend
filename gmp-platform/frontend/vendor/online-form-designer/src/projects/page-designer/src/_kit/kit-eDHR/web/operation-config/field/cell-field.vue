<template>
  <a-form-item
    :name="[entriesKey, rowIndex, widget.props.field]"
    :rules="rules"
    class="ell w100% cell-form-item"
  >
    <!-- 只读模式 -->
    <CellReadonly
      v-if="readonlyEnabled"
      :fieldKey="widget.props.field"
      :rowValue="rowData"
      :dict="dict"
    />

    <component
      v-else
      :is="renderComponent"
      v-model:modelValue="fieldValue"
      :rowData="formRowData"
      :txnOptions="txnOptions"
      :filterOption="filterOption"
      :workflowData="workflowData"
      :currentOperation="currentOperation"
    />
  </a-form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  // import { useI18n } from '/@/hooks/web/useI18n';

  import CellReadonly from './cell-readonly.vue';
  import CellActionValue from './cell-action-value.vue';
  import CellPreOperation from './cell-pre-operation.vue';

  interface Props {
    widget: any;
    rowData: any;
    rowIndex: any;
    entriesKey: string;
    readonlyEnabled: boolean;
    txnOptions: any[];
    filterOption?: any;
    workflowData?: any;
    currentOperation?: any;
    dict?: any;
    rules?: any[];
  }

  const props = defineProps<Props>();

  // 字段ID与组件的映射关系
  const CellFieldMap: Record<string, any> = {
    em_trigger_txn_entry$value_: CellActionValue,
    em_operation_advance_execution_entry$before_operation_id_: CellPreOperation,
  };

  // 获取对应的渲染组件
  const renderComponent = computed(() => {
    return CellFieldMap[props.widget.props.fieldId];
  });

  const formRowData = computed(() => {
    return props.rowData;
  });

  const fieldValue = computed({
    get() {
      const fieldKey = props.widget.props.field;
      if (fieldKey) {
        return formRowData.value[fieldKey];
      }
      return '';
    },
    set(val: any) {
      const fieldKey = props.widget.props.field;
      formRowData.value[fieldKey] = val;
    },
  });
</script>

<style lang="scss" scoped>
  .ell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
