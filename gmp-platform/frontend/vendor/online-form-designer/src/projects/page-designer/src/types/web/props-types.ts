import { LowCodeWidget, validateRule } from '../widget-basic-types';
import { SearchWidgets } from './search-widget-types';
import {
  DateRangeEnums,
  CURRENCY_ENUM,
  TIMETYPE_ENUM,
  DisplayEnums,
  ButtonColorType,
  ButtonColorTheme,
  COLUMNS_TYPE,
  ButtonStyle,
  SUB_TABLE_EDIT_MODE,
  tabsTypeENUM,
  sortTypeEnum,
  BindCmpStyleEnum,
  fixedAlignENUM,
  operateSysEnums,
  TableSearchTypeEnum,
  SUB_TABLE_OPE_EVENT_TYPE,
  TableEditingMethodEnum,
  ButtonSize,
  DatasourceTypeEnum,
  RowSelectionTypeEnums,
} from '/@page-designer/enum';
import { AGLINE_ENUMS } from '@/enums/designEnum';
import { FIELD_TYPE, selectionTypeEnums } from '/@/enums/appEnum';
import { LowCodeModal } from '../modal-types';
import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
import {
  PrintModeEnums,
  TableTypeEnum,
  KeyMode,
  TransactionMode,
  ResetRuleType,
  ButtonOpeEnum,
  openWindowEnums,
  CARD_TRIGGER_ENUM,
} from '@gct/runtime';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';

export interface SwitchProps extends LowCodeWidget.FormItemProps {
  checkedChildren?: string;
  unCheckedChildren?: string;
  modelKey: string;
  fieldType?: FIELD_TYPE.BOOLEAN;
}

export interface UserProps extends LowCodeWidget.FormItemProps {
  /**默认当前用户 */
  defaultMain?: FieldSysVarDefaultValueEnum;
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
export interface DeptProps extends LowCodeWidget.FormItemProps {
  /**默认当前用户部门 */
  defaultMain?: FieldSysVarDefaultValueEnum;
  /**可清空 */
  clearable: boolean;
  /**选择方式 */
  selectType: BindCmpStyleEnum;
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.ORG | FIELD_TYPE.ORG_MULTI;
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
  selectOption: any;
}
export interface SignatureProps extends LowCodeWidget.FormItemProps {
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.SIGNATURE;
  signatureType: string | undefined;
  multiple: boolean;
  displayMaxNum?: number;
  displayStyle: string | undefined;
}
export interface TmplTreeSelectProps extends LowCodeWidget.FormItemProps {
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.ONLINE_FORM_TEMPLATE | FIELD_TYPE.E_DHR_TEMPLATE;
  multiple?: boolean;
  clearable?: boolean;
  /**是否过滤表单类型 */
  isFilterFormType: boolean;
  /**表单类型列表 */
  formTypeList: string[];
}
export interface OnlineFormProps extends LowCodeWidget.FormItemProps {
  /**
   * 字段类型
   */
  // fieldType?: FIELD_TYPE.ONLINE_FORM;
  /**关联模版方式 */
  templateRefType: TransactionMode;
  /**关联表单模版字段 */
  refField: string;
  /**关联关系配置 */
  ruleConfig: any;
}
export interface TreeSelectProps extends LowCodeWidget.FormItemProps {
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.ONLINE_FORM_TEMPLATE;
  multiple: boolean;
  /**搜索 */
  showSearch: boolean /**搜索字段 */;
}
export interface RangeUserProps extends LowCodeWidget.FormItemProps {
  /**可清空 */
  clearable: boolean;
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.RANGE_USER;
  modelKey: string;
  multiple: boolean;
}

export interface DateTimeProps extends LowCodeWidget.FormItemProps {
  /**默认系统日期 */
  defaultSysDate?: FieldSysVarDefaultValueEnum;
  separator: string;
  /**可清空 */
  clearable: boolean;
  /**日期类型 */
  format: string;
  /**组件类型 */
  dateType: 'YYYY HH' | 'YYYY-MM HH:mm' | 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD';
  startDate: string;
  endDate: string;
  /**日期范围 */
  range?: keyof typeof DateRangeEnums;
}
export interface DateProps extends LowCodeWidget.FormItemProps {
  /**默认系统日期 */
  defaultSysDate?: FieldSysVarDefaultValueEnum;
  separator: string;
  /**可清空 */
  clearable: boolean;
  /**日期类型 */
  format: string;
  /**组件类型 */
  dateType: 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD';
  startDate: string;
  endDate: string;
  /**日期范围 */
  range?: keyof typeof DateRangeEnums;
}
export interface TimeProps extends LowCodeWidget.FormItemProps {
  /**默认系统日期 */
  defaultSysDate?: FieldSysVarDefaultValueEnum;
  /**可清空 */
  clearable: boolean;
  /**日期类型 */
  format: string;
  /**组件类型 */
  timeType: 'HH:mm:ss' | 'HH:mm' | 'HH';
  startDate: string;
  endDate: string;
  /**日期范围 */
  range?: keyof typeof DateRangeEnums;
}
export interface MoneyProps extends LowCodeWidget.FormItemProps {
  /**最大值 */
  maxValue?: number;
  /**最大值表达式 */
  maxValueExpression?: string;
  minValue?: number;
  minValueExpression?: string;
  /**精度 */
  precision: number;
  /**千分位 */
  separator: boolean;
  /**币种 */
  currency: CURRENCY_ENUM;
  /**获取焦点 */
  getFocus: boolean;
  fieldType?: FIELD_TYPE.DECIMAL | FIELD_TYPE.INTEGER | FIELD_TYPE.LONG;
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
  /** 数字显示事件类型 */
  displayTimeType: TIMETYPE_ENUM;
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
  /** 数字显示事件类型 */
  displayTimeType: TIMETYPE_ENUM;
}

export interface RadioProps extends LowCodeWidget.FormItemProps {
  /**
   * 字段类型
   */
  fieldType?: FIELD_TYPE.ENUM | FIELD_TYPE.ENUM_MULTI | FIELD_TYPE.REF | FIELD_TYPE.REF_MULTI;
  modelKey: string;
  multiple?: boolean;
  refModelType: EntityModelTypeEnum;
  /** 自定义枚举值标识 */
  customMenu: boolean;
  /** 自定义枚举值选项值 */
  customMenuFilter: string[] | number[] | boolean[];
}

export interface SelectProps extends LowCodeWidget.FormItemProps {
  /**关联的rdo 标识key  关联rdo模型才有 */
  rdoUniqueFieldKey?: string;
  multiple: boolean;
  /**
   * 字段类型
   */
  fieldType?:
    | FIELD_TYPE.ENUM
    | FIELD_TYPE.ENUM_MULTI
    | FIELD_TYPE.REF
    | FIELD_TYPE.REF_MULTI
    | FIELD_TYPE.RDO_REF
    | FIELD_TYPE.MESSAGE_TMPL
    | FIELD_TYPE.ASSOCIATED_PRIMARY_KEY;
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
  initNotLoad?: Boolean;
  /** 初始化加载 */
  initLoad: boolean;
  /** rdo默认选中版本*/
  rdoVersion?: boolean;
  /**自定义数据源 */
  customdataSource: boolean;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  /** 自定义枚举值标识 */
  customMenu: boolean;
  /** 自定义枚举值选项值 */
  customMenuFilter: string[] | number[] | boolean[];
  /** 自定义枚举值选项 */
  customMenuOptions: { label: string; value: string }[];
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
  linkageField?: {
    label: string;
    modelKey: string;
    modelCategory: string;
    refModelKey: string;
    refModelCategory: string;
    value: string;
    end?: boolean;
    reverse?: boolean;
  }[];
  /**显示字段 */
  displayFields?: string[];
  /**卡片显示 */
  refCard?: boolean;
  /**卡片id */
  refCardId?: string;
  /**触发方式 */
  cardTrigger?: CARD_TRIGGER_ENUM;
  /** 无数据提示 */
  emptyText?: string;
}

export interface TransactionProps extends LowCodeWidget.FormItemProps {
  multiple: boolean;
  /** 自定义字段值 */
  customFieldFilter: string[];
}

export interface InputProps extends LowCodeWidget.FormItemProps {
  /** 长度限制-最小值 */
  minlength?: number;
  /** 长度限制-最大值 */
  maxlength?: number;
  /**搜索提示 */
  searchTooltip: boolean;
}

export interface UploadFileProps extends LowCodeWidget.FormItemProps {
  /** 文件模板 */
  template: string;
  /** 拖拽上传 */
  dragger: boolean;
  modelKey: string;
  maxSize: number;
  maxCount: number;
  displayType?: 'concise' | 'more';
  /**
   * 自动填充配置
   */
  enableAutofill: boolean;
  autofillRules: {
    fromField: string;
    toField: string;
  }[];
  /** 最大显示个数 */
  displayMaxNum: number;
}
export interface FormProcessProps extends FormProps {
  /**流程id */
  processId: string;
}
export interface ApprovalHistoryProps extends LowCodeWidget.WidgetProps {
  refForm?: string;
  title?: string;
  showTitle?: boolean;
  compType: 'steps' | 'table';
  showOpinion?: boolean;
  showSignature?: boolean;
  /**流程id */
  processId: string;
}
export interface FlowDiagramProps extends LowCodeWidget.WidgetProps {
  refForm?: string;
  /**流程id */
  processId: string;
}
export interface FormProps extends LowCodeWidget.WidgetProps {
  model?: string;
  layout: 'horizontal' | 'vertical';
  /**自定义字段集合 */
  customFieldList?: any[];
  /**父模型字段选择 */
  parentModelSelection: boolean;
  /**
   * 父模型字段key
   */
  refParentModelkey: string;
  readonly?: boolean;
  validateRule?: validateRule[];
  /**名称支持宽度配置*/
  hasLabelWidth?: boolean;
  /**名称显示类型*/
  labelType?: string;
  /**名称显示宽度*/
  labelWidth?: string | number;
  /**名称显示样式*/
  overLabelDisplay?: string;
}
export interface DescriptionsProps extends LowCodeWidget.WidgetProps {
  model?: string;
  layout: 'horizontal' | 'vertical';
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
export interface SearchProps extends LowCodeWidget.WidgetProps {
  model?: string;
  /**查询字段配置信息 */
  fieldWidgets: SearchWidgets[];
  /**最多显示个数 */
  maxLength: number;
  /**单行显示个数 */
  rowLength: number;
  /**对其方式 */
  alignment: Exclude<AGLINE_ENUMS, AGLINE_ENUMS.BETWEEN>;
  /**自定义搜索规则 */
  exp: string;
  /**自定义搜索条件 */
  customHeader: boolean;
}
export interface RefDataTableProps extends DataTableProps {
  /**关联字段 */
  refField: string;
  /**关联类型 */
  refType: 'form';
  refForm: string;
}

export interface treeTableProps extends LowCodeWidget.WidgetProps {
  model: string;
  /**关联搜素 */
  refSearch: string;
  rowSelection?: boolean;
  /**选择方式 */
  rowSelectionType?: selectionTypeEnums;
  /**刷新当前 */
  currentReload?: boolean;
  /**自定义搜索条件 */
  customHeader?: boolean;
  /**全屏 */
  fullScreen?: boolean;
  /**操作 */
  showOperate?: boolean;
  /**初始化加载 */
  initializeLoad: boolean;
  /**排序字段 */
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
  /**
   * 行拖拽
   */
  rowdraggable: boolean;
  /**表格序号 */
  serialNumber: boolean;
  /**默认展开层级 */
  defaultExpandLevel: number;
  /**编辑方式 */
  editMethods?: TableEditingMethodEnum;
  /**按钮可见数量 */
  visibleButtons: number;
  /** 行高模式 */
  cellHeightMode?: string;
  /** 当行高模式为 */
  cellHeight?: number;
  /** 表格头行高模式，等同适配行高模式 */
  cellHeaderHeightSync?: boolean;
}
export interface DataTableProps extends LowCodeWidget.WidgetProps {
  model: string;
  searchType?: TableSearchTypeEnum;
  /**关联搜素 */
  refSearch: string;
  /**自定义搜索规则 */
  exp: string;
  showPagination?: boolean;
  pageSize: number;
  // 表头排序功能，默认关闭
  headerSort?: boolean;
  rowSelection?: boolean;
  /**选择方式 */
  rowSelectionType?: selectionTypeEnums;
  /**整行选中 */
  selectTheEntireRow?: boolean;
  // /**统计 */
  // statistical: boolean;
  // /**统计方式 */
  // statisticalMethod: StatisticalMethodEnums;
  /**刷新当前 */
  currentReload?: boolean;
  /**自定义搜索条件 */
  customHeader?: boolean;
  /**全屏 */
  fullScreen?: boolean;
  /**操作 */
  showOperate?: boolean;
  /**排序规则 */
  // collation: { field: string; value: 'asc' | 'desc' | '' }[];
  /**初始化加载 */
  initializeLoad: boolean;
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
  /**
   * 行拖拽
   */
  rowdraggable: boolean;
  /**斑马线 */
  stripe: boolean;
  /**编辑方式 */
  editMethods: TableEditingMethodEnum;
  /**表格序号 */
  serialNumber: boolean;
  /**按钮可见数量 */
  visibleButtons: number;
  /**数据源类型  实时数据，默认数据*/
  datasourceType: DatasourceTypeEnum;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  /**自定义数据源 */
  customdataSource: boolean;
  /**删除编辑不提交数据库 */
  doNotSubmit?: boolean;
  // 是否启用排产试算按钮
  productionScheduling?: boolean;
  // 排产试算排序字段信息
  productionSchedulingSort?: IData[];
  gridType: TableTypeEnum;
  subModelField?: string;
  /**多级表头 */
  levelHeaderGrouping?: string[];
  /**多级表头开关 */
  multiLevelHeader?: boolean;
  /** 行高模式 */
  cellHeightMode?: string;
  /** 当行高模式为 */
  cellHeight?: number;
  /** 表格头行高模式，等同适配行高模式 */
  cellHeaderHeightSync?: boolean;
}

export type SubDataTableProps = DataTableProps;

export interface ColumnTableProps extends LowCodeWidget.FormItemProps {
  /**对其方式 */
  fixedAlign?: fixedAlignENUM;
  /**是否有搜索框 */
  showSearch?: boolean;
  fieldName?: string;
  returnType?: FIELD_TYPE;
  /**是否支持内嵌 */
  embeddedSearch?: boolean;
}

export interface CustomCodeProps extends LowCodeWidget.WidgetProps {
  code?: string;
  runtimeCode: string;
}
export interface OperateProps extends LowCodeWidget.WidgetProps {
  model: string;
  label: string;
  /**可见按钮数量 */
  visibleButtons: number;
  fixedAlign: fixedAlignENUM;
}

export interface FormulaProps extends LowCodeWidget.WidgetProps {
  model: string;
  label: string;
  // fixedAlign: fixedAlignENUM;
  formula: string;
  remark: string;
  /**字段key */
  field: string;
  /**字段类型 */
  fieldType: string;
  truelabel: string;
  falselabel: string;
  digits: number;
  showSearch: boolean;
  readonly: boolean;
  fieldReadonly: boolean;
  returnType: string;
  bindCompStyleType: string;
  /**公式描述*/
  expression: string;
  /**是否生成二维码*/
  showQrCode: boolean;
}
export interface OperateButtonProps extends LowCodeWidget.WidgetProps {
  buttonTheme: ButtonColorTheme;
  buttonType: ButtonColorType;
  icon: string;
  label: string;
  /**二次确认 */
  confirm: boolean;
  confirmText: string;
  /**显示条件 */
  displayRule: string;
  /**内置事件 */
  innerEvent?: boolean;
  /**系统事件类型 */
  sysMethedType?: operateSysEnums;
  linkPage?: string;
  /**事件名称 */
  eventName?: string;
  /**SubTable事件类型 */
  subTableEventType?: SUB_TABLE_OPE_EVENT_TYPE;
  /**自建事件-内置事件 */
  events?: object;
  enableCustomColor: boolean;
  backgroundColor?: string;
  fontColor?: string;
  /**关联的表单 */
  refForm?: string;
  /**关联的模态框 */
  refModal?: string;
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
  showFieldExp?: boolean;
  showFieldExpVal?: string;
}
export interface ButtonProcessContainerProps extends ButtonContainerProps {
  /**关联的流程标签 */
  refForm: string;
  /**流程id */
  processId: string;
}
export interface ButtonContainerProps extends LowCodeWidget.WidgetProps {
  //**按钮样式 */
  buttonStyle: ButtonStyle;
  /**对齐方式 */
  align: AGLINE_ENUMS;
  /**间距 */
  margin: number;
  /**尺寸 */
  size: ButtonSize;
  /**所属模型 */
  model?: string;
}
export interface ButtonBasicProps {
  disabled: boolean;
  buttonTheme: ButtonColorTheme;
  buttonType: ButtonColorType;
  icon: string;
  iconColor: string;
  //**按钮样式 */
  buttonStyle: ButtonStyle;
  /**开启二次确认 */
  confirm: boolean;
  /**二次确认内容 */
  confirmText: string;
  enableCustomColor: boolean;
  backgroundColor: string;
  fontColor: string;
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
  processId: string;
  refForm: string;
}
export interface ResetButtonProps extends BaseButtonProps {
  resetRule: ResetRuleType;
}
export interface TableApproveButtonProps extends BaseButtonProps {
  /**打开方式 */
  openType: openWindowEnums;
}
export interface LabelPrintProps extends BaseButtonProps {
  /**打印方式 */
  printMode: PrintModeEnums;
  /**打印模版key 或者模版的引用类型 */
  printKey: string | TransactionMode;
  /**打印服务key */
  serverKey: string;
  /**关联模型 */
  refModel: string;
  /**标签模版类型 */
  labelMode: KeyMode;
  /**打印机类型 */
  printType: KeyMode;
  /**打印key */
  printVal: string;
  /**网络打印机类型 或者打印机id*/
  printRefType: string | TransactionMode;
  /**引用关系配置 */
  ruleConfig: any;
  /**打印机的关联配置 */
  printRuleConfig: any;
  /**打印字段 */
  printField?: string;
  /**关联的表单 */
  refForm?: string;
}
export interface DocumentPrintProps extends BaseButtonProps {
  /**单据模板值 */
  documentKey: string | TransactionMode;
  /**打印方式 */
  printMode: PrintModeEnums;
  refModel?: string;
  /**模版规则 */
  documentType: KeyMode;
  /**连接规则 */
  ruleConfig: any;
  /** 打印字段 */
  printField: string;
}
export interface ExportProps extends BaseButtonProps {
  model: string;
  templateKey: string;
  timeout: number;
  /**关联表格 */
  refTable?: string;
  batchImport?: boolean;
}
export interface ButtonProps extends LowCodeWidget.WidgetProps {
  title: string;
  /**
   * 关联表单
   */
  refForm?: string;
  /**
   * 关联列表
   */
  refList?: string;
  basic: ButtonBasicProps;
}
export interface BaseButtonProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  refForm?: string;
  /**关联弹框 */
  refModal?: string;
  /**
   * 关联列表
   */
  refList?: string;
  /**标题 */
  title: string;
  /**二次确认 */
  confirm?: boolean;
  confirmText?: string;
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
  size: ButtonSize;
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
  //**按钮样式 */
  buttonStyle?: ButtonStyle;
  enableCustomColor: boolean;
  backgroundColor?: string;
  fontColor?: string;
  /**复制按钮需要排除的字段 */
  excludeField?: string[];
  /**按钮所在位置 */
  pos?: ButtonOpeEnum;
  /**将当前按钮的名称同步为弹框标题 */
  syncBtnNameToModal?: boolean;
}

export interface TabPaneProps extends LowCodeWidget.WidgetProps {
  title: string;
  forceRender: boolean;
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

export interface LayoutProps extends LowCodeWidget.WidgetProps {
  name: string;
  /**布局方式 */
  layoutDisplay: DisplayEnums;
  /**对齐方式 */
  textAlign: Exclude<AGLINE_ENUMS, AGLINE_ENUMS.BETWEEN>;
  /**主轴方向 */
  mainAxios: string;
  /**横轴对对齐方式*/
  justifyContent: string;
  /**纵轴对对齐方式*/
  alignItems: string;
  /**间距 */
  margin: number;
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
export interface ColumnsProps extends LowCodeWidget.WidgetProps {
  rowresize?: boolean;
  rowputAway?: boolean;
  rowwidth?: number;
  rowtype?: COLUMNS_TYPE;
  defaultRowputAway?: boolean;
  columnresize?: boolean;
  columnputAway?: boolean;
  columnheight?: number;
  columntype?: COLUMNS_TYPE;
  defaultColumnputAway?: boolean;
}

export interface SubTableProps extends LowCodeWidget.FormItemProps {
  /**编辑模式 */
  editMode: SUB_TABLE_EDIT_MODE;
  /**主表关联的子表的modelKey */
  bindModelKey: string;
  fieldType?: FIELD_TYPE.MASTERSLAVE;
  /**是否开启行拖拽 */
  rowdraggable: boolean;
  /**表格行内编辑方式 */
  editMethods: TableEditingMethodEnum;
  /**子表行数限制 */
  rowLimitOpen: boolean;
  rowLimit: number;
  /** 可见按钮数量 */
  visibleButtons?: number;
  /**显示序号 */
  serialNumber: boolean;
  /**主表上生成的关联字段 */
  refMasterId: string;
  /**自定义数据源 */
  customdataSource: boolean;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  /** 字段是否同步 */
  isFieldAsync: boolean;
  /** 子表form id */
  bindSubTableFormId: string;
  /**自定义规则 */
  validateRule: validateRule[];
  // 是否显示分页
  showPagination: boolean;
  // 拖拽排序
  rowDragSort?: boolean;
  // 分页数量
  pageSize: number;
  // 是否开启表头排序功能
  headerSort?: boolean;
  /**排序字段 */
  collation: { collationField: string; collationSort: sortTypeEnum }[];
  layout: {
    label: 'left';
    inputBg: false;
    inputAlign: 'right';
  };
  /**名称支持宽度配置*/
  hasLabelWidth?: boolean;
  /**名称显示类型*/
  labelType?: string;
  /**名称显示宽度*/
  labelWidth?: string | number;
  /**名称显示样式*/
  overLabelDisplay?: string;
  /**是否是树形结构 */
  isTree?: boolean;
  /** 行高模式 */
  cellHeightMode?: string;
  /** 当行高模式为 */
  cellHeight?: number;
  /** 表格头行高模式，等同适配行高模式 */
  cellHeaderHeightSync?: boolean;
}
export interface DynamicTableProps extends LowCodeWidget.FormItemProps {
  /**编辑模式 */
  editMode: SUB_TABLE_EDIT_MODE;
  /**关联的modelKey */
  bindModelKey: string;
  fieldType?: FIELD_TYPE.MASTERSLAVE;
  /**表格行内编辑方式 */
  editMethods: TableEditingMethodEnum;
  /**子表行数限制 */
  rowLimitOpen: boolean;
  rowLimit: number;
  /** 可见按钮数量 */
  visibleButtons?: number;
  /**显示序号 */
  serialNumber: boolean;
  /**主表上生成的关联字段 */
  refMasterId: string;
  /**自定义数据源 */
  customdataSource: boolean;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  /** 字段是否同步 */
  isFieldAsync: boolean;
  /** 子表form id */
  bindSubTableFormId: string;
  // 表头排序功能
  headerSort?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}
export interface WorkflowNodesProps extends LowCodeWidget.FormItemProps {
  /**主表关联的子表的modelKey */
  bindModelKey: string;
  /**子表自带的模态框 */
  specModalInfo: LowCodeModal.Modal | undefined;
  workflowModalInfo: LowCodeModal.Modal | undefined;
  fieldType?: FIELD_TYPE.MASTERSLAVE;
}
export interface ReadonlyCmpProps extends LowCodeWidget.FormItemProps {
  fieldType?: FIELD_TYPE;
  fixedAlign?: fixedAlignENUM;
}
export interface CustomFieldProps extends LowCodeWidget.FormItemProps {
  fieldType?: FIELD_TYPE;
}

export interface TableSelectProps extends LowCodeWidget.WidgetProps {
  search: boolean;
  model?: string;
  showPagination: boolean;
  pageSize: number;
  /**排序字段 */
  collation: { collationField?: string; collationSort: sortTypeEnum }[];
  datafilter: { key: string; value: string }[] | { dataRule: string; dataRuleConfig: string };
  index: boolean;
  rowSelectionType: RowSelectionTypeEnums;
  /**默认不加载 */
  initNotLoad?: boolean;
  /**默认加载 */
  initLoad: boolean;
  /**父模型字段选择 */
  parentModelSelection: boolean;
  /**
   * 父模型字段key
   */
  refParentModelkey: string;
  /**自定义数据源 */
  customdataSource: boolean;
  /**数据源配置 */
  datasourceConfig: LowCodeWidget.JsEvent | null;
  /** 行高模式 */
  cellHeightMode?: string;
  /** 当行高模式为 */
  cellHeight?: number;
  /** 表格头行高模式，等同适配行高模式 */
  cellHeaderHeightSync?: boolean;
}

export interface GenRadioProps extends LowCodeWidget.WidgetProps {
  title: string;
  defaultValue: string;
  /**选项卡配置 */
  options?: Array<any>;
  /**默认选择 */
  checked?: string | Array<any>;
  disabled: boolean;
  displayLabelText: boolean;
}

export interface GenSwitchProps extends LowCodeWidget.WidgetProps {
  label: string;
  defaultValue: boolean;
  truelabel: string;
  falselabel: string;
  bindCompStyleType: string;
  fieldType: string;
  disabled: boolean;
  displayLabelText: boolean;
}
export interface EsopProps extends LowCodeWidget.FormItemProps {
  /** 拖拽上传 */
  dragger: boolean;
  modelKey: string;
  enableAutofill: boolean;
  autofillRules: {
    fromField: string;
    toField: string;
  }[];
}

export interface ExpressionProps extends LowCodeWidget.FormItemProps {
  /** 返回值类型 */
  returnType: string;
  /**精度 */
  precision: number;
  /**千分位 */
  separator: boolean;
  /**币种 */
  currency: CURRENCY_ENUM;
  /** 显示币种开关 */
  displayCurrency: boolean;
  /** 数字显示事件类型 */
  displayTimeType: TIMETYPE_ENUM;
  /** 是否实时计算 */
  isRealCompute: boolean;
  /**关联关系配置 */
  ruleConfig: any;
  /**公式引用值 */
  expType: string;
  truelabel: string;
  falselabel: string;
}

export interface AggProps extends LowCodeWidget.FormItemProps {
  /** 返回值类型 */
  returnType: string;
  /**精度 */
  precision: number;
  /**千分位 */
  separator?: boolean | string;
  /**币种 */
  currency: CURRENCY_ENUM;
  /** 显示币种开关 */
  displayCurrency: boolean;

  /**日期类型 */
  format?: string;
  /**组件类型 */
  dateType?:
    | 'YYYY HH'
    | 'YYYY-MM HH:mm'
    | 'YYYY-MM-DD HH:mm:ss'
    | 'YYYY'
    | 'YYYY-MM'
    | 'YYYY-MM-DD';
  /**组件类型 */
  timeType?: 'HH:mm:ss' | 'HH:mm' | 'HH';
  /** 数字显示事件类型 */
  displayTimeType: TIMETYPE_ENUM;
}

export interface SerialRuleProps extends LowCodeWidget.FormItemProps {
  config: string;
  increaseHidden?: boolean;
}

export interface SelectSearchProps extends LowCodeWidget.WidgetProps {
  model?: string;
  /**多选 */
  multiple?: boolean;
  /** 快速搜索字段 */
  quickSearchFields: Array<any>;
  /**搜索结果字段 */
  searchResultFields: Array<any>;
  /**暗提示 */
  placeholder?: string;
}
export interface CollapseProps extends LowCodeWidget.WidgetProps {
  title: string;
  icon: string;
  color: string;
  isSupportFold: string;
  defaultFold: boolean;
  titleChildren: Array<any>;
}

export interface SpaceOccupationProps extends LowCodeWidget.WidgetProps {
  title: string;
  height: number;
}

export interface DividerProps extends LowCodeWidget.WidgetProps {
  title: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  borderColor: string;
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
  displayLabelText: boolean;
}

export interface IframeProps extends LowCodeWidget.WidgetProps {
  title: string;
  /** iframe路径*/
  iframeUrl: string;
}

export interface BizProcessProps extends LowCodeWidget.FormItemProps {
  showPreview?: boolean;
}
export type ApprovalProcessProps = LowCodeWidget.FormItemProps;
