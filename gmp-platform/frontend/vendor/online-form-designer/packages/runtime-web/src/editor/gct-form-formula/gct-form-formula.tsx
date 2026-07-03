import { defineComponent, PropType, ref } from 'vue';
import { useGctFormValue as useGctFormValue2, useNamespace } from '@gct-paas/core';
import useExpression, { ExpressionModeEnum } from '/@/components/Expression';
import {
  IFormItem,
  IFormItemController,
  IFormulaEditor,
  useForm,
  useGctFormValue,
} from '@gct/runtime';
import './gct-form-formula.scss';

export const GctFormFormula = defineComponent({
  name: 'GctFormFormula',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormulaEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const ns = useNamespace('form-formula');

    const formC = useForm();

    const t = window.$t;

    const inputRef = ref();

    const val = useGctFormValue();
    const expressionEcho = useGctFormValue2('expressionEcho');

    const { openModal } = useExpression();

    const openExpress = async () => {
      openModal({
        expr: val.value.expr,
        exprEcho: expressionEcho?.value,
        returnType: val.value.mappingType || 'string',
        mode: ExpressionModeEnum.DATA_SET_FORMULA,
        identifiers: {},
        callback: (expr, _, form) => {
          val.value = { expr, mappingType: form?.returnType };
          if (expressionEcho) {
            expressionEcho.value = form?.exprEcho;
          }
          formC.validateItem(props.itemModel.name);
        },
        ...(props.model.config || {}),
      });
    };

    return () => {
      return (
        <div class={ns.b()} onClick={openExpress}>
          <a-input
            ref={inputRef}
            class={ns.e('input')}
            readonly
            value={expressionEcho?.value || val.value}
            placeholder={t('sys.inputText')}
          />
        </div>
      );
    };
  },
});
