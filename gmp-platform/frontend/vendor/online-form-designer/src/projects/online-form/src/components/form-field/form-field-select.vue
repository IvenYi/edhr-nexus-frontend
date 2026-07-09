<template>
  <span v-if="readonly" class="form-field-select--readonly">{{ readonlyText }}</span>
  <a-select
    v-else
    class="form-field-select"
    :value="props.modelValue"
    @change="onChange"
    :options="fieldOptions"
    :filter-option="filterOption"
    allow-clear
    show-search
    :placeholder="$t('sys.chooseText')"
    :mode="props.multiple ? 'multiple' : undefined"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup name="form-field-select">
  import { computed } from 'vue';
  import { useFormModel } from '@gct/nocode-base';
  import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { Form } from 'ant-design-vue';

  const formItemContext = Form.useInjectFormItemContext();

  const { injectController } = useFormModel();
  const c = injectController();

  const props = withDefaults(
    defineProps<{
      modelValue?: string | string[];
      /** 是否仅显示子模型字段 */
      onlySubFields?: boolean;
      /** 子模型key */
      subModelKey?: string;
      readonly?: boolean;
      /** 是否多选 */
      multiple?: boolean;
    }>(),
    {
      modelValue: undefined,
      onlySubFields: false,
      subModelKey: undefined,
      readonly: false,
      multiple: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | string[]): void;
  }>();

  const onChange = (value: any) => {
    emit('update:modelValue', value);
    // 触发表单字段变更校验更新
    formItemContext.onFieldChange();
  };

  function field2Option(field: FieldMetaDTO) {
    return {
      label: `${field.name}[${field.key}]`,
      value: `${field.modelKey}.${field.key}`,
    };
  }

  const fieldOptions = computed(() => {
    let fields = c.masterFields;
    if (props.subModelKey) {
      fields = c.getSubModelFields(props.subModelKey);
    }
    fields = fields.filter((field) =>
      props.onlySubFields ? c.isSubField(field) : !c.isSystemField(field) && !c.isSubField(field),
    );

    return fields.map(field2Option);
  });

  const readonlyText = computed(() => {
    if (!props.modelValue) {
      return;
    }
    const fieldKeys = props.multiple ? (props.modelValue as string[]) : [props.modelValue];
    return fieldKeys
      .map((fieldKey) => {
        const [model, field] = fieldKey.split('.');
        return c.findField(model, field)?.name || fieldKey;
      })
      .join(', ');
  });

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
</script>

<style lang="less" scoped>
  .form-field-select {
    width: 100%;
  }
</style>
