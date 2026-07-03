<template>
  <div :class="[ns.b()]">
    <span :class="[ns.e('text')]" @click="handleAddField">
      <plus-outlined />{{ $t('sys.pageDesigner.addField') }}
    </span>

    <a-modal
      v-model:visible="visible"
      :title="$t('sys.pageDesigner.addField')"
      :okText="$t('sys.okText')"
      :cancelText="$t('sys.cancelText')"
      @ok="handleOk"
    >
      <a-form layout="vertical">
        <a-form-item :label="$t('sys.model.fieldType')">
          <a-select v-model:value="formState.type" :options="fieldTypeOptions" />
        </a-form-item>
        <a-form-item :label="$t('sys.name')">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item :label="$t('sys.key')">
          <a-input v-model:value="formState.key" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="add-field-btn">
  import { computed, reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { CreateType, FIELD_TYPE, useNamespace } from '@gct/runtime';
  import { uuid2 } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useFormModel } from '@gct/nocode-base';
  import { useModelFields } from '../../../hooks/useModelFields';
  import { useReverseModeling } from '../../../hooks/reverse-modeling';
  import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';

  const ns = useNamespace('add-field-btn');
  const { t } = useI18n();
  const formFieldC = useFormModel().injectController();
  const { modelMetaMap } = useModelFields();
  const { addField, getFieldDTO } = useReverseModeling();

  const props = withDefaults(
    defineProps<{
      model?: string;
    }>(),
    {
      model: undefined,
    },
  );

  const fieldTypeOptions = [
    { label: t('sys.model.text'), value: FIELD_TYPE.TEXT },
    { label: t('sys.model.long_text'), value: FIELD_TYPE.LONG_TEXT },
    { label: t('sys.model.integer'), value: FIELD_TYPE.INTEGER },
    { label: t('sys.model.decimal'), value: FIELD_TYPE.DECIMAL },
    { label: t('sys.model.date'), value: FIELD_TYPE.DATE },
    { label: t('sys.model.date_time'), value: FIELD_TYPE.DATE_TIME },
    { label: t('sys.model.boolean'), value: FIELD_TYPE.BOOLEAN },
  ];

  const visible = ref(false);
  const formState = reactive({
    type: FIELD_TYPE.TEXT,
    name: '',
    key: '',
  });

  const currentModel = computed(() => (props.model ? modelMetaMap.value[props.model] : undefined));

  const resetForm = () => {
    formState.type = FIELD_TYPE.TEXT;
    formState.name = '';
    formState.key = '';
  };

  const handleAddField = () => {
    if (!props.model || !currentModel.value) {
      message.warning(t('sys.onlineForm.pleaseSelectModelField'));
      return;
    }
    resetForm();
    visible.value = true;
  };

  const normalizeKey = (key: string) => {
    return key.trim().replace(/\s+/g, '_').replace(/[^\w]/g, '_').toLowerCase();
  };

  const getFallbackKey = () => {
    return `field_${uuid2(8).toLowerCase()}`;
  };

  const handleOk = async () => {
    const modelKey = props.model;
    if (!modelKey || !currentModel.value) {
      visible.value = false;
      return;
    }

    const name = formState.name.trim() || t('sys.pageDesigner.addField');
    const key = normalizeKey(formState.key || getFallbackKey()) || getFallbackKey();

    const fields = currentModel.value.fields;
    if (fields.some((item) => item.name === name)) {
      message.warning(t('sys.onlineForm.reverseModelingTips.fieldHasExisted', { sth: name }));
      return;
    }
    if (fields.some((item) => item.key === key)) {
      message.warning(t('sys.onlineForm.reverseModelingTips.fieldKeyHasExisted', { sth: key }));
      return;
    }

    const field = {
      ...getFieldDTO({
        type: formState.type,
        model: modelKey,
      }),
      id: uuid2(32).toLowerCase(),
      key,
      name,
      modelKey,
      createType: CreateType.USER_DEFINED,
    } as FieldMetaDTO;

    addField(field);
    visible.value = false;
    await formFieldC.refresh();
    message.success(t('sys.createSuccess'));
  };
</script>

<style lang="scss" scoped>
  $add-field-btn: ();

  @include b(add-field-btn) {
    @include set-component-css-var(add-field-btn, $add-field-btn);
    width: 70px;
    position: absolute;
    top: -28px;
    right: 27px;

    @include e(text) {
      cursor: pointer;
      color: var(--ant-primary-color);
      font-size: 12px;
    }
  }
</style>
