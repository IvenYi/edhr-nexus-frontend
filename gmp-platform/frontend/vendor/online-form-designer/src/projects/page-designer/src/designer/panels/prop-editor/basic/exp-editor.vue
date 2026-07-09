<template>
  <a-form-item>
    <a-input
      :value="value"
      @click="openExpress"
      size="small"
      readonly
      :placeholder="$t('sys.pageDesigner.pleaseEnterAnExpression')"
    />
  </a-form-item>
</template>

<script setup lang="ts" name="exp-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

  const { openModal } = useExpression();

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const value = computed({
    get() {
      return propValue.value || undefined;
    },
    set(val) {
      propValue.value = val;
    },
  });

  const openExpress = async () => {
    const fieldList = await getFieldMetaList({ modelKey: defProps.widget.props.model! });
    const children =
      fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
    openModal({
      expr: value.value,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: [
          {
            id: defProps.widget.id,
            name: `当前列表 ${defProps.widget.id}`,
            children,
          },
        ],
      },
      callback: (expr) => {
        value.value = expr;
      },
    });
  };
</script>

<style lang="less" scoped></style>
