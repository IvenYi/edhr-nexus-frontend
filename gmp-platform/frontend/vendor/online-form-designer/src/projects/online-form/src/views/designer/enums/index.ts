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

export enum BwipCodeType {
  Code39 = 'code39',
  Code128 = 'code128',
  QRCode = 'qrcode',
  GS1DataMatrix = 'gs1datamatrix',
}

export enum LineType {
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted',
}

export enum PageSizeEnum {
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  CUSTOM = 'CUSTOM',
}

export enum PaginationFormat {
  Custom = 'custom',
}

export enum ContextMenu {
  InsertRowBefore,
  InsertRowAfter,
  InsertColBefore,
  InsertColAfter,
  DeleteCol,
  DeleteRow,
  DataGroup,
  DataGroup2D,
  SetColWidth,
  SetRowHeight,
  MergeCell,
  SplitCell,
}

export enum ResizeDirection {
  N = 'n',
  NE = 'ne',
  E = 'e',
  SE = 'se',
  S = 's',
  SW = 'sw',
  W = 'w',
  NW = 'nw',
}

export enum PanelType {
  Paper,
  Cell,
  PaperHeader,
  PaperFooter,
  PaperWidget,
  PaperHeaderWidget,
  PaperFooterWidget,
  DynamicTable,
  _2DTable,
  FixedTable,
  CheckTable,
  DataGroup,
  DataGroup2D,
  TableHeader,
  GlobalConfig,
  DataInitConfig,
  TmplConfig,
  MaterialConsumptionTable,
  MaterialBalanceTable,
}

/**
 * 页码样式
 */
export const PaginationFormatOptions = [
  {
    exp: '第 ${no} 页',
    label: '第 1 页',
  },
  {
    exp: '${no}',
    label: '1,2,3',
  },
  {
    exp: '${no}/${total}',
    label: '1/x',
  },
  {
    exp: '第 ${no} 页 共 ${total} 页',
    label: '第 1 页 共 x 页',
  },
  {
    exp: PaginationFormat.Custom,
    label: $t('sys.customize'),
  },
];

export const BwipCodeTypeOptions: Array<{
  code: BwipCodeType;
  title: string;
  widget: PaperWidgeType;
  example: string;
}> = [
  {
    code: BwipCodeType.Code39,
    title: 'Code 39',
    widget: PaperWidgeType.Barcode,
    example: 'THIS IS CODE 39',
  },
  {
    code: BwipCodeType.Code128,
    title: 'Code 128',
    widget: PaperWidgeType.Barcode,
    example: 'This is code 128!',
  },
  {
    code: BwipCodeType.QRCode,
    title: 'QR Code',
    widget: PaperWidgeType.Qrcode,
    example: 'This is QR Code!',
  },
  {
    code: BwipCodeType.GS1DataMatrix,
    title: 'GS1 Data Matrix',
    widget: PaperWidgeType.Qrcode,
    example: '(01)09521234543213(17)120508(10)ABCD1234(410)9501101020917',
  },
];

/** 字重 */
export enum FontFamilyEnum {
  /** 默认 */
  // Serif = 'serif',
  Serif = '',
  /** 宋体 */
  SimSun = '"SimSun", "宋体", "华文宋体", STSong, STSongti-SC-Light, sans-serif',
  /** 黑体 */
  SimHei = '"SimHei", "黑体", "华文黑体", STHeiti, sans-serif',
  /** 楷体 */
  KaiTi = '"Kai", "STKai", "楷体", "KaiTi", "华文楷体", sans-serif',
}

export const FontFamilyOptions = [
  {
    label: $t('sys.default'),
    value: FontFamilyEnum.Serif,
  },
  {
    label: $t('sys.onlineForm.songTi'),
    value: FontFamilyEnum.SimSun,
  },
  {
    label: $t('sys.onlineForm.heiti'),
    value: FontFamilyEnum.SimHei,
  },
  {
    label: $t('sys.onlineForm.kaiTi'),
    value: FontFamilyEnum.KaiTi,
  },
];

export enum BorderPositionEnum {
  all = 'all',
  outer = 'outer',
  outerBold = 'outerBold',
  none = 'none',
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
}

export const BorderPositionOptions = [
  {
    type: BorderPositionEnum.none,
    name: $t('sys.onlineForm.noBorder'),
  },
  {
    type: BorderPositionEnum.all,
    name: $t('sys.onlineForm.allBorders'),
  },
  {
    type: BorderPositionEnum.outer,
    name: $t('sys.onlineForm.outsideBorder'),
  },
  {
    type: BorderPositionEnum.outerBold,
    name: $t('sys.onlineForm.thickOutsideBorder'),
  },
  {
    type: BorderPositionEnum.top,
    name: $t('sys.pageDesigner.topBorder'),
  },
  {
    type: BorderPositionEnum.bottom,
    name: $t('sys.pageDesigner.bottomBorder'),
  },
  {
    type: BorderPositionEnum.left,
    name: $t('sys.pageDesigner.leftBorder'),
  },
  {
    type: BorderPositionEnum.right,
    name: $t('sys.pageDesigner.rightBorder'),
  },
];

/**
 * 设计器展示状态
 * @alias Print       只读态 单元格纯展示
 * @alias Collect     编辑态 单元格填报状态，出现字段组件
 * @alias CollectView 编辑禁用态 单元格填报状态，出现字段组件但组件是禁用状态
 * @alias Refer       引用只读态 不可进行任何操作
 */
export enum DesignMode {
  /** 只读态 单元格纯展示 */
  Print = 'Print',
  /** 编辑态 单元格填报状态，出现字段组件 */
  Collect = 'Collect',
  /** 编辑禁用态 单元格填报状态，出现字段组件但组件是禁用状态 */
  CollectView = 'CollectView',
  /** 引用只读态 不可进行任何操作 */
  Refer = 'Refer',
}

export enum CellWidgetCategory {
  Text = 'text',
  DateTime = 'date-time',
  Integer = 'integer',
  Double = 'double',
  Decimal = 'decimal',
  Boolean = 'boolean',
  File = 'file',
  Image = 'image',
  Enum = 'enum',
  Signature = 'signature',
  User = 'user',
  Org = 'org',
  Expression = 'expression',
  Agg = 'agg',
  Ref = 'ref',
  /** 追溯字段 */
  Trace = 'trace',
}

export enum CellWidgetRenderComp {
  Input = 'input',
  Textarea = 'textarea',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Switch = 'switch',
  Select = 'select',
  DateTime = 'date-time',
  Image = 'image',
  Attachment = 'attachment',
  Integer = 'integer',
  Double = 'double',
  Decimal = 'decimal',
  Enum = 'enum',
  Signature = 'signature',
  User = 'user',
  Org = 'org',
  Expression = 'expression',
  Agg = 'agg',
  Ref = 'ref',
}

/**
 * 上下限组件显示类型
 * @author lingxiaoming
 * @date 2024-06-20 09:49:07
 * @export
 * @enum {number}
 */
export enum RangeLimitType {
  /**
   * 上限值~下限值
   */
  Range,
  /**
   * 下限值<= N
   */
  OnlyUpperLimit,
  /**
   * 上限值 >=N
   */
  OnlyLowerLimit,
  /**
   * 标准值 ± 公差
   */
  SameTolerance,
  /**
   * 标准值（+上公差/-下公差）
   */
  DifferentTolerance,
}

export const LineStyleOptions = [
  {
    label: '——',
    value: LineType.Solid,
  },
  {
    label: '----',
    value: LineType.Dashed,
  },
  {
    label: '····',
    value: LineType.Dotted,
  },
];

export const PaperSizeMap = {
  [PageSizeEnum.A3]: {
    label: 'A3',
    size: [297, 420],
  },
  [PageSizeEnum.A4]: {
    label: 'A4',
    size: [210, 297],
  },
  [PageSizeEnum.A5]: {
    label: 'A5',
    size: [148, 210],
  },
  [PageSizeEnum.CUSTOM]: {
    label: $t('sys.customize'),
    size: undefined,
  },
};

/**
 * 子表类型
 */
export enum SubTableType {
  DEFAULT = 'DEFAULT',
  _2D = '2D',
  CHECK = 'CHECK',
  FIXED = 'FIXED',
  /** 物料消耗表 */
  MATERIAL_CONSUMPTION = 'MATERIAL_CONSUMPTION',
  /** 物料平衡表 */
  MATERIAL_BALANCE = 'MATERIAL_BALANCE',
}
