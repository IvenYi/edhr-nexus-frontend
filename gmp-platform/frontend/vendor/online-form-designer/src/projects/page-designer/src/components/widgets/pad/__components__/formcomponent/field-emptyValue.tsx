import { computed, defineComponent } from 'vue';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
import { FormComponents } from '@gct/runtime';

const { displayValue } = useGlobalSetting();

const excludeTypes: string[] = [FormComponents.SubTable];
const exclude: string[] = [];

/**空值显示逻辑 */
export function emptyValueDisplay(props, value) {
  const isEmpty = computed(() => {
    const type = props.widgetType;
    const fieldType = props.props.fieldType;
    return (
      props.props.readonly &&
      fieldType &&
      !excludeTypes.includes(type) &&
      !exclude.includes(fieldType) &&
      (value.value === undefined || value.value === '' || value.value === null)
    );
  });
  const RenderEmptyValue = defineComponent(() => () => displayValue.value);
  return {
    RenderEmptyValue,
    isEmpty,
  };
}
