/**
 * @description 平台参数枚举
 * @alias INTEGRATION_PAAS_DP: 集成APAAS单据打印平台
 * @alias INTEGRATION_PAAS_SI: 集成APAAS集成平台
 */
export enum PlatformEnum {
  /** 集成APAAS单据打印平台 */
  INTEGRATION_PAAS_DP = 'INTEGRATION_PAAS_DP',
  /** 集成APAAS集成平台 */
  INTEGRATION_PAAS_SI = 'INTEGRATION_PAAS_SI',
}

/**
 * 组件所属位置
 */
export enum PosEnum {
  /** eDHR填报 */
  EDHR_FILLING = 'NCB_EDHR_FILLING',
  /** 电子放行 */
  RELEASE_FILLING = 'NCB_RELEASE_FILLING',
  /** 表单填报 */
  DOCUMENT_FILLING = 'NCB_DOCUMENT_FILLING',
  /** 表单审核 */
  DOCUMENT_TASK = 'NCB_DOCUMENT_TASK',
  /** eDHR追溯 */
  EDHR_TRACKED = 'NCB_EDHR_TRACKED',
  /** 放行记录 */
  RELEASE_LOG = 'NCB_RELEASE_LOG',
  /** 表单追溯 */
  DOCUMENT_TRACKED = 'NCB_DOCUMENT_TRACKED',
  /** 记录变更 */
  RECORD_CHANGE = 'NCB_RECORD_CHANGE',
  /** 流程干预 */
  PROCESS_INTERVENTION = 'NCB_PROCESS_INTERVENTION',
}

/** 渲染模式 */
export enum RenderModeEnum {
  /** 填报模式 */
  FormMode = 'form-mode',
  /** 查看模式 */
  ViewMode = 'view-mode',
}

/** 表单类型 */
export enum FormTypeEnum {
  /** 基础表单 */
  BASE = 'BASE',
  /** 流程表单 */
  PROCESS = 'PROCESS',
  /** 视图表单 */
  VIEW = 'VIEW',
  /** 文本表单 */
  TEXT = 'TEXT',
  /** 文件表单 */
  FILE = 'FILE',
}

/** 视图类型 */
export enum ViewTypeEnum {
  /** 视图模型（查询视图） */
  VIEW_MODEL = 'VIEW_MODEL',
  /** SQL数据视图 */
  VIEW_SQL = 'SQL',
  /** 数据库视图 */
  VIEW = 'VIEW',
  /** 自定义模型 */
  VIEW_JS = 'JS',
}

/** 组件类型枚举 */
export enum ComponentTypeEnum {
  /** 页面纸张 */
  PAPER = 'paper',
  /** 只读组件 */
  RO = 'ro',
  /** 动态行高专属 */
  DynRo = 'dynro',
  /** 子表 */
  SUB_TABLE = 'sub-table',
  /** 固定表 */
  FIXED_TABLE = 'fixed-table',

  Input = 'input',
  Textarea = 'textarea',
  Inputnumber = 'inputnumber',
  InputDouble = 'inputdouble',
  Switch = 'switch',
  UploadImage = 'upload-image',
  UploadFile = 'upload-file',
  Userpicker = 'userpicker',
  Department = 'department',
  Select = 'select',
  EnumSelect = 'enum-select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Datepicker = 'datepicker',
  DateTimepicker = 'datetimepicker',
  Timepicker = 'timepicker',
  /** 公式 */
  EXPRESSION = 'expression',
  /** 汇总 */
  AGG = 'agg',
  /** 条形码 */
  Barcode = 'barcode',
  /** 二维码 */
  Qrcode = 'qrcode',
  /** 图片 */
  Image = 'image',
  /** 签名 */
  Sign = 'sign',
  /** 表头分栏 */
  Diagonal = 'diagonal',
  /** 组合字段 */
  CombineFields = 'combine-fields',
  /** 上下限 */
  RangeLimit = 'range-limit',
  /** 线条 */
  Line = 'line',
  /** 序号 */
  Serialnumber = 'serialnumber',
  /** 动态表单-值 */
  DynValue = 'dyn-value',
  /** 追溯 */
  Trace = 'trace',
  /** 次幂 */
  Power = 'power',
  /** 时间差 */
  Timediff = 'timediff',
}

/**
 * 页面组件类型
 */
export enum PaperWidgeType {
  Text = 'text',
  Image = 'image',
  Barcode = 'barcode',
  Qrcode = 'qrcode',
  Pagination = 'pagination',
  Watermark = 'watermark',
  Diagonal = 'diagonal',
  RangeLimit = 'rangelimit',
  Line = 'line',
  Serialnumber = 'serialnumber',
  Power = 'power',
  TimeDiff = 'timediff',
}

/**
 * 空值符
 * @author lingxiaoming
 * @date 2024-06-20 05:03:12
 * @export
 * @enum {number}
 */
export enum EmptySymbol {
  '/' = '/',
  '--' = '--',
  '——' = '——',
  'NA' = 'NA',
  'N/A' = 'N/A',
  'empty' = 'empty',
  'none' = 'none',
}

/** 查看时渲染方式 */
export enum CellWidgetViewState {
  /** 文本显示 */
  Readonly = 'readonly',
  /** 组件显示-禁用 */
  Disabled = 'disabled',
  /** 组件显示-跟随设计 */
  Auto = 'auto',
}

/** 纸张大小 */
export enum PageSizeEnum {
  /** A3 */
  A3 = 'A3',
  /** A4 */
  A4 = 'A4',
  /** A5 */
  A5 = 'A5',
  /** 自定义 */
  CUSTOM = 'CUSTOM',
}

/** 单元格内容类型 */
export enum CellType {
  /** 默认 */
  Default = 'Default',
  /** 组件 */
  Widget = 'Widget',
  /** 字段 */
  Field = 'Field',
}

/** 组件类型下拉框枚举 */
export enum BindCmpStyleEnum {
  /** 单行文本 */
  CMP_TEXT = 'input',
  /** 多行文本 */
  CMP_TEXTAREA = 'textarea',
  /** 开关 */
  CMP_BOOLEAN = 'switch',
  /** 下拉列表 */
  CMP_SELECT_LIST = 'select',
  /** 单选框 */
  CMP_RADIO = 'radio',
  /** 多选框 */
  CMP_CHECKBOX = 'checkbox',
}

/** 文字前后位置 */
export enum LabelPosition {
  /**
   * 文字在前
   */
  Before = 'before',
  /**
   * 文字在后
   */
  After = 'after',
}

/** 排列方式 */
export enum Orientation {
  /**
   * 纵
   */
  Portrait = 'portrait', // 纵
  /**
   * 横
   */
  Landscape = 'landscape', // 横
}

/** 字段的上下限校验模式 */
export enum RangeValidateMode {
  /** 不校验 */
  No_Validate = 'NoValidate',
  /** 固定输入校验 */
  Fixed_Number = 'FixedNumber',
  /** 变量校验 */
  Variable_Validate = 'VariableValidate',
}

/**
 * 小数显示模式
 */
export enum DecimalDisplayMode {
  /** 显示百分比（%） */
  PERCENT = 'percent',
  /** 显示原始数值 */
  ORIGIN = 'origin',
}

/**
 * 签名格式
 */
export enum SignatureTypeEnum {
  /** 仅签名 */
  SIGNATURE_ONLY = 'signature_only',
  /** 签名及日期 */
  SIGNATURE_DATE = 'signature_date',
  /** 签名及日期时间 */
  SIGNATURE_DATETIME = 'signature_datetime',
}

/** 签名日期配置 */
export enum SignatureTimeTypeEnum {
  /** 跟随签名 */
  FOLLOW_SIGNATURE = 'follow_signature',
  /** 填充新字段 */
  POPULATE_FIELD = 'populate_field',
}

/** 签名人数配置 */
export enum SignatureNumberTypeEnum {
  /** 单人签名 */
  SIGNATURE_SINGLE = 'signature_single',
  /** 多人签名 */
  SIGNATURE_MULTIPLE = 'signature_multiple',
}

/** 布尔显示方式 */
export enum BooleanShowMode {
  /**
   * 只显示真
   */
  OnlyTrue = 'onlyTrue',
  /**
   * 只显示真
   */
  OnlyFalse = 'onlyFalse',
  /**
   * 同时显示真和假
   */
  Both = 'both',
}

/**
 * 页面组件值类型
 */
export enum PaperWidgeValueType {
  Fixed = 'fixed',
  Field = 'field',
  Formula = 'formula',
}

export enum BwipCodeType {
  Code39 = 'code39',
  Code128 = 'code128',
  QRCode = 'qrcode',
  GS1DataMatrix = 'gs1datamatrix',
}

/** 分栏的方向 */
export enum DiagonalDirection {
  /** 从左上到右下 \  */
  Forward = 'forward',
  /** 从右上到左下 / */
  Backward = 'backward',
}

/**
 * 图片组件高宽呈现模式
 */
export enum WidgetImageSizeMode {
  /**
   * 自适应，响应式的适应外层容器的大小
   */
  RESPONSIVE = 'responsive',
  /**
   * 固定值，高宽设了多少就是多少
   */
  FIXED = 'fixed',
}

/** 线条类型 */
export enum LineType {
  /** 实线 */
  Solid = 'solid',
  /** 虚线 */
  Dashed = 'dashed',
  /** 点线 */
  Dotted = 'dotted',
}

/** 字段默认值系统变量 */
export enum FieldSysVarDefaultValueEnum {
  NULL = '',
  /** 系统日期 */
  SYS_DATE = 'SYS_DATE',
  /** 系统时间 */
  SYS_TIME = 'SYS_TIME',
  /** 系统日期时间 */
  SYS_DATE_TIME = 'SYS_DATE_TIME',
  /** 系统登录用户 */
  CURRENT_USER = 'CURRENT_USER',
  /** 当前登录用户主部门 */
  CURRENT_ORG = 'CURRENT_ORG',
}

export const DateFormat = {
  YYYY: {
    valueFormat: 'YYYY-01-01',
    picker: 'year',
    columnsType: ['year'],
  },
  'YYYY-MM': {
    valueFormat: 'YYYY-MM-01',
    picker: 'month',
    columnsType: ['year', 'month'],
  },
  'YYYY-MM-DD': {
    valueFormat: 'YYYY-MM-DD',
    picker: 'date',
    columnsType: ['year', 'month', 'day'],
  },
  'YYYY-MM-DD HH': {
    valueFormat: 'YYYY-MM-DD HH:00:00',
    columnsType: ['hour'],
  },
  'YYYY-MM-DD HH:mm': {
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    columnsType: ['hour', 'minute'],
  },
  'YYYY-MM-DD HH:mm:ss': {
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    columnsType: ['hour', 'minute', 'second'],
  },
  'HH:mm:ss': {
    valueFormat: 'HH:mm:ss',
    columnsType: ['hour', 'minute', 'second'],
  },
  'HH:mm': {
    valueFormat: 'HH:mm:00',
    columnsType: ['hour', 'minute'],
  },
  HH: {
    valueFormat: 'HH:00:00',
    columnsType: ['hour'],
  },
};

export enum JoinModelTypeEum {
  /** 实体模型 */
  EntityModel = 'entity_model',
  /** 表单模型 */
  FormModel = 'form_model',
  /** 数据连接 */
  SqlModel = 'sql_model',
  /** IPAAS */
  IpaasModel = 'ipaas_model',
  /** 内置业务 */
  BuiltinModel = 'builtin_model',
}

export enum ParamModelTypeEnum {
  /** 组件参数 */
  CompParam = 'comp_param',
  /** 内置参数 */
  BuiltinParam = 'builtin_param',
}

/** 签名显示方式 */
export enum SignShowTypeEnum {
  /** 垂直显示 */
  VERTICAL = 'vertical',
  /** 水平显示 */
  HORIZONTAL = 'horizontal',
}

/** 线条方向 */
export enum LineDirection {
  /**纵向 */
  vertical = 'vertical',
  /**横向 */
  horizontal = 'horizontal',
}

/** 页码格式 */
export enum PaginationFormat {
  Custom = 'custom',
}

/**
 * bpmn节点类型
 */
export enum BpmnNodeTypeEnum {
  /** 开始节点 */
  BpmnStart = 'bpmnStart',
  BpmnSubmit = 'bpmnSubmit',
  /** 审批节点 */
  BpmnApproval = 'bpmnApproval',
  /** 结束节点 */
  BpmnEnd = 'bpmnEnd',
  /** 条件分支 */
  BpmnExclusive = 'bpmnExclusive',
  /** 判断节点 */
  BpmnJudge = 'bpmnJudge',
  /** 并行分支 */
  BpmnInclusiveS = 'bpmnInclusiveS',
  /** 包容节点 */
  BpmnInclusiveE = 'bpmnInclusiveE',
  /** 并行节点 */
  BpmnParallel = 'bpmnParallel',
}

/**
 * tips: 增加枚举时同步后端增加，该值会作为变量运行在 bpmn 中
 */
export enum ButtonTypeEnum {
  /** 保存 */
  Save = 'Save',
  /** 提交 */
  Submit = 'Submit',
  /** 审核 */
  Approve = 'Approve',
  /** 退回 */
  Return = 'Return',
  /** 转办 */
  Reassign = 'Reassign',
  /** 合格 */
  Qualified = 'Qualified',
  /** 不合格 */
  Unqualified = 'Unqualified',
  /** 部分提交（会校验的保存） */
  PartialSubmit = 'PartialSubmit',
  /** 流程干预-撤回 */
  // Return4Interfere = 'Return4Interfere',
  /** 表单填报-转办 */
  // Reassign4Interfere = 'Reassign4Interfere',
}

export enum BpmnSignatureTypeEnum {
  None = 'None',
  Account = 'Account',
  Handwritten = 'Handwritten',
  Any = 'Any',
}

export enum TimeDiffFormat {
  D_H_MIN_S = 'D_H_MIN_S', // 默认值
  Y_M_D_H_MIN_S = 'Y_M_D_H_MIN_S',
  H_MIN_S = 'H_MIN_S',
  Y = 'Y',
  M = 'M',
  D = 'D',
  H = 'H',
  MIN = 'MIN',
  S = 'S',
}

/** 移动端填报类型 */
export enum MobileFillTypeEnum {
  /** 主模型 */
  MAIN_FIELD = 'main-field',
  /** 动态表 */
  SUB_TABLE = 'sub-table',
  /** 固定表 */
  FIXED_TABLE = 'fixed-table',
  /** 二维表 */
  SUB_TABLE_2D = 'sub-table-2d',
  /** 检验表 */
  CHECK_TABLE_2D = 'check-table-2d',
  /** 二维表关联 */
  SUB_TABLE_2D_LINK = 'sub-table-2d-link',
  /** 检验表关联 */
  CHECK_TABLE_2D_LINK = 'check-table-2d-link',
  /** 物料消耗表 */
  MATERIAL_CONSUME_TABLE = 'material-consume-table',
  /** 物料平衡表 */
  MATERIAL_BALANCE_TABLE = 'material-balance-table',
}

/** 图片显示模式 */
export enum ImageDisplayModeEnum {
  /** 自定义 */
  CUSTOM = 'CUSTOM',
  /** 自适应 */
  ADAPTIVE = 'ADAPTIVE',
}

/** 作废、变更按钮的变更类型 */
export enum SummaryApproveHisTypeEnum {
  FORM_CHANGE = 'FORM_CHANGE',
  DHR_CHANGE = 'DHR_CHANGE',
  NOTEBOOK_CHANGE = 'NOTEBOOK_CHANGE',
}

export enum EBR_PROVIDE_ENUM {
  /** 电子批记录按钮权限点 */
  EDHR_BUTTON_PERMISSION = 'GCT_EdhrButtonPermission',
}

/**
 * 受控状态
 * @deprecated will be deprecated in the future
 *  */
export enum ControlStatusEnum {
  /** 期初 */
  UNCONTROLLED = 'UNCONTROLLED',
  /** 受控中 */
  RUNNING = 'RUNNING',
  /** 已受控 */
  CONTROLLED = 'CONTROLLED',
}

export enum OfficeTypeEnum {
  EXCEL = 'excel',
  WORD = 'word',
}

export * from './instance-status';
export * from './material-status';
