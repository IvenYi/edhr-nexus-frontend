<template>
  <a-form-item :name="name" :rules="rules" class="ell w100% doc-tmpl-item">
    <rdo-tree-select
      v-model:modelValue="fieldValue"
      :placeholder="$t('sys.chooseText')"
      model-key="em_document"
      :disabled-parent="false"
      :parent-to-default="true"
      :disabled="disabled"
      style="width: 100%"
      @change="(val, opt) => emit('change', val, opt)"
    />
  </a-form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import RdoTreeSelect from '/@web-render/views/edhr-application/components/rdo-tree-select/rdo-tree-select.vue';

  const props = defineProps<{
    modelValue: any;
    name: string[];
    disabled: boolean;
    tableData: any[];
  }>();

  const emit = defineEmits<{
    (e: 'change', value: any, option: any): void;
    (e: 'update:modelValue', value: any): void;
  }>();

  const rules = computed(() => {
    return [
      {
        required: true,
        message: `${$t('sys.chooseText')}SOP${$t('sys.file')}`,
      },
      {
        message: `SOP${$t('sys.edhr.fileCannotRepeat')}`,
        validator: async (_, fieldValue) => {
          const allDocIds = props.tableData?.map((item) => item.document_id_);
          const isDuplicated = allDocIds?.filter((item) => item === fieldValue)?.length > 1;
          if (isDuplicated) {
            return Promise.reject(`SOP${$t('sys.edhr.fileCannotRepeat')}`);
          }
        },
      },
    ];
  });

  const fieldValue = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });
</script>

<style lang="less" scoped>
  :deep(.doc-tmpl-item .ant-select-selection-item) {
    width: 100%;
    max-width: 100%;

    & > div {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
