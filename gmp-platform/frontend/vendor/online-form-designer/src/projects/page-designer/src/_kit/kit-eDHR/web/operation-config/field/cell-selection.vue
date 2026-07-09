<template>
  <a-form-item v-if="formItem" :name="name" :rules="rules" class="ell w100% cell-form-item">
    <a-select
      class="ell w100%"
      v-model:value="value"
      show-search
      allow-clear
      :options="options"
      :filter-option="filterOption"
      :disabled="disabled"
      :placeholder="$t('sys.chooseText')"
      @change="(val, option) => emit('change', val, option)"
    />
  </a-form-item>

  <a-select
    v-else
    class="ell w100%"
    v-model:value="value"
    show-search
    allow-clear
    :options="options"
    :filter-option="filterOption"
    :disabled="disabled"
    :placeholder="$t('sys.chooseText')"
    @change="(val, option) => emit('change', val, option)"
  />
</template>

<script lang="ts" setup name="cell-selection">
  import { ref, computed, onMounted } from 'vue';

  interface Props {
    /** 当前行数据，用于判断渲染逻辑 */
    rowData?: any;
    /** 绑定值 (v-model) */
    modelValue: string;
    /** 选项列表 */
    queryApi?: (query?: any) => Promise<Array<{ label: string; value: any; [key: string]: any }>>;
    formItem?: boolean;
    name?: string | string[];
    rules?: any[];
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    queryApi: () => Promise.resolve([]),
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
    (e: 'change', value: any, option: any): void;
    (e: 'loaded', value: string, options: any[]): void;
  }>();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  const options = ref<any[]>([]);

  onMounted(async () => {
    options.value = props.queryApi ? await props.queryApi() : [];
    emit('loaded', value.value, options.value);
  });

  const filterOption = (input: string, option: any) => {
    return option.label.includes(input);
  };
</script>

<style lang="scss" scoped>
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
