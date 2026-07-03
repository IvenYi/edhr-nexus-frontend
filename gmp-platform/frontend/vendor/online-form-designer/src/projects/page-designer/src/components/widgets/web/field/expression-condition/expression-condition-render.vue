<template>
  <FieldReadonly
    v-if="readonly"
    :type="fieldType"
    :label="fieldText"
    :tagWidgetStyle="widget.style"
  />
  <a-input
    v-else
    readonly
    v-model:value="fieldText"
    allowClear
    :placeholder="placeholder"
    ref="inputRef"
    @change="changeSelect"
    @click.stop="handleOpenModal"
  />
</template>
<script name="gct-expression-condition" setup lang="ts">
  import { toRefs, computed, nextTick } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postFieldMetaFuncCheck } from '/@/apis/gct-apaas/FieldMetaController';
  import useExpression, {
    ExpressionCard,
    ExpressionModeEnum,
    ExpressionTabEnum,
    EntityFormulaReturnTypeEnum,
    ReturnTypeEnum,
  } from '/@/components/Expression/index';

  const { openModal, identify } = useExpression();

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: LowCodeWidget.FieldSchema;
    formData: { _DICT: any; [key: string]: any };
  }>();

  interface ConditionConfig {
    mappingType: EntityFormulaReturnTypeEnum | ReturnTypeEnum;
    modelKey: string;
    specificConfig: {
      formulaConfig: {
        exp: string;
        expression: string;
      };
      true?: string;
      false?: string;
      digits?: number;
    };
  }

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const { getValue, setValue } = useFormWidget(props, emit);
  const { formData } = toRefs(props);
  const Event = getPageEvent();
  const { readonly, fieldType, placeholder, field } = toRefs(props.widget.props);

  const initConfig: ConditionConfig = {
    mappingType: EntityFormulaReturnTypeEnum.Text,
    modelKey: '',
    specificConfig: {
      formulaConfig: {
        exp: '',
        expression: '',
      },
      true: t('sys.real'),
      false: t('sys.fake'),
      digits: 0,
    },
  };

  const value = computed<ConditionConfig | any>({
    get() {
      return props.modelValue ? JSON.parse(props.modelValue) : initConfig;
    },
    set(value: string) {
      emit('update:modelValue', JSON.stringify(value));
    },
  });

  const fieldText = computed(() => {
    const expression = value.value?.specificConfig?.formulaConfig?.expression;
    return expression ? '${' + expression + '}' : '';
  });

  const isEdit = computed(() => {
    return !!value.value.specificConfig?.formulaConfig?.exp;
  });

  const handleOpenModal = async () => {
    openModal({
      expr: value.value?.specificConfig?.formulaConfig?.exp,
      returnType: value.value?.mappingType as EntityFormulaReturnTypeEnum,
      mode: ExpressionModeEnum.RUN_FORMULA,
      modalTitle: `${isEdit.value ? t('sys.edit') : t('sys.new')}${t(
        'sys.pageDesigner.formulaCalculation',
      )}`,
      identifiers: {},
      modelKey: value.value.modelKey,
      fieldProps: {
        /**小数位数 */
        digits: value.value?.specificConfig?.digits,
        /**布尔值真 */
        trueText: value.value?.specificConfig?.true,
        /**布尔值假 */
        falseText: value.value?.specificConfig?.false,
      },
      beforeClose: async (expr, exprEcho, type, formState) => {
        await postFieldMetaFuncCheck({
          expConfig: {
            exp: expr,
            expression: exprEcho || '',
            relationColumns: identify(expr),
          },
          modelKey: formState.modelKey,
          mappingType: type,
        });
        return true;
      },
      callback: async (expr, _, form) => {
        const expCondConfig: ConditionConfig = {
          mappingType: form?.returnType || EntityFormulaReturnTypeEnum.Text,
          modelKey: form?.modelKey || '',
          specificConfig: {
            formulaConfig: {
              exp: expr,
              expression: form?.exprEcho || '',
            },
            digits: form?.fieldProps?.digits,
            true: form?.fieldProps?.trueText,
            false: form?.fieldProps?.falseText,
          },
        };
        value.value = expCondConfig;
        await nextTick();
        emit('saveTableRow');
      },
    });
  };

  function deselect(clearValue) {
    Event.runEventByName('afterClear', props.widget.events, clearValue, formData.value);
  }

  async function changeSelect(v) {
    if (!v) {
      deselect(value.value);
    }
    Event.runEventByName('onChange', props.widget.events, value.value, formData.value);
    emit('saveTableRow');
  }

  defineExpose({ getValue, setValue });
</script>

<style lang="less" scoped></style>
