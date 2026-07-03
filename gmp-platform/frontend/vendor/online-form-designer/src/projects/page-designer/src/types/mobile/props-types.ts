import { LowCodeWidget, validateRule } from '../widget-basic-types';
import {
  CURRENCY_ENUM,
  tabsTypeENUM,
  SelectPickerEnums,
  BindCmpStyleEnum,
  sortTypeEnum,
  operateSysEnums,
  ButtonTypeGroup,
  ButtonStyle,
  ButtonSize,
} from '/@page-designer/enum';
import { AGLINE_ENUMS } from '@/enums/designEnum';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
import { SearchWidgets } from '../web/search-widget-types';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';

export interface FormProps extends LowCodeWidget.WidgetProps {
  model?: string;
  layout: {
    label: 'top' | 'left';
    inputBg: boolean;
    inputAlign: 'left' | 'right';
  };
  /**自定义字段集合 */
  customFieldList?: any[];
  /**父模型字段选择 */
  parentModelSelection: boolean;
  /**
   * 父模型字段key
   */
  refParentModelkey: string;
  validateRule: validateRule[];
  /**名称支持宽度配置*/
  hasLabelWidth?: boolean;
  /**名称显示类型*/
  labelType?: string;
  /**名称显示宽度*/
  labelWidth?: string | number;
  /**名称显示样式*/
  overLabelDisplay?: string;
}
export interface FormProcessProps extends FormProps {
  /**流程id */
  processId?: string;
}

export interface ApprovalHistoryProps extends LowCodeWidget.WidgetProps {
  refForm?: string;
  title?: string;
  showTitle?: boolean;
  showOpinion?: boolean;
  showSignature?: boolean;
  /**流程id */
  processId: string;
}
export interface DescriptionsProps extends LowCodeWidget.WidgetProps {
  model?: string;
  layout: {
    label: 'top' | 'left';
    inputBg: boolean;
    inputAlign: 'left' | 'right';
  };
  column: number;
  refSearch?: string;
  /**名称支持宽度配置*/
  hasLabelWidth?: boolean;
  /**名称显示类型*/
  labelType?: string;
  /**名称显示宽度*/
  labelWidth?: string | number;
  /**名称显示样式*/
  overLabelDisplay?: string;
}
export interface InputProps extends LowCodeWidget.FormItemProps {
  /**可清空 */
  clearable: boolean;
  /**获取焦点 */
  getFocus: boolean;
}
export interface UploadFileProps extends LowCodeWidget.FormItemProps {
  maxSize: number;
  maxCount: number;
  multiple: boolean;
  accept: string;
  template: string;
  displayType?: 'concise' | 'more';
  /**
   * 自动填充配置
   */
  enableAutofill: boolean;
  autofillRules: {
    fromField: string;
    toField: string;
  }[];
}
export interface NumberProps extends LowCodeWidget.FormItemProps {
  /**最大值 */
  maxValue?: number;
  /**最大值表达式 */
  maxValueExpression: string;
  minValue?: number;
  minValueExpression: string;
  /**精度 */
  precision: number;
  /**千分位 */
  separator: boolean;
  /**获取焦点 */
  getFocus: boolean;
  fieldType?: FIELD_TYPE.DECIMAL | FIELD_TYPE.INTEGER | FIELD_TYPE.LONG;
  /**币种 */
  currency: CURRENCY_ENUM;
  /** 显示币种开关 */
  displayCurrency: boolean;
}

export interface DoubleProps extends LowCodeWidget.FormItemProps {
  /**最大值 */
  maxValue?: number;
  /**最大值表达式 */
  maxValueExpression: string;
  minValue?: number;
  minValueExpression: string;
  /**千分位 */
  separator: boolean;
  /**获取焦点 */
  getFocus: boolean;
  fieldType?: FIELD_TYPE.DOUBLE;
  /**币种 */
  currency: CURRENCY_ENUM;
  /** 显示币种开关 */
  displayCurrency: boolean;
}

export interface SwitchProps extends LowCodeWidget.FormItemProps {
  checkedChildren?: string;
  unCheckedChildren?: string;
  modelKey: string;
}
export interface ButtonProps extends LowCodeWidget.WidgetProps {
  refForm?: string;
  title: string;
}
export interface ExportProps extends LowCodeWidget.WidgetProps {
  model: string;
  templateKey: string;
  timeout: number;
  title: string;
}
export interface CollapseProps extends LowCodeWidget.WidgetProps {
  title: string;
  icon: string;
  color: string;
  isSupportFold: string;
  defaultFold: boolean;
  titleChildren: Array<any>;
  explain?: string;
  showExplain?: boolean;
}
export interface CardListProps extends LowCodeWidget.WidgetProps {
  title: string;
  model: string;
  /**关联搜索 */
  refSearch: string;
  /**显示标题 */
  showTitle: boolean;
  /**支持拖拽 */
  draggable: boolean;
  /**排序字段 */
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
  /**可见按钮数量 */
  visibleButtons: number;
  /**是否可以数据选择 */
  rowSelection: boolean;
  /**数据选择类型 */
  rowSelectionType: String;
  /**初始化加载 */
  initLoad: boolean;
  /**自定义数据源 */
  customdataSource: boolean;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  /** 布局方式 */
  layout: {
    label: 'top' | 'left';
    inputBg: boolean;
    inputAlign: 'left' | 'right';
  };
  /**名称支持宽度配置*/
  hasLabelWidth?: boolean;
  /**名称显示类型*/
  labelType?: string;
  /**名称显示宽度*/
  labelWidth?: string | number;
  /**名称显示样式*/
  overLabelDisplay?: string;
}
export type CardHeaderLeftProps = LowCodeWidget.WidgetProps;
export type CardHeaderRightProps = LowCodeWidget.WidgetProps;
export type CardContentProps = LowCodeWidget.WidgetProps;
export interface CardOpeBtnProps extends LowCodeWidget.WidgetProps {
  /**标题 */
  title: string;
  /**二次确认 */
  confirm: boolean;
  confirmText: string;
  /**内置事件 */
  innerEvent: boolean;
  /**系统事件类型 */
  sysMethedType?: operateSysEnums;
  linkPage: string;
  /**事件名称 */
  eventName: string;
  icon: string;
  iconColor: string;
  size: string;
  disabled: boolean;
  btnType: ButtonTypeGroup;
  type: string;
  danger: boolean;
}

export interface BaseButtonProps extends LowCodeWidget.WidgetProps {
  refForm?: string;
  /**标题 */
  title: string;
  /**二次确认 */
  confirm?: boolean;
  confirmText?: string;
  confirmI18nConfig?: string;
  /**内置事件 */
  innerEvent?: boolean;
  /**系统事件类型 */
  sysMethedType?: operateSysEnums;
  linkPage?: string;
  /**事件名称 */
  eventName?: string;
  /**显示规则 */
  // displayRule?: string;
  icon: string;
  iconColor: string;
  size: string;
  disabled: boolean;
  // btnType: ButtonTypeGroup;
  /**是否显示按钮名称 */
  hasText: boolean;
  /**是否显示图标 */
  hasIcon: boolean;
  /**按钮type */
  type: string;
  /**是否是危险类型 */
  danger: boolean;
  /**关联模型 */
  model?: string;
  i18nConfig?: string;
  /**按钮样式 */
  buttonStyle?: ButtonStyle;
  /**内置事件 */
  events?: object;
  enableCustomColor: boolean;
  backgroundColor?: string;
  fontColor?: string;
}

export interface ProcessButtonProps extends BaseButtonProps {
  refModel?: string;
  category?: string;
  refProcess?: string;
  refService?: string;
}

export interface approveButtonProps extends BaseButtonProps {
  action?: ButtonTypeEnum;
  /**不可删除 */
  noDelete: boolean;
  /**不可编辑 */
  noEdit: boolean;
  refForm: string;
  processId: string;
}

export interface TabPaneProps extends LowCodeWidget.WidgetProps {
  title: string;
}

export interface TabsProps extends LowCodeWidget.WidgetProps {
  /**标签类型 */
  type: tabsTypeENUM;
  /**间距 */
  tabBarGutter: number;
  /**默认展开页面 */
  defaultTag: string;
  /**line默认间距 */
  tabBarGutterLine: number;
  /**标签居中显示 */
  centered: boolean;
  /**切换销毁 */
  destroyInactiveTabPane: boolean;
}

export interface DeptProps extends LowCodeWidget.FormItemProps {
  /**默认当前用户部门 */
  defaultMain: FieldSysVarDefaultValueEnum;
  /**可清空 */
  clearable: boolean;
  /**选择方式 */
  selectType: BindCmpStyleEnum;
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE;
  modelKey: string;
  /**
   * 自动填充配置
   */
  enableAutofill: boolean;
  autofillRules: {
    fromField: string;
    toField: string;
  }[];
}
export interface PrinterProps extends LowCodeWidget.FormItemProps {
  /**可清空 */
  clearable: boolean;
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.PRINTER;
  modelKey: string;
  multiple: boolean;
}
export interface TmplTreeSelectProps extends LowCodeWidget.FormItemProps {
  /**可清空 */
  clearable: boolean;
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.E_DHR_TEMPLATE | FIELD_TYPE.ONLINE_FORM_TEMPLATE;
  modelKey: string;
  multiple: boolean;
}
export interface SelectProps extends LowCodeWidget.FormItemProps {
  multiple: boolean;
  clearable: boolean;
  /**
   * 关联主键模型
   */
  bindModelKey: string;
  /**
   * 字段类型
   */
  fieldType?:
  | FIELD_TYPE.ENUM
  | FIELD_TYPE.ENUM_MULTI
  | FIELD_TYPE.REF
  | FIELD_TYPE.REF_MULTI
  | FIELD_TYPE.RDO_REF;
  modelKey: string;
  /**
   * 自动填充配置
   */
  enableAutofill: boolean;
  autofillRules: {
    fromField: string;
    toField: string;
  }[];
  /**搜索 */
  showSearch: boolean /**搜索字段 */;
  /**搜索算子字段 */
  searchField?: string[];
  /**搜索exp */
  exp?: string;
  valueField?: string;
  rangeField?: string;
  refModelType: EntityModelTypeEnum;
  /** 初始化默认不加载 */
  initNotLoad: Boolean;
  /**自定义数据源 */
  customdataSource: boolean;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
}

export interface SignatureProps extends LowCodeWidget.FormItemProps {
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.SIGNATURE;
  signatureType: string | undefined;
  multiple: boolean;
  displayMaxNum?: number;
}

export interface GenRadioProps extends LowCodeWidget.FormItemProps {
  title: string;
  /**
   * 关联主键模型
   */
  bindModelKey: string;
  /**
   * 字段类型
   */
  // fieldType?: FIELD_TYPE;
  modelKey: string;
  /**选项卡配置 */
  options?: Array<any>;
  /**默认选择 */
  checked?: string | Array<any>;
  disabled: boolean;
}

export interface GenSwitchProps extends LowCodeWidget.WidgetProps {
  label: string;
  defaultValue: boolean;
  truelabel: string;
  falselabel: string;
  bindCompStyleType: string;
  fieldType: string;
  disabled: boolean;
}

export interface UserProps extends LowCodeWidget.FormItemProps {
  /**默认当前用户 */
  defaultMain: FieldSysVarDefaultValueEnum;
  /**可清空 */
  clearable: boolean;
  /**选择方式 */
  selectType: BindCmpStyleEnum;
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.USER | FIELD_TYPE.USER_MULTI;
  modelKey: string;
  /**
   * 自动填充配置
   */
  enableAutofill: boolean;
  autofillRules: {
    fromField: string;
    toField: string;
  }[];
  /**
   * 部门范围
   */
  enableDepScope: boolean;
  departmentScope: string;
}

export interface QuickSearchProps extends LowCodeWidget.WidgetProps {
  model?: string;
  /**查询字段配置信息 */
  searchField: [];
  scan: false;
  placeholder: string;
  /**最多显示个数 */
  // maxLength: number;
  /**单行显示个数 */
  // rowLength: number;
  /**对其方式 */
  // alignment: Exclude<AGLINE_ENUMS, AGLINE_ENUMS.BETWEEN>;
  /**自定义搜索规则 */
  exp: string;
  /**自定义搜索条件 */
  customHeader: boolean;
  /**获取焦点 */
  getFocus: boolean;
}

export interface SearchProps extends LowCodeWidget.WidgetProps {
  model?: string;
  /**查询字段配置信息 */
  fieldWidgets: SearchWidgets[];
  /**自定义搜索规则 */
  exp: string;
  /**自定义搜索条件 */
  customHeader: boolean;
}

export interface ButtonContainerProps extends LowCodeWidget.WidgetProps {
  //**按钮样式 */
  buttonStyle: ButtonStyle;
  /**对齐方式 */
  align?: AGLINE_ENUMS;
  /**间距 */
  margin: number;
  /**尺寸 */
  size: ButtonSize;
  model?: string;
  /**流程按钮 */
  enableProcess?: boolean;
  /**关联流程表单 */
  refForm?: string;
  processId?: string;
}

export interface TextProps extends LowCodeWidget.WidgetProps {
  text: string;
  i18nConfig: string;
}

export interface GenImageProps extends LowCodeWidget.WidgetProps {
  title: string;
  /** 上传图片路径*/
  imgUrl: string;
  /** 提示文字*/
  prompt: string;
  /** 辅助介绍*/
  auxiliary: string;
  /** 宽度自适应*/
  autoWidth: boolean;
  /** 图片尺寸*/
  width: number;
  height: number;
  maxHeight: number;
  /**宽高比 */
  whRadio?: number;
  displayLabelText: boolean
}

export interface DataListProps extends LowCodeWidget.WidgetProps {
  model: string;
  title: string;
  /**搜索 */
  showSearch: boolean;
  /**搜索方式 */
  searchMedthod: string;
  /**关联搜素 */
  refSearch: string;
  /**搜索字段 */
  searchField?: string[];
  /**搜索占位符 */
  searchPlaceholder: string;
  /**开启分页 */
  showPagination: boolean;
  pageSize: number;
  /**显示规则 */
  showMedthod: string;
  showField: string;
  showRule: string;
  /**排序字段 */
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
  defaultExpandLevel: number;
  /**内容最大行数 */
  maxRows?: number;
}

export interface GridProps extends LowCodeWidget.WidgetProps {
  /**横轴对对齐方式*/
  justify: string;
  /**纵轴对对齐方式*/
  align: string;
  /**间距 */
  gutter: number;
  /**栅格列大小 */
  colSpan: number[];
}
export interface GridColProps extends LowCodeWidget.WidgetProps {
  span: number;
}
