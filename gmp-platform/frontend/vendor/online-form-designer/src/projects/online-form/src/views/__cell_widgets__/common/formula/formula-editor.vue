<template>
  <a-input
    :class="[ns.b()]"
    readonly
    @click="addFormula"
    :placeholder="t('sys.inputText')"
    :value="exprEcho || expr"
  />
</template>

<script lang="ts" setup name="formula-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    ReturnTypeEnum,
  } from '/@/components/Expression';
  import { useFormulaEditor } from './logic';

  const { t } = useI18n();

  const ns = useNamespace('formula-editor');
  const { openModal } = useExpression();

  const props = withDefaults(
    defineProps<{
      modelKey: string;
      expr?: string;
      exprEcho?: string;
    }>(),
    {},
  );
  const { fieldsOptions } = useFormulaEditor(props);

  const emit = defineEmits<{
    (e: 'update:expr', expr: string): void;
    (e: 'update:exprEcho', exprEcho: string): void;
  }>();

  const addFormula = async () => {
    openModal({
      expr: props.expr,
      returnType: ReturnTypeEnum.Number,
      mode: ExpressionModeEnum.ONLINE_FORM_FIELD_FORMULA,
      identifiers: {
        [ExpressionTabEnum.FIELD]: fieldsOptions.value,
      },
      callback: (expr, exprEcho) => {
        emit('update:expr', expr);
        emit('update:exprEcho', exprEcho!);
      },
    });
  };
</script>

<style lang="scss" scoped>
  $formula-editor: (
    height: auto,
  );

  @include b(formula-editor) {
    @include set-component-css-var(formula-editor, $formula-editor);
    height: getCssVar(formula-editor, height);
  }
</style>
