<template>
  <a-form-item v-if="formItem" :name="name" :rules="rules" class="ell w100% cell-form-item">
    <a-select
      class="ell w100%"
      v-model:value="fieldValue"
      show-search
      allowClear
      :options="options"
      :filterOption="filterOption"
      :disabled="disabled"
      :placeholder="$t('sys.chooseText')"
      @change="(val, option) => handleChange(val, option)"
    />
  </a-form-item>
  <a-select
    v-else
    class="ell w100%"
    v-model:value="fieldValue"
    show-search
    allowClear
    :options="options"
    :filterOption="filterOption"
    :disabled="disabled"
    :placeholder="$t('sys.chooseText')"
    @change="(val, option) => handleChange(val, option)"
  />
</template>

<script lang="ts" setup name="cell-pre-operation">
  import { computed } from 'vue';
  import { isParallelNode } from '../composable/useWorkflowNodes';

  const defProps = defineProps<{
    modelValue: string;
    workflowData: any[];
    currentOperation?: any;
    rowData?: any;
    formItem?: boolean;
    name?: string | string[];
    rules?: any[];
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
    (e: 'change', value: any, option: any): void;
  }>();

  const fieldValue = computed({
    get() {
      return defProps.modelValue;
    },
    set(value) {
      console.log(value, 'value: preOperation');
      emit('update:modelValue', value);
    },
  });

  /** 并行工艺节点: 过滤当前选中配置的节点
   * */
  const options = computed(() => {
    // console.log(defProps.workflowData, 'workflowData:routingNodeConfig', defProps.currentOperation);
    return (defProps.workflowData ?? [])
      .filter((n) => isParallelNode(n))
      ?.filter((n) => n.node_id_ !== defProps.currentOperation?.node_id_)
      .map((item) => {
        const value = item.spec_id_ || item.id_;
        const showValue = value + '$_$' + item.name_;
        return {
          ...item,
          label: item.name_,
          value: showValue,
        };
      });
  });

  const filterOption = (input: string, option: any) => {
    return option.label.includes(input);
  };

  function handleChange(value: any, option: any) {
    Object.assign(defProps.rowData, {
      before_operation_name_: option.label,
    });
    emit('change', value, option);
  }
</script>
<style lang="scss" scoped>
  .ell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
