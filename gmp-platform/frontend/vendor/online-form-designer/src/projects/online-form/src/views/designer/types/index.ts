import type { SubTableType } from '../enums';
import type {
  CellType,
  Orientation,
  ParamModelTypeEnum,
  IBindField,
  IToFieldItem,
  ICellBorder,
  IFormTmplBom,
} from '@gct/nocode-base';
import type { PaperWidget } from '/@online-form/views/types/paper-widget';
import type { CellWidget } from './cell-widget';
import type { IModelMetaMap } from '../hooks/useModelFields';

export type ICellStyle = Record<string, string | number | undefined>;

export interface IParamToField {
  id: string;
  key: string;
  toModel: string;
  toField: string;
  subModelField?: string; // 子模型字段 为空表示主模型
}

export interface IGlobalOption {
  id: string;
  title: string;
  options: Array<{
    id: string;
    text: string;
    value: string;
  }>;
}

export interface IParameterMapping {
  /** 唯一标识 */
  id: string;
  /** 参数key */
  formKey: string | undefined;
  /** 参数映射类型 */
  paramMapType: ParamModelTypeEnum | undefined;
  /** 模型key */
  modelKey: string | undefined;
  /** 是否是子表 */
  subModel: number | undefined;
  /** 子表字段key */
  subFieldKey: string | undefined;
  /** 映射的字段信息 */
  toFields: Array<IToFieldItem>;
}

export interface IExpressionItem {
  /** 唯一标识 */
  id: string;
  /** 字段key */
  fieldKey: string | undefined;
  /** 字段类型 */
  fieldType: string | undefined;
  /** 条件 */
  operator: string | undefined;
  /** 参数key */
  formKey: string | undefined;
  /** 参数映射类型 */
  paramMapType: ParamModelTypeEnum | undefined;
}

export interface IFieldMapItem {
  /** 唯一标识 */
  id: string;
  /** 模型key */
  modelKey: string | undefined;
  /** 是否是子表 */
  subModel: number | undefined;
  /** 子表字段key */
  subFieldKey: string | undefined;
  /**是否检验表 */
  isCheckTable: boolean | undefined;
  fields: Array<{
    /** 当前表单模型字段key */
    leftFieldKey: string;
    /** 映射的字段key */
    rightFieldKey: string | undefined;
    /** 所属模型pos */
    cascaderKey: string | undefined;
    /** 是否是关联模型字段 */
    isFieldModel?: boolean | undefined;
    /** 字段链路 */
    fieldLink?: string | undefined;
  }>;
}

export interface IJoinIpaasConfig {
  /** 请求方式 */
  reqMethod: string | undefined;
  /** 请求url路径 */
  reqPath: string | undefined;
  /** body参数 */
  metaHeader: string | undefined;
  /** 头部参数 */
  metaBody: string | undefined;
  /** 查询参数 */
  metaQuery: string | undefined;
  /** 路径参数 */
  metaUri: string | undefined;
  /** 出参查看 */
  outputBodyParameters: string | undefined;
}

export interface ICustomDataSource {
  /** 唯一标识 */
  id: string;
  /** 关联模型类型 */
  joinModelType: string | undefined;
  /** 关联表单id */
  joinFormRefId: string | undefined;
  /** 关联模型key */
  joinModelKey: string | undefined;
  /** 是否是子表 */
  joinSubModel: boolean | undefined;
  /** 关联SQL语句 */
  joinSqlJson: string | undefined;
  /** 关联IPAAS配置 */
  joinIpaasConfig: IJoinIpaasConfig;
  /** 关联内置业务配置 */
  joinBuiltinConfig: string | undefined;
  /** 模型关联条件 */
  onExpressions: Array<IExpressionItem>;
  /** 字段映射 */
  onFieldMap: Array<IFieldMapItem>;
}

export interface ICheckTableDataSource {
  id: string;
  data: any[];
  modelKey: string;
  subFieldKey: string;
}

export interface ICell {
  type?: CellType;
  value?: any;
  style?: ICellStyle;
  border?: ICellBorder;
  /**
   * 字段信息
   */
  fieldMeta?: IBindField;
  /**
   * 字段渲染组件
   */
  fieldWidget?: CellWidget.BasicSchema;
  /**
   * 组件
   */
  paperWidget?: PaperWidget.BasicSchema;

  /**
   * 组合字段
   */
  multiFields?: boolean;
  multiFieldsContent?: Array<{
    id: string;
    type?: CellType;
    fieldMeta?: IBindField;
    fieldWidget?: CellWidget.BasicSchema;
  }>;
  autoMerge?: boolean;
  xAutoMerge?: boolean;
  fillDirection?: 'x' | 'y';
}

export interface IColRange {
  l: number;
  r: number;
}
export interface IRowRange {
  t: number;
  b: number;
}
export type IRange = IColRange & IRowRange;

export interface IMedia {
  id: string;
  src: string;
}
// 浮动图片
export interface IImage {
  id: string;
  mediaId: string;
  layout: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/**
 * 子表
 */
export interface ITable {
  id: string;
  name: string;
  field: string; // 主表中的字段
  model: string; // 子表的模型key
  mainModel: string; // 关联主表的模型key
  range: IRange;
  thName?: string;
  thRange?: IRange;
  type?: SubTableType;
  colField?: string; // 字段
  colModel?: string; // 模型
  dgRange?: IRange; // 动态关联/数据分组
  autoFill?: boolean; // 引用填充
  quickFill?: boolean; // 快速填报
  fillDirection?: 'x' | 'y'; // 填充方向
  indexedTd?: boolean; // 使用索引方式渲染表格
  refColField?: string;
  refRowField?: string;
  checkDsId?: string; // 检验表数据源（检验项）

  rowRange?: IRange;

  /** 物料消耗表的业务配置 */
  mcBomConfig?: IFormTmplBom;
}
/**
 * 固定表
 */
export type IFixedTable = ITable;

export enum CanvasMode {
  Sheet = 'sheet',
  Paper = 'paper',
}

export const CommonAttr: Array<keyof IPaper> = [
  'canvasMode',
  'orientation',
  'padding',
  'cols',
  'medias',
  'images',
  'paramToField',
  'paperHeader',
  'paperHeaderWidgets',
  'paperFooter',
  'paperFooterWidgets',
  'javascript',
  'globalOptions',
  'parameterMapping',
  'customDataSource',
  'checkTableDataSource',
  'mainModelKey',
  'modelMetaMap',
];

export interface IPaper {
  /** 当前sheet页的唯一标识 */
  sheetId: string;
  // 纸张方向
  orientation: Orientation;
  // 纸张边距
  padding: IRange;

  // 列定义
  cols: Array<{
    width: number;
    manual?: boolean;
  }>;
  // 行定义
  rows: Array<{
    height: number;
    manual?: boolean;
  }>;

  // 单元格
  cells: ICell[][];
  // 合并区域
  mergedCells: Array<IRange>;

  // 全局表格配置
  // paperTable?: Partial<ITable>;
  // 表头
  thead?: {
    thName?: string;
    thRange?: IRange;
  };
  // 动态表配置
  dynamicTables?: ITable[];

  // 固定表
  fixedTables?: IFixedTable[];

  // 媒体资源
  medias?: Array<IMedia>;
  // 图片资源
  images?: Array<IImage>;
  // 参数配置
  paramToField?: Array<IParamToField>;

  // 页眉页脚
  canvasMode?: CanvasMode;
  paperWidgets?: PaperWidget.BasicSchema[];
  paperHeader?: boolean;
  paperHeaderWidgets?: PaperWidget.BasicSchema[];
  paperFooter?: boolean;
  paperFooterWidgets?: PaperWidget.BasicSchema[];

  // 自定义脚本
  javascript?: string;

  /** 全局配置-枚举分组 */
  globalOptions?: Array<IGlobalOption>;
  /** 数据初始化-参数映射 */
  parameterMapping?: Array<IParameterMapping>;
  /** 数据初始化-数据源 */
  customDataSource?: Array<ICustomDataSource>;
  /** 检验表的数据源 */
  checkTableDataSource?: Array<ICheckTableDataSource>;
  /** 主模型key */
  mainModelKey?: string;
  /** 缓存的临时数据模型结构 */
  modelMetaMap?: IModelMetaMap;
}

export interface ICallback {
  save: Function;
  publish: Function;
}

/**
 * 选中区域内涉及的页面数据，基于选区左上角重新建立坐标系的
 * @author lingxiaoming
 * @date 2024-07-05 04:07:40
 * @export
 * @interface SelectionPaperData
 */
export interface ISelectionPaperData {
  /**
   * 复制的范围内单元格数据
   * @author lingxiaoming
   * @date 2024-07-05 03:58:31
   * @type {ICell[][]}
   */
  cells: ICell[][];
  /**
   * 范围内的合并区域
   * @author lingxiaoming
   * @date 2024-07-05 03:59:29
   * @type {Array<IRange>}
   */
  mergedCells: Array<IRange>;
}

/**
 * 拷贝的表单选中范围内的数据
 * @author lingxiaoming
 * @date 2024-07-05 04:00:29
 * @export
 * @interface CopyData
 */
export interface ICopyData extends ISelectionPaperData {
  /**
   * 电子表单id
   * @author lingxiaoming
   * @date 2024-07-05 03:57:50
   * @type {string}
   */
  documentId: string;
}

/** bom明细对象 */
export interface IBomEntry {
  /** 排序字段 */
  sort_num_: number;
  /** 物料id */
  product_id_: string;
  /** 单位用量 */
  qty_required_: number;
  /** 删除标记 */
  deleted_?: boolean;
  /** 顺序 */
  operation_sort_num_?: number;
}

/** 物料消耗表业务配置 */
export interface IFormTmplBom {
  /** 唯一标识 */
  id_?: string;
  /** 表单模板id */
  form_tmpl_id_?: string;
  /** 表单里物料消耗表的id */
  table_key_: string;
  /** 是否启用上下料模式 */
  material_loading_model_enabled_: boolean;
  /** 条码解析规则 */
  barcode_parsing_rules_id_?: string;
  /** 从BOM初始化(废弃) */
  bom_init_enabled_?: boolean;
  /** 人为指定物料 */
  personal_bom_enabled_?: boolean;
  /** 按顺序上料 */
  sequence_loading_enabled_?: boolean;
  /** bom明细 */
  entries_: IBomEntry[];
  /** 删除标记 */
  deleted_?: boolean;
}
