<template>
  <a-form-item :name="name" :rules="rules" class="ell w100% form-tmpl-item">
    <VersionSelect
      :type="FormDesignEnum.ONLINE_FORM"
      :value="fieldValue"
      @select="onFormVersionSelect"
      :query-params="queryParams"
      :enable-control="true"
      :disabled="disabled"
      :placeholder="$t('sys.chooseText')"
    />
  </a-form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';

  const props = defineProps<{
    modelValue: any;
    formData: any;
    disabled: boolean;
    name: string[];
    tableData: any[];
  }>();

  const emit = defineEmits<{
    (e: 'valueObjChange', payload: any): void;
    (e: 'update:modelValue', value: any): void;
  }>();

  const queryParams = {
    formType: [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].join(','),
  };

  const rules = computed(() => {
    return [
      {
        required: true,
        message: $t('sys.pleaseSelectSth', { sth: $t('sys.edhr.formTmpl') }),
      },
      {
        message: $t('sys.edhr.formTempCannotRepeat'),
        validator: async (_, fieldValue) => {
          const allFormTempIds = props.tableData
            ?.filter((it) => !it.deleted_)
            ?.map((item) => item.form_tmpl_id_);
          const isDuplicated = allFormTempIds?.filter((item) => item === fieldValue)?.length > 1;
          if (isDuplicated) {
            return Promise.reject($t('sys.edhr.formTempCannotRepeat'));
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

  const onFormVersionSelect = (v: any) => {
    const refId = v.baseId ? `${v.baseId}:${v.id}` : v.id;
    fieldValue.value = refId;
    emit('valueObjChange', v);
  };
</script>

<style lang="less" scoped>
  :deep(.ant-form-item) {
    margin-bottom: 0 !important;
  }
  :deep(.form-tmpl-item .select-text) {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
