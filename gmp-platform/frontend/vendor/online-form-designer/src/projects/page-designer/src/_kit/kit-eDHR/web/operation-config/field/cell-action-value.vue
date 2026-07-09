<template>
  <!-- 如果动作是 throw_tip，显示输入框 -->
  <a-input
    v-if="rowData?.action_ === 'throw_tip'"
    class="ell w100%"
    v-model:value="value"
    :placeholder="$t('sys.inputText')"
    :disabled="disabled"
  />

  <!-- 否则显示下拉选择框 -->
  <a-select
    v-else
    class="ell w100%"
    v-model:value="value"
    show-search
    allow-clear
    :options="options"
    :filter-option="filterOption"
    :placeholder="$t('sys.chooseText')"
    :disabled="disabled"
  />
</template>

<script lang="ts" setup name="cell-action-value">
  import { computed, ref, onMounted } from 'vue';

  interface Props {
    /** 当前行数据，用于判断渲染逻辑 */
    rowData: any;
    /** 绑定值 (v-model) */
    modelValue: string;
    /** 事务选项列表 */
    txnOptions: Array<{ label: string; value: any }>;
    /** 过滤函数 */
    filterOption?: (input: string, option: any) => boolean;
    queryApi?: (query?: any) => Promise<Array<{ label: string; value: any; [key: string]: any }>>;
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    txnOptions: () => [],
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
  }>();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  const options = ref(props.txnOptions);

  onMounted(async () => {
    if (props.queryApi && props.rowData?.action_ !== 'throw_tip') {
      const res = await props.queryApi();
      options.value = res;
    }
  });
</script>

<style scoped>
  .ell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :deep(.ant-select-selection-placeholder),
  :deep(.ant-select-selection-item),
  :deep(.ant-form-item-control) {
    text-align: left;
  }
</style>
