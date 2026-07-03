import { FormFieldChange, FillSignField, ExecuteScript } from '../action';
import { ApprovalEventAction } from '../constant';

const ActionEditorMap = {
  // [ApprovalEventAction.FormFieldChange]: FormFieldChange,
  [ApprovalEventAction.FillSignField]: FillSignField,
  // [ApprovalEventAction.ExecuteScript]: ExecuteScript,
};

/**
 * 获取事件动作类型编辑器
 * @export
 */
export function getActionEditorByType(type: ApprovalEventAction) {
  return ActionEditorMap[type];
}
