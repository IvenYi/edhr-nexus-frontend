import { FormComponents, BuiltinType } from '/@page-designer/enum';

// pc端映射
const map: Record<string, string[]> = {
  // 表单不可放入元素
  [FormComponents.Form]: [
    FormComponents.Form,
    FormComponents.DataList,
    FormComponents.TableSelect,
    FormComponents.DataTable,
    FormComponents.DataVTable,
    FormComponents.TreeTable,
    FormComponents.RefDataTable,
    FormComponents.RdoDataList,
    FormComponents.RdoForm,
    FormComponents.MedProRdoForm
  ],
  [FormComponents.RdoForm]: [
    FormComponents.Form,
    FormComponents.DataList,
    FormComponents.TableSelect,
    FormComponents.DataTable,
    FormComponents.DataVTable,
    FormComponents.TreeTable,
    FormComponents.RefDataTable,
    FormComponents.RdoDataList,
    FormComponents.RdoForm,
    FormComponents.MedProRdoForm
  ],
  // 按钮容器可放入元素清单
  [FormComponents.ButtonContainer]: [
    FormComponents.CustomButton,
    FormComponents.CreateButton,
    FormComponents.CopyButton,
    FormComponents.DeleteButton,
    FormComponents.SubmitButton,
    FormComponents.RefreshButton,
    FormComponents.ResetButton,
    FormComponents.ImportButton,
    FormComponents.ExportButton,
    FormComponents.LabelPrintButton,
    FormComponents.ProcessButton,
    FormComponents.ModelingButton,
    FormComponents.DocumentPrintButton,
  ],
};

// 移动端映射
const mobMap: Record<string, string[]> = {
  // 表单不可放入元素
  [FormComponents.Form]: [
    FormComponents.Form,
    FormComponents.CardList,
    FormComponents.DataTable,
    FormComponents.DataVTable,
    FormComponents.TreeTable,
  ],
  // 按钮容器可放入元素清单
  [FormComponents.ButtonContainer]: [
    FormComponents.CustomButton,
    FormComponents.SubmitButton,
    FormComponents.ResetButton,
  ],
};

/**
 * 是否允许拖入
 *
 * @author zhanghanrui
 * @date 2024-05-09 17:05:01
 * @export
 * @param {IData} parent
 * @param {IData} data
 * @return {*}  {boolean}
 */
export function isDropAllowed(parent: IData, data: IData): boolean {
  if (parent && parent.type) {
    const { platform, type } = parent;
    const subType = data.type as string;
    console.log('平台: ', platform, '- 容器类型：', type, '- 放置类型：', data.type);
    if (platform === 'web') {
      switch (type) {
        case FormComponents.Collapse:
        case FormComponents.LayoutContainer:
        case FormComponents.GridCol:
        case FormComponents.LeftRightColumns:
        case FormComponents.TabPane:
        case FormComponents.BottomButtonContainer:
        case BuiltinType.MODAL:
          return true;
        case FormComponents.Form:
          return !map[FormComponents.Form].includes(subType);
        case FormComponents.RdoForm:
        case FormComponents.MedProRdoForm:
          return !map[FormComponents.RdoForm].includes(subType);
        case FormComponents.ButtonContainer:
          return map[FormComponents.ButtonContainer].includes(subType);
        default:
          return false;
      }
    } else if (platform === 'mobile') {
      switch (type) {
        case FormComponents.Collapse:
        case FormComponents.TabPane:
        case BuiltinType.MODAL:
        case FormComponents.GridCol:
          return true;
        case FormComponents.Form:
          return !mobMap[FormComponents.Form].includes(subType);
        case FormComponents.ButtonContainer:
          return mobMap[FormComponents.ButtonContainer].includes(subType);
        default:
          return false;
      }
    }
  }
  return true;
}
