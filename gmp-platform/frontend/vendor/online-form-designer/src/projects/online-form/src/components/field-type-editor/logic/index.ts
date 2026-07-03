import { FIELD_TYPE } from '@gct/runtime';
import { NumberEditor, TextEditor, DateEditor, BooleanEditor, EnumEditor } from '../editors';

const OnlineFormTypeEditorMap = {
  [FIELD_TYPE.TEXT]: TextEditor,
  [FIELD_TYPE.LONG_TEXT]: TextEditor,
  [FIELD_TYPE.INTEGER]: NumberEditor,
  [FIELD_TYPE.LONG]: NumberEditor,
  [FIELD_TYPE.DOUBLE]: NumberEditor,
  [FIELD_TYPE.DECIMAL]: NumberEditor,
  [FIELD_TYPE.DATE]: DateEditor,
  [FIELD_TYPE.DATE_TIME]: DateEditor,
  [FIELD_TYPE.TIME]: DateEditor,
  [FIELD_TYPE.ENUM]: EnumEditor,
  [FIELD_TYPE.ENUM_MULTI]: EnumEditor,
  [FIELD_TYPE.BOOLEAN]: BooleanEditor,
};

/**
 * 获取电子表单属性类型编辑器
 * @export
 * @param type
 * @return {*}
 */
export function getEditorByOnlineFormType(type?: FIELD_TYPE) {
  if (type) {
    return OnlineFormTypeEditorMap[type] || TextEditor;
  }
  return TextEditor;
}
