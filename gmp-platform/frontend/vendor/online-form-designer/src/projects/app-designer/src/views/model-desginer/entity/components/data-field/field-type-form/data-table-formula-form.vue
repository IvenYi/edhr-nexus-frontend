<template>
  <a-form-item
    :name="['specificConfig', 'formulaConfig', 'expression']"
    :label="t('sys.pageDesigner.formula')"
    :rules="[
      {
        required: true,
        message: t('sys.pageDesigner.formula') + t('sys.pageDesigner.cannotBeEmpty'),
      },
    ]"
  >
    <a-input
      readonly
      @click="addFormula"
      :placeholder="t('sys.inputText')"
      :value="formData.specificConfig?.formulaConfig?.expression"
    />
  </a-form-item>
  <a-form-item
    v-show="formData.specificConfig?.formulaConfig?.expression"
    :label="t('sys.expression.returnValue')"
  >
    {{ t('sys.expression.' + formData.mappingType) }}
  </a-form-item>
  <a-form-item
    v-show="!isFormField"
    :name="['specificConfig', 'formulaConfig', 'showQrCode']"
    :label="t('sys.expression.createQrCode')"
  >
    <a-radio-group
      class="pt5px"
      :value="formData.specificConfig?.formulaConfig?.showQrCode"
      @click="handleClick"
      name="radioGroup"
    >
      <a-radio :value="true">{{ t('sys.true') }}</a-radio>
      <a-radio :value="false">{{ t('sys.false') }}</a-radio>
    </a-radio-group>
    <div>{{ t('sys.expression.createQrCodeTip') }}</div>
  </a-form-item>
</template>
<script setup lang="ts" name="data_table_formula">
  import { PropType, reactive, watch, toRef, computed } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    ReturnTypeEnum,
    EntityFormulaReturnTypeEnum,
  } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { useI18n } from 'vue-i18n';
  import { FormInstance } from 'ant-design-vue';
  import { formulaFilter } from '@gct/runtime';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { MaterialEnum } from '/@/enums/appEnum';

  const emit = defineEmits(['update:formState']);
  const { t } = useI18n();
  const { openModal } = useExpression();
  const { allFormWidget, excludeSubTableFormWidget, subTableModalState } = useDesigner();

  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    tableData: {
      type: Object as PropType<{ id: string; model: string; validateCustomKey: Function }>,
      default: () => {},
    },
  });

  const formData = reactive<FieldFormState>(props.formState);

  enum compTextEnum {
    form = 'sys.pageDesigner.form',
    cardlist = 'sys.pageDesigner.cardList',
    datatable = '表格行',
    medprocontainersearch = 'sys.kit.medPro.containerSearch',
  }

  const initData = () => {
    return {
      mappingType: EntityFormulaReturnTypeEnum.Text,
      specificConfig: {
        formulaConfig: {
          exp: '',
          expression: '',
          showQrCode: false,
        },
      },
    };
  };

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  const handleClick = (el) => {
    formData.specificConfig = {
      ...formData.specificConfig,
      formulaConfig: {
        exp: formData.specificConfig?.formulaConfig?.exp || '',
        expression: formData.specificConfig?.formulaConfig?.expression || '',
        showQrCode: el.target._value,
        digits: formData.specificConfig?.formulaConfig?.digits || 0,
        truelabel: formData.specificConfig?.formulaConfig?.truelabel,
        falselabel: formData.specificConfig?.formulaConfig?.falselabel,
      },
    };
  };

  const isFormField = computed(() => {
    const materialType = props.formState.materialType!;
    if (materialType) {
      return materialType === MaterialEnum.MaterialFormField;
    } else {
      const material =
        props.formState?.currentFormId?.split('_')[0] || props.tableData?.id?.split('_')[0];
      return material === 'form';
    }
  });

  const addFormula = async () => {
    const identifierData = await _getDataIdentifiers();
    openModal({
      expr: formData.specificConfig?.formulaConfig?.exp,
      exprEcho: formData.specificConfig?.formulaConfig?.expression,
      returnType: formData.mappingType as EntityFormulaReturnTypeEnum,
      disabledReturnType: props.isEdit,
      mode: ExpressionModeEnum.PAAS_CREATE_FIELD,
      modalTitle: props.isEdit
        ? t('sys.pageDesigner.editFormula')
        : t('sys.pageDesigner.newFormula'),
      identifiers: {
        [ExpressionTabEnum.FIELD]: identifierData,
      },
      fieldProps: {
        /**小数位数 */
        digits: formData.specificConfig?.formulaConfig?.digits || 0,
        /**布尔值真 */
        trueText: formData.specificConfig?.formulaConfig?.truelabel,
        /**布尔值假 */
        falseText: formData.specificConfig?.formulaConfig?.falselabel,
      },
      callback: (expr, _, form) => {
        formData.specificConfig = {
          ...formData.specificConfig,
          formulaConfig: {
            exp: expr,
            expression: form?.exprEcho || '',
            showQrCode: formData.specificConfig?.formulaConfig?.showQrCode || false,
            digits: form?.fieldProps?.digits || 0,
            truelabel: form?.fieldProps?.trueText,
            falselabel: form?.fieldProps?.falseText,
          },
        };
        formData.mappingType = form?.returnType || '';

        props.formRef.validateFields([['specificConfig', 'formulaConfig', 'expression']]);
      },
    });
  };

  const formWidgets = toRef(() => {
    const type = props.tableData.id.split('_')[0] || 'datatable';
    const str = `当前${t(compTextEnum[type] || '表格行')}`;
    if (type === 'form') {
      return subTableModalState.value ? allFormWidget.value : excludeSubTableFormWidget.value;
    } else {
      return [
        {
          id: props.tableData.id!,
          props: { name: str, model: props.tableData.model! },
        },
      ];
    }
  });

  const _getDataIdentifiers = async () => {
    const P = formWidgets.value
      .filter((i) => i.props.model)
      .map(async (form) => {
        const fieldList = (await getFieldMetaList({ modelKey: form.props.model! })) || [];
        const children =
          fieldList
            ?.filter(formulaFilter)
            .map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
        return {
          id: form.id,
          name: form.props?.name || `${form.alias || t(form.name)}${form.id}`,
          children,
        };
      });
    const data = await Promise.all(P);
    return data;
  };

  defineExpose({
    initData,
  });
</script>
<style lang="scss" scoped></style>
