<template>
  <div>
    <a-button block @click="handleOpenExpr" :type="!!propValue ? 'primary' : 'default'">
      <template #icon>
        <setting-outlined />
      </template>
      {{ t('sys.pageDesigner.displayRule') }}
    </a-button>
  </div>
</template>
<script setup lang="ts" name="display-rules-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

  const { allFormWidget, excludeSubTableFormWidget, subTableModalState } = useDesigner();
  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { openModal } = useExpression();

  const formWidgets = computed(() => {
    // 子表弹框里面需要显示全部表单列表
    // 非子表弹框需要显示过滤子表表单的列表
    return subTableModalState.value ? allFormWidget.value : excludeSubTableFormWidget.value;
  });

  const handleOpenExpr = async () => {
    openModal({
      expr: propValue.value,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr) => {
        propValue.value = expr;
      },
    });
  };
  /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P = formWidgets.value
      .filter((i) => i.props.model)
      .map(async (form) => {
        const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
        const children =
          fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
        return {
          id: form.id,
          name: `${form.alias || t(form.name)} ${form.id}`,
          children,
        };
      });
    return await Promise.all(P);
  };
</script>

<style lang="less" scoped></style>
