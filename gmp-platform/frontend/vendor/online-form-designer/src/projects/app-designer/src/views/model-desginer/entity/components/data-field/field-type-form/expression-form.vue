<template>
  <a-form-item :label="`${t('sys.model.referenceValue')}`">
    <a-checkbox v-model:checked="referenceValue">
      {{ t('sys.model.referencingDataFromOtherModels') }}
    </a-checkbox>
  </a-form-item>
  <a-form-item v-if="referenceValue === true" :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
    <DataLinkageConfig
      mode="component"
      :context="{ bindModelKey: formData.modelKey, fieldModelKey: '' }"
      v-model:items="linkageItems"
      v-model:end-data="endData"
      :max="3"
      :endFieldTypes="[FIELD_TYPE.EXPRESSION_CONDITION]"
      :endAfterInfo="t('sys.pageDesigner.dataLinkage.descAfter3')"
      :contentTitle="t('sys.pageDesigner.createReferenceDiagram')"
      :deleteMessage="t('sys.pageDesigner.deleteReferenceRelationship')"
      :excludeFieldType="[FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF]"
    />
  </a-form-item>
  <template v-if="referenceValue !== true">
    <a-form-item
      :name="['specificConfig', 'expConfig', 'expression']"
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
        :value="formData.specificConfig?.expConfig?.expression"
      />
    </a-form-item>
    <a-form-item v-show="false" :label="t('sys.expression.returnValue')">
      <!-- v-show="formData.specificConfig?.expConfig?.expression" -->
      {{ t('sys.expression.' + formData.mappingType) }}
    </a-form-item>
    <a-form-item
      :label="`${t('sys.model.decimalDigits')}`"
      :name="['specificConfig', 'digits']"
      :rules="[{ required: true }]"
      v-if="false"
    >
      <!-- v-if="formData.mappingType === EntityFormulaReturnTypeEnum.Double" -->
      <a-input-number
        v-model:value="formData.specificConfig.digits"
        :min="configDigits"
        :precision="0"
        :max="20"
        :placeholder="t('sys.inputText')"
      />
    </a-form-item>
    <a-form-item v-show="false" :label="`${t('sys.boolOpt')}`" required>
      <!-- v-if="formData.mappingType === EntityFormulaReturnTypeEnum.Boolen" -->
      <i18n-select-input-form
        :formRef="formRef"
        :formItemName="['specificConfig', 'true']"
        :fromItemExtraProps="{
          label: t('sys.real'),
          colon: false,
          rules: [{ required: true, message: t('sys.model.boolNameRequired') }],
        }"
        :inputExtraProps="{ showCount: true, maxlength: 32 }"
        v-model:text="formData.specificConfig.true"
        v-model:i18nConfig="formData.i18nConfig"
      />
      <i18n-select-input-form
        :formRef="formRef"
        :formItemName="['specificConfig', 'false']"
        :fromItemExtraProps="{
          label: t('sys.fake'),
          colon: false,
          rules: [{ required: true, message: t('sys.model.boolNameRequired') }],
        }"
        :inputExtraProps="{ showCount: true, maxlength: 32 }"
        v-model:text="formData.specificConfig.false"
        v-model:i18nConfig="formData.i18nConfig"
      />
    </a-form-item>
    <a-form-item
      :label="`${t('sys.model.realTimeCalc')}`"
      :name="['specificConfig', 'expRealCompute']"
    >
      <a-checkbox v-model:checked="formData.specificConfig.expRealCompute" :disabled="isEdit">
        {{ t('sys.model.realTimeCalcTip') }}
      </a-checkbox>
    </a-form-item>
  </template>
</template>
<script setup lang="ts" name="expression">
  import { PropType, reactive, watch, computed } from 'vue';
  import { FieldFormState, SpecificConfig } from '../../../types/entity.d';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    EntityFormulaReturnTypeEnum,
  } from '/@/components/Expression';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { getFieldMetaList, postFieldMetaFuncCheck } from '/@/apis/gct-apaas/FieldMetaController';
  import { useI18n } from 'vue-i18n';
  import { FormInstance } from 'ant-design-vue';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { DataLinkageConfig } from '@/projects/page-designer/src/views/data-linkage-config/data-linkage-config';
  import { formulaFilter, FIELD_TYPE } from '@gct/runtime';
  const emit = defineEmits(['update:formState']);
  const { t } = useI18n();
  const { openModal, identify } = useExpression();
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
  });

  const formData = reactive<FieldFormState>(props.formState);
  const configDigits = props.isEdit ? formData.specificConfig.digits : 0;

  const initData = () => {
    return {
      mappingType: EntityFormulaReturnTypeEnum.Text,
      specificConfig: {
        expConfig: {
          exp: '',
          expression: '',
          relationColumns: [],
        },
        true: t('sys.real'),
        false: t('sys.fake'),
        digits: 0,
        expRealCompute: false,
        expType: '',
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

  const addFormula = async () => {
    openModal({
      expr: formData.specificConfig?.expConfig?.exp,
      returnType: formData.mappingType as EntityFormulaReturnTypeEnum,
      disabledReturnType: props.isEdit,
      mode: ExpressionModeEnum.ENTITY_FORMULA,
      modalTitle: props.isEdit
        ? t('sys.pageDesigner.editFormula')
        : t('sys.pageDesigner.newFormula'),
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      fieldProps: {
        /**小数位数 */
        digits: formData.specificConfig.digits,
        /**布尔值真 */
        trueText: formData.specificConfig.true,
        /**布尔值假 */
        falseText: formData.specificConfig.false,
      },
      beforeClose: async (expr, exprEcho, type) => {
        await postFieldMetaFuncCheck({
          expConfig: {
            exp: expr,
            expression: exprEcho || '',
            relationColumns: identify(expr),
          },
          modelKey: formData.modelKey,
          mappingType: type,
        });
        return true;
      },
      callback: (expr, _, form) => {
        formData.specificConfig = {
          ...formData.specificConfig,
          expConfig: {
            exp: expr,
            expression: form?.exprEcho || '',
            relationColumns: identify(expr),
          },
        };
        formData.mappingType = form?.returnType || '';
        // if (!props.isEdit && formData.mappingType === EntityFormulaReturnTypeEnum.Double) {
        //   formData.specificConfig.digits = 0;
        // }
        formData.specificConfig.digits = form?.fieldProps?.digits;
        formData.specificConfig.true = form?.fieldProps?.trueText;
        formData.specificConfig.false = form?.fieldProps?.falseText;

        props.formRef.validateFields([['specificConfig', 'expConfig', 'expression']]);
      },
    });
  };
  const _getIdentifiers = async () => {
    const data = await getModelMetaDetail({ modelKey: formData.modelKey! });
    const children =
      data?.fieldMetaList?.filter(formulaFilter).map((i) => ({
        id: i.key!,
        name: `${data.name}.${i.name}`,
        valueType: i.type!,
        alias: i.name,
      })) || [];
    return children;
  };

  // 引用值判断
  const referenceValue = computed({
    get() {
      return formData.specificConfig.expType === 'REF';
    },
    set(val: any) {
      if (val === true) {
        formData.specificConfig.expType = 'REF';
        formData.specificConfig.expRealCompute = true;
        formData.specificConfig.expConfig = {
          nodes: [],
          designJson: {
            configs: [
              {
                id: null,
                label: null,
                modelCategory: '',
                modelKey: formData.modelKey,
                refModelCategory: '',
                refModelKey: formData.modelKey,
                value: null,
              },
            ],
          },
          fieldKey: '',
        };
      } else {
        formData.specificConfig.expType = '';
        formData.specificConfig.expConfig = {
          exp: '',
          expression: '',
          relationColumns: [],
        };
        formData.specificConfig.true = t('sys.real');
        formData.specificConfig.false = t('sys.fake');
        formData.specificConfig.digits = 0;
        formData.specificConfig.mappingType = EntityFormulaReturnTypeEnum.Text;
        formData.specificConfig.expRealCompute = false;
      }
    },
  });

  const linkageItems = computed<any>({
    get() {
      return formData.specificConfig.expConfig!.designJson?.configs;
    },
    set(val: any) {
      Object.assign(formData.specificConfig.expConfig!.designJson!, { configs: val });
      if (formData.specificConfig.expConfig!.designJson) {
        const { configs } = formData.specificConfig.expConfig!.designJson;
        formData.specificConfig.expConfig!.nodes = [];
        if (configs) {
          configs.forEach((item, i) => {
            if (i === 0) {
              return;
            }
            if (item.reverse) {
              formData.specificConfig.expConfig!.nodes.push({
                modelKey: item.refModelKey,
              });
              formData.specificConfig.expConfig!.nodes.push({
                modelKey: item.modelKey,
                fieldKey: item.value,
                direction: 'backward',
              });
            } else {
              formData.specificConfig.expConfig!.nodes.push({
                modelKey: item.modelKey,
                fieldKey: item.value,
                direction: 'forward',
              });
            }
          });
        }
      }
    },
  });

  const endData = computed<any>({
    get() {
      return formData.specificConfig.expConfig!.designJson?.endData;
    },
    set(val: any) {
      Object.assign(formData.specificConfig.expConfig!.designJson, { endData: val });
      if (formData.specificConfig.expConfig!.designJson) {
        const { endData } = formData.specificConfig.expConfig!.designJson;
        if (endData) {
          formData.specificConfig.expConfig!.fieldKey = endData.value;
        } else {
          formData.specificConfig.expConfig!.fieldKey = '';
        }
      }
    },
  });

  defineExpose({
    initData,
  });
</script>
<style lang="scss" scoped></style>
