import { FormComponents } from '../enum';

/**
 * 设计界面暴露组件映射
 *
 * @interface ComponentTypeMap
 */
export const ComponentTypeMap = {
  [FormComponents.Input]: 'IInputComponentExpose',
  [FormComponents.Inputnumber]: 'IInputnumberComponentExpose',
  [FormComponents.InputDouble]: 'IInputdoubleComponentExpose',
  [FormComponents.RdoSelect]: 'IRdoSelectComponentExpose',
  [FormComponents.Radio]: 'IRadioComponentExpose',
  [FormComponents.Switch]: 'ISwitchComponentExpose',
  [FormComponents.Textarea]: 'ITextareaComponentExpose',
  [FormComponents.Userpicker]: 'IUserpickerComponentExpose',
  [FormComponents.Search]: 'ISearchComponentExpose',
  [FormComponents.SelectSearch]: 'ISelectSearchComponentExpose',
  [FormComponents.LeftRightColumns]: 'ILeftRightColumnsComponentExpose',
  [FormComponents.SubTable]: 'ISubTableComponentExpose',
  [FormComponents.TableSelect]: 'ITableSelectComponentExpose',
  [FormComponents.GenSwitch]: 'IGenSwitchComponentExpose',
  // 汇总
  [FormComponents.AGG]: 'IAggComponentExpose',
  // 公式
  [FormComponents.EXPRESSION]: 'IExpressionComponentExpose',
  // 事务
  [FormComponents.Transaction]: 'ITransactionComponentExpose',
  // 动态表格
  [FormComponents.DynamicTable]: 'IDynamicTableComponentExpose',
  // 标签设计
  [FormComponents.LabelTemplate]: 'ILabelTemplateComponentExpose',
  // 标签模板
  [FormComponents.LabelTemplateRef]: 'ILabelTemplateRefComponentExpose',
  // 打印机
  [FormComponents.Printer]: 'IPrinterComponentExpose',
  // 描述列表
  [FormComponents.Descriptions]: 'IDescriptionsComponentExpose',
  [FormComponents.Iframe]: 'IIframeComponentExpose',
  // 手写板
  [FormComponents.Wacom]: 'IWacomComponentExpose',
  // 单据模板
  [FormComponents.DocumentTemplate]: 'IDocumentTemplateRefComponentExpose',
  // 工作流节点
  [FormComponents.WorkflowNodes]: 'IWorkflowNodesComponentExpose',
  // 执行按钮
  [FormComponents.ExcuteButton]: 'IExcuteButtonComponentExpose',
  // 在线表单模板、edhr模板
  [FormComponents.TmplTreeSelect]: 'ITmplTreeSelectComponentExpose',
  [FormComponents.RdoDataList]: 'IRdoDataListComponentExpose',

  [FormComponents.Checkbox]: 'ICheckboxComponentExpose',
  [FormComponents.GenRadio]: 'IGenRadioComponentExpose',
  [FormComponents.GenCheckbox]: 'IGenCheckboxComponentExpose',
  // 基础表格
  [FormComponents.DataTable]: 'IDataTableComponentExpose',
  [FormComponents.DataVTable]: 'IDataTableComponentExpose',
  // rdo表格
  [FormComponents.RdoTable]: 'IRdoTableComponentExpose',
  // 表单
  [FormComponents.Form]: 'IFormComponentExpose',
  // rdo 表单
  [FormComponents.RdoForm]: 'IRdoFormComponentExpose',
  // 树形表格
  [FormComponents.TreeTable]: 'ITreeTableComponentExpose',
  // 数据列表
  [FormComponents.DataList]: 'IDataListComponentExpose',
  // 部门选择
  [FormComponents.Department]: 'IDepartmentComponentExpose',
  // 基础选择
  [FormComponents.Select]: 'ISelectComponentExpose',
  // 下拉按钮
  [FormComponents.DropdownButton]: 'IDropdownButtonComponentExpose',
};

/**
 * 设计界面暴露组件映射
 *
 * @interface ComponentTypeMap
 */
export const MobileComponentTypeMap = {
  [FormComponents.Input]: 'IMobInputComponentExpose',
  [FormComponents.Checkbox]: 'IMobCheckboxComponentExpose',
  [FormComponents.DataTable]: 'IMobDataTableComponentExpose',

  [FormComponents.TreeTable]: 'IMobTreeTableComponentExpose',
  [FormComponents.Form]: 'IMobFormComponentExpose',
  [FormComponents.Inputnumber]: 'IMobInputnumberComponentExpose',
  [FormComponents.InputDouble]: 'IMobInputdoubleComponentExpose',
  [FormComponents.Radio]: 'IMobRadioComponentExpose',
  [FormComponents.Select]: 'IMobSelectComponentExpose',
  [FormComponents.RdoSelect]: 'IMobRdoSelectComponentExpose',
  [FormComponents.Textarea]: 'IMobTextareaComponentExpose',
  [FormComponents.Switch]: 'IMobSwitchComponentExpose',
  [FormComponents.Search]: 'IMobSearchComponentExpose',
  [FormComponents.Userpicker]: 'IMobUserpickerComponentExpose',
  [FormComponents.GenSwitch]: 'IMobGenSwitchComponentExpose',
  [FormComponents.GenCheckbox]: 'IMobGenCheckboxComponentExpose',
  [FormComponents.GenRadio]: 'IMobGenRadioComponentExpose',
  [FormComponents.AGG]: 'IMobAggComponentExpose',
  [FormComponents.EXPRESSION]: 'IMobExpressionComponentExpose',
  [FormComponents.DynamicTable]: 'IMobDynamicTableComponentExpose',
  [FormComponents.Transaction]: 'IMobTransactionComponentExpose',

  [FormComponents.DocumentTemplate]: 'IMobDocumentTemplateComponentExpose',
  [FormComponents.LabelTemplateRef]: 'IMobLabelTemplateRefComponentExpose',
  [FormComponents.Printer]: 'IMobPrinterComponentExpose',
  [FormComponents.Wacom]: 'IMobWacomComponentExpose',
  [FormComponents.TmplTreeSelect]: 'IMobTmplTreeSelectComponentExpose',
  [FormComponents.Descriptions]: 'IMobDescriptionsComponentExpose',
  [FormComponents.SubTable]: 'IMobSubTableComponentExpose',
  [FormComponents.CardList]: 'IMobCardListQueryDataOptions',
  [FormComponents.UploadFile]: 'IMobUploadFileComponentExpose',
  [FormComponents.UploadImage]: 'IMobUploadImageComponentExpose',
  [FormComponents.QuickSearch]: 'IQuickSearchComponentExpose',
};

export const PadComponentExposeMap = {
  [FormComponents.Search]: 'IPadSearchComponentExpose',
};
