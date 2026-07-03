import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { computed, defineComponent } from 'vue';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

const { displayValue } = useGlobalSetting();

/**空值显示逻辑 */
export function emptyValueDisplay(widget: LowCodeWidget.FieldSchema, value) {
  /**部分字段排除空值显示 */
  const exclude = [];
  const fieldType = widget.props.fieldType;
  const isEmpty = computed(() => {
    return (
      widget.props.readonly &&
      fieldType &&
      !exclude.includes(fieldType) &&
      (value.value === undefined || value.value === '' || value.value === null)
    );
  });
  const RenderEmptyValue = defineComponent(
    (props, { slots }) =>
      () =>
        <span>{displayValue.value}</span>,
  );
  return {
    RenderEmptyValue,
    isEmpty,
  };
}
