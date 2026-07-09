import { FIELD_TYPE } from '/@/enums/appEnum';
import { ref, computed, toRefs, toRaw, nextTick, toRef, reactive, onMounted, watch } from 'vue';
import { Select } from '/@page-designer/types/pad';

/**
 *
 * @param props 关联类型字段编辑或只读下 翻译
 * @returns
 */
export function useFiledLabels(props) {
  const { multiple, field, isFieldModel, bindFieldLink } = reactive(props.widget.props);
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  /**翻译内容数组 */
  const dictArr = toRef(() => {
    return props.formData?._DICT?.[fieldKey]?.[props.modelValue];
  });
  /**给标签显示用的 */
  const labelArr = toRef(() => {
    return dictArr.value || [props.modelValue];
  });

  return { labelArr, dictArr };
}
