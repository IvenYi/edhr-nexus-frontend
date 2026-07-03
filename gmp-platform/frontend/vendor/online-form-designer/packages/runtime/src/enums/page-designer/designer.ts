import { FIELD_TYPE } from '../appEnum';

export enum SCOPE {
  PAGE = 'page',
  MODAL = 'modal',
}

export enum FormComponents {
  RdoInput = 'rdo-input',
  Input = 'input',
  ElectronicSignature = 'electronic-signature',
  UseinfoButton = 'useinfo-button',
  ModelingButton = 'modeling-button',
  ImportButton = 'gc-import-button',
  ExportButton = 'gc-export-button',
  DocumentPrintButton = 'document-print-button',
  SubmitButton = 'submit-button',
  BatchDeleteButton = 'batchdelete-button',
  CustomButton = 'custom-button',
  TableLinkButton = 'table-link-button',
  TableInfoButton = 'table-info-button',
  TableApproveButton = 'table-approve-button',
  OpeButton = 'ope-button',
  ResetButton = 'reset-button',
  RdoSaveButton = 'rdo-save-button',
  LabelPrintButton = 'labelprint-button',
  ProcessButton = 'process-button',
  ProcessApproveButton = 'process-approve-button',
  CreateButton = 'create-button',
  DeleteButton = 'delete-button',
  CopyButton = 'copy-button',
  RefreshButton = 'refresh-button',
  CreateVersionButton = 'create-version-button',
  CopyVersionButton = 'copy-version-button',
  Checkbox = 'checkbox',
  DataTable = 'data-table',
  DataVTable = 'data-v-table',
  TreeTable = 'tree-table',
  DataTableColumn = 'data-table-column',
  RefDataTable = 'ref-data-table',
  DataList = 'data-list',
  RdoDataList = 'rdo-data-list',
  DataTableOpe = 'data-table-ope',
  DataTableFormula = 'data-table-formula',
  Datepicker = 'datepicker',
  DateTimepicker = 'datetimepicker',
  Department = 'department',
  Form = 'form',
  RdoForm = 'rdo-form',
  RdoTable = 'rdo-table',
  MedProRdoForm = 'medprordo-form',
  MedProRdoTable = 'medprordo-table',
  FormProcess = 'form-process',
  // RdoForm = 'medprordo-form',
  // RdoTable = 'medprordo-table',
  Inputmoney = 'inputmoney',
  Inputnumber = 'inputnumber',
  InputDouble = 'inputdouble',
  Radio = 'radio',
  Select = 'select',
  RdoSelect = 'rdo-select',
  Switch = 'switch',
  Textarea = 'textarea',
  Timepicker = 'timepicker',
  Userpicker = 'userpicker',
  Search = 'search',
  SelectSearch = 'select-search',
  QuickSearch = 'quick-search',
  LayoutContainer = 'layout-container',
  ButtonContainer = 'button-container',
  ButtonProcessContainer = 'button-process-container',
  BottomButtonContainer = 'bottom-button-container',
  Grid = 'grid',
  GridCol = 'grid-col',
  Tabs = 'tabs',
  TabPane = 'tab-pane',
  LeftRightColumns = 'left-right-columns',
  TopBottomColumns = 'top-bottom-columns',
  LeftLayoutThree = 'left-layout-three',
  TopLayoutThree = 'top-layout-three',
  UploadFile = 'upload-file',
  UploadImage = 'upload-image',
  SubTable = 'sub-table',
  SubTableOpe = 'sub-table-ope',
  SubTableAddBtn = 'sub-table-add-button',
  SubTableCopyBtn = 'sub-table-copy-button',
  SubTableEditBtn = 'sub-table-edit-button',
  SubTableDeleteBtn = 'sub-table-delete-button',
  LinkPageBtn = 'link-page-button',
  Collapse = 'collapse',
  SpaceOccupation = 'space-occupation',
  Divider = 'divider',
  CardList = 'card-list',
  CardHeaderLeft = 'card-header-left',
  CardHeaderRight = 'card-header-right',
  CardContent = 'card-content',
  CardOpeBtn = 'card-ope-btn',
  BaseButton = 'base-button',
  ReadonlyCmp = 'readonlycmp',
  TableSelect = 'table-select',
  GenCheckbox = 'gen-checkbox',
  GenRadio = 'gen-radio',
  GenSwitch = 'gen-switch',
  WorkflowNodes = 'workflow-nodes',
  WorkflowNodeModal = 'workflow-node-modal',
  ESOP = 'e-sop',
  /** 公式 */
  EXPRESSION = 'expression',
  /** 公式条件 */
  ExpressionCondition = 'expression-condition',
  /** 汇总 */
  AGG = 'agg',
  DynamicFormType = 'dynamic-form-type',
  DynamicFormValue = 'dynamic-form-value',
  DynamicFormOpts = 'dynamic-form-options',
  DynamicFormShowType = 'dynamic-form-show-type',
  DynamicTable = 'dynamic-table',
  Transaction = 'transaction',
  SerialRule = 'serial-rule',
  LabelTemplate = 'label-template',
  LabelTemplateRef = 'label-template-ref',
  DocumentTemplate = 'document-template',
  Wacom = 'wacom',
  Text = 'text',
  CustomField = 'custom-field',
  Printer = 'printer',
  Descriptions = 'descriptions',
  RangeUser = 'range-user',
  GenImage = 'gen-image',
  TestButton = 'test-button',
  Iframe = 'iframe',
  ExcuteButton = 'medproexcute-button',
  SubDataTable = 'sub-data-table',
  Signature = 'signature',
  OnlineForm = 'online-form',
  TmplTreeSelect = 'tmpl-tree-select',
  Boolean = 'boolean',
  BizProcess = 'biz-process',
  ApprovalHistory = 'approval-history',
  FlowDiagram = 'flow-diagram',
  CustomCode = 'custom-code',
  ApprovalProcess = 'approval-process',
  DropdownButton = 'dropdown-button',
}

export enum SearchComponents {
  SearchInput = 'SearchInput',
  SearchNumberInput = 'SearchNumberInput',
  SearchStringNumberInput = 'SearchStringNumberInput',
  SearchSwitch = 'SearchSwitch',
  SearchDate = 'SearchDate',
  SearchDateTime = 'SearchDateTime',
  SearchTime = 'SearchTime',
  SearchSelect = 'SearchSelect',
  SearchUserSelect = 'SearchUserSelect',
  SearchRdoSelect = 'SearchRdoSelect',
  SearchTransaction = 'SearchTransaction',
  SearchTmplTreeSelect = 'SearchTmplTreeSelect',
  SearchPrinter = 'SearchPrinter',
  SearchBizProcess = 'SearchBizProcess',
  SearchSelectRangUser = 'SearchSelectRangUser',
  SearchSelectDepartment = 'SearchSelectDepartment',
}
//列宽配置
export enum tableColumnWidthEnum {
  /**适配父容器 */
  AUTO_PARENT_BOX = 'AutoParentBox',
  /**自适应  展示所有*/
  ATUO = 'selfAdaption',
  /**固定 */
  ENUMERATION = 'fixed',
  /**百分比 */
  PERCENTAGE = 'percentage',
}

// 空值定义;
export enum controlConfigEnum {
  NULL = 'NULL',
  STRING = '空字符串',
  ZERO = '0',
}
// 统计方式;
export enum statisticalMethodEnum {
  TOTAL = 'total',
  AVERAGE = 'average',
}

//
export enum fixedAlignENUM {
  RIGHT = 'right',
  NONE = '',
  LEFT = 'left',
}

// table 列字段类型
export enum tableColumnTypeEnum {
  COLUMN_TEXT = 'COLUMN_TEXT',
  COLUMN_NUMBER = 'COLUMN_NUMBER',
  COLUMNTEXT_DATA = 'COLUMNTEXT_DATA',
  COLUMNTEXT_REF = 'COLUMNTEXT_REF',
  COLUMNTEXT_ENUM = 'COLUMNTEXT_ENUM',
  COLUMNTEXT_ORG = 'COLUMNTEXT_ORG',
  COLUMNTEXT_USER = 'COLUMNTEXT_USER',
  COLUMNTEXT_BOOLEAN = 'COLUMNTEXT_BOOLEAN',
  COLUMNTEXT_IMAGE = 'COLUMNTEXT_IMAGE',
}

//
export enum tabsTypeENUM {
  LINE = 'line',
  CARD = 'card',
  TEXt = 'text',
  CAPSULE = 'capsule',
  CUSTOM = 'custom',
}

export enum sortTypeEnum {
  ASC = 'asc',
  DESC = 'desc',
}

/** 组件类型下拉框枚举 */
export enum BindCmpStyleEnum {
  /** 单行文本 */
  CMP_TEXT = 'TEXT',
  /** 多行文本 */
  CMP_TEXTAREA = 'TEXTAREA',
  /** 电子签名 */
  CMP_ELECTRONICSIGNATURE = 'ELECTRONICSIGNATURE',
  /** 开关 */
  CMP_BOOLEAN = 'BOOLEAN',
  /** 下拉列表 */
  CMP_SELECT_LIST = 'SELECT_LIST',
  /** 单选框 */
  CMP_RADIO = 'RADIO',
  /** 多选框 */
  CMP_CHECKBOX = 'CHECKBOX',
  /** 下拉选择 */
  CMP_DROPDOWN_SELECT = 'dropdownSelection',
  /** 模态框 */
  CMP_MODAL = 'modalBoxSelection',
  /** 树形选择 */
  CMP_TREE_SELECTION = 'treeSelection',
  /** 数值 */
  CMP_NUMBER = 'NUMBER',
  /** 显示币种 */
  CMP_CURRENCY = 'CURRENCY',
  /** 显示时间 */
  CMP_TIME = 'TIME',
}

/** 组件类型下拉框国际化枚举 */
export const Ch_BindCmpStyleEnum = {
  [BindCmpStyleEnum.CMP_TEXT]: 'sys.pageDesigner.bindCmpStyle.bindText',
  [BindCmpStyleEnum.CMP_TEXTAREA]: 'sys.pageDesigner.bindCmpStyle.bindTextarea',
  [BindCmpStyleEnum.CMP_ELECTRONICSIGNATURE]: 'sys.pageDesigner.bindCmpStyle.electronicSignature',
  [BindCmpStyleEnum.CMP_BOOLEAN]: 'sys.pageDesigner.bindCmpStyle.bindBoolean',
  [BindCmpStyleEnum.CMP_SELECT_LIST]: 'sys.pageDesigner.bindCmpStyle.bindSelectList',
  [BindCmpStyleEnum.CMP_RADIO]: 'sys.pageDesigner.bindCmpStyle.bindRadio',
  [BindCmpStyleEnum.CMP_CHECKBOX]: 'sys.pageDesigner.bindCmpStyle.bindCheckbox',
  [BindCmpStyleEnum.CMP_DROPDOWN_SELECT]: 'sys.pageDesigner.bindCmpStyle.bindDropdownSelect',
  [BindCmpStyleEnum.CMP_MODAL]: 'sys.pageDesigner.bindCmpStyle.bindModal',
  [BindCmpStyleEnum.CMP_TREE_SELECTION]: 'sys.pageDesigner.bindCmpStyle.bindTreeSelection',
  [BindCmpStyleEnum.CMP_NUMBER]: 'sys.pageDesigner.bindCmpStyle.bindNumber',
  [BindCmpStyleEnum.CMP_CURRENCY]: 'sys.pageDesigner.bindCmpStyle.bindCurrency',
  [BindCmpStyleEnum.CMP_TIME]: 'sys.pageDesigner.bindCmpStyle.bindTime',
};

/** 组件类型下拉框类型 */
export enum BindCmpStyleTypeEnum {
  BindText = 'bindText',
  BindLongText = 'BindLongText',
  BindBool = 'bindBool',
  BindPerson = 'bindPerson',
  BindDept = 'bindDept',
  BindLink = 'bindLink',
  BindMulti = 'bindMulti',
  BindNum = 'bindNum',
  BindDecimal = 'bindDecimal',
}

/** 组件类型下拉框类型对应组件类型 */
export const transformBindCmp2CmpType = {
  [BindCmpStyleEnum.CMP_TEXT]: FormComponents.Input,
  [BindCmpStyleEnum.CMP_TEXTAREA]: FormComponents.Textarea,
  [BindCmpStyleEnum.CMP_ELECTRONICSIGNATURE]: FormComponents.ElectronicSignature,
  [BindCmpStyleEnum.CMP_SELECT_LIST]: FormComponents.Select,
  [BindCmpStyleEnum.CMP_RADIO]: FormComponents.Radio,
  [BindCmpStyleEnum.CMP_CHECKBOX]: FormComponents.Checkbox,
};

/** 组件类型下拉框集合 */
export const bindCmpStyleMap = {
  [BindCmpStyleTypeEnum.BindText]: [BindCmpStyleEnum.CMP_TEXT, BindCmpStyleEnum.CMP_TEXTAREA],
  [BindCmpStyleTypeEnum.BindLongText]: [
    BindCmpStyleEnum.CMP_TEXT,
    BindCmpStyleEnum.CMP_TEXTAREA,
    BindCmpStyleEnum.CMP_ELECTRONICSIGNATURE,
  ],
  [BindCmpStyleTypeEnum.BindBool]: [
    BindCmpStyleEnum.CMP_BOOLEAN,
    BindCmpStyleEnum.CMP_SELECT_LIST,
    BindCmpStyleEnum.CMP_RADIO,
    BindCmpStyleEnum.CMP_CHECKBOX,
  ],
  [BindCmpStyleTypeEnum.BindPerson]: [
    BindCmpStyleEnum.CMP_DROPDOWN_SELECT,
    BindCmpStyleEnum.CMP_MODAL,
  ],
  [BindCmpStyleTypeEnum.BindDept]: [
    BindCmpStyleEnum.CMP_TREE_SELECTION,
    BindCmpStyleEnum.CMP_MODAL,
  ],
  [BindCmpStyleTypeEnum.BindLink]: [BindCmpStyleEnum.CMP_SELECT_LIST, BindCmpStyleEnum.CMP_RADIO],
  [BindCmpStyleTypeEnum.BindMulti]: [
    BindCmpStyleEnum.CMP_SELECT_LIST,
    BindCmpStyleEnum.CMP_CHECKBOX,
  ],
  [BindCmpStyleTypeEnum.BindNum]: [
    BindCmpStyleEnum.CMP_NUMBER,
    BindCmpStyleEnum.CMP_CURRENCY,
    BindCmpStyleEnum.CMP_TIME,
  ],
  [BindCmpStyleTypeEnum.BindDecimal]: [BindCmpStyleEnum.CMP_NUMBER, BindCmpStyleEnum.CMP_CURRENCY],
};

export enum buttonShowType {
  FOLD_ALL = 'foldAll',
  FOLD_PART = 'foldPart',
}

/** 支持查询的字段类型 */
export const searchListByFieldType = [
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.TEXT,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.TIME,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ORG,
  // FIELD_TYPE.MASTERSLAVE,
  // FIELD_TYPE.AGG,
  // FIELD_TYPE.EXPRESSION,
  FIELD_TYPE.SERIAL,
  FIELD_TYPE.ONLINE_FORM_TEMPLATE,
  FIELD_TYPE.E_DHR_TEMPLATE,
  FIELD_TYPE.PRINTER,
  FIELD_TYPE.LABEL_TEMPLATE_REF,
  FIELD_TYPE.Biz_Process,
  FIELD_TYPE.DOCUMENT_TEMPLATE,
  FIELD_TYPE.TRANSACTION,
  FIELD_TYPE.RANGE_USER,
  FIELD_TYPE.MESSAGE_TMPL,
];

/** mobile 支持查询的字段类型 */
export const mobileSearchListByFieldType = [
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.TEXT,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.TIME,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ORG,
  // FIELD_TYPE.MASTERSLAVE,
  // FIELD_TYPE.AGG,
  // FIELD_TYPE.EXPRESSION,
  FIELD_TYPE.SERIAL,
  FIELD_TYPE.ONLINE_FORM_TEMPLATE,
  FIELD_TYPE.E_DHR_TEMPLATE,
  FIELD_TYPE.PRINTER,
  FIELD_TYPE.LABEL_TEMPLATE_REF,
  FIELD_TYPE.Biz_Process,
  FIELD_TYPE.DOCUMENT_TEMPLATE,
  FIELD_TYPE.TRANSACTION,
  // FIELD_TYPE.RANGE_USER,
  FIELD_TYPE.MESSAGE_TMPL,
];

/** 支持查询的字段类型 */
export const padSearchListByFieldType = [
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.TEXT,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.TIME,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ORG,
  // FIELD_TYPE.MASTERSLAVE,
  // FIELD_TYPE.AGG,
  // FIELD_TYPE.EXPRESSION,
  FIELD_TYPE.SERIAL,
  // FIELD_TYPE.ONLINE_FORM_TEMPLATE,
  // FIELD_TYPE.E_DHR_TEMPLATE,
  FIELD_TYPE.PRINTER,
  FIELD_TYPE.LABEL_TEMPLATE_REF,
  // FIELD_TYPE.Biz_Process,
  // FIELD_TYPE.DOCUMENT_TEMPLATE,
  FIELD_TYPE.TRANSACTION,
  // FIELD_TYPE.RANGE_USER,
  // FIELD_TYPE.MESSAGE_TMPL,
];
