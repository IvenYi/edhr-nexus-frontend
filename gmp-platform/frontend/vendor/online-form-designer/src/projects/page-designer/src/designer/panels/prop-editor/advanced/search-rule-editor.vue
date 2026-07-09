<template>
  <a-button block @click="openRule" class="rules-btn" style="box-shadow: none">
    <template #icon>
      <!-- <i class="iconfont icon-tianjia mr-4px" style="font-size: 14px; line-height: 1"></i> -->
    </template>
    {{ $t('sys.pageDesigner.addQueryRules') }}
  </a-button>
</template>

<script setup lang="ts" name="search-rule-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    IdentifierGroupInterface,
  } from '/@/components/Expression';
  import { Search } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const { openModal } = useExpression();
  const defProps = defineProps(props);
  const widget = <Search>defProps.widget;
  const { propValue } = usePropEditor(defProps.propName, defProps.widget);
  function openRule() {
    const widgetlist = defProps.propConfig.getSearchWidgets
      ? defProps.propConfig.getSearchWidgets(defProps.widget)
      : defProps.widget?.children;
    openModal({
      expr: propValue.value,
      mode: ExpressionModeEnum.SEARCH,
      identifiers: {
        [ExpressionTabEnum.FIELD]: (widgetlist ?? []).map(getIdentifiers),
      },
      callback(expr) {
        propValue.value = expr;
      },
    });
  }
  function getIdentifiers(
    fieldWidget: (typeof widget.props.fieldWidgets)[number],
  ): IdentifierGroupInterface {
    const children = fieldWidget.props.ope.map((ope) => ({
      id: ope,
      name: t(`sys.model.${ope}`),
      valueType: 'boolean',
    }));
    return {
      id: fieldWidget.id,
      name: fieldWidget.props.label || fieldWidget.props.fieldName,
      children,
      idToChildren: true,
    };
  }
</script>

<style lang="less" scoped></style>
