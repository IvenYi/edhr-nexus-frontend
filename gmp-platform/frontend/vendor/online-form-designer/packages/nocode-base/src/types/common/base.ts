import { FIELD_TYPE, CreateType } from '@gct/runtime';
import {
  ComponentTypeEnum,
  EmptySymbol,
  CellWidgetViewState,
  FormTypeEnum,
  PlatformEnum,
  RenderModeEnum,
  PosEnum,
  BpmnNodeTypeEnum,
} from '../../constant';
import type { DisplayProps } from '/@online-form/views/designer/types/cell-widget';
import type {
  IPaperProps,
  ISubTableProps,
  ITrProps,
  ITdProps,
  IROProps,
  IDiagonalProps,
} from '../widgets';

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

type CommonProps<T extends Record<string, any>[]> = Partial<UnionToIntersection<T[number]>>;

type CombinedProps = CommonProps<
  [IPaperProps, ISubTableProps, ITrProps, ITdProps, IROProps, IDiagonalProps]
>;

export namespace BaseCoreComponent {
  export interface BasicSchema {
    /** 组件唯一标识 */
    id: string;
    /**组件类型 */
    component: ComponentTypeEnum;
    /** 动态行高组件类型 */
    dynComponent?: ComponentTypeEnum;
    /** 组件属性 */
    props: CombinedProps;
    /** 样式 */
    style?: Partial<AllBaseStyles>;
    /** 表单组件 */
    formItem?: boolean;
    /** 父节点id */
    preId: string | null;
    /** 所属节点id */
    preLocation: string | null;
    /** 子节点数组 */
    nextIds: string[];
    /** 事件 */
    event?: FieldEventProps;
  }
  export type FieldBasicProps = {
    /** 字段key */
    field?: string;
    /** 字段id */
    fieldId?: string;
    /** 字段类型 */
    fieldType?: FIELD_TYPE;
    /** 字段链路 */
    fieldLink?: string;
    /** 模型key */
    modelKey?: string;
    /** 是否是关联模型字段 */
    isFieldModel?: boolean;
    /** 子表模型key */
    subModelKey?: string;
    /** 子表字段key */
    subFieldKey?: string;
    /** 字段来源 */
    createType?: CreateType;
    /** 必填 */
    required?: boolean;
    /** 只读 */
    readonly?: boolean;
    /**组件只读状态 收到组件依赖控制 初始化false */
    field_readonly?: boolean;
    /** 禁用 */
    disabled?: boolean;
    /** 暗提示 */
    placeholder?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 显示状态 */
    viewState?: CellWidgetViewState;
    /** 空值符 */
    nullValSymbol?: EmptySymbol;
    /** 前缀 */
    prefix?: string;
    /** 后缀 */
    suffix?: string;
    /** 尺寸 */
    size?: number;
    /** 组件宽度 */
    cmpWidth?: string;
    /** 组件高度 */
    cmpHeight?: string;
    /** 渲染前置请求数据存放点 */
    newSpecificConfig?: {
      /** 请求的额外查询条件 */
      newQueryData?: any;
      newOptions?: Array<any>;
      newPrecision?: number;
      newRequired?: boolean;
      newUploadConfig?: any;
      newRulesForRounding?: 1 | 4 | 6; // 1:截取；4:四舍五入；6:四舍六入(银行家舍入法)
      /** 额外的组件参数 */
      newComponentProps?: Record<string, any>;
      /** mappingType 数据库存储的原始格式  电子表单中 后端大量业务字段 继承各种原始字段  需要靠mappingType 甄别 */
      mappingType?: string;
    };
    /**
     * 组件依赖
     */
    componentDependency?: DisplayProps;
    /** 是否是物料消耗表的字段 */
    isMaterialConsumeField?: boolean;
  };

  export type FieldEventProps = {
    /** 事件类型 */
    type: string;
    /** 事件方法名 */
    name: string;
  };

  export interface AllBaseStyles {
    verticalAlign: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
    lineHeight: string;
    textDecoration: string;
    color: string;
    whiteSpace: string;
    wordBreak: string;
    tableLayout: string;
    borderLeft: string;
    borderRight: string;
    borderBottom: string;
    borderTop: string;
    backgroundColor: string;
  }
}

type I2DFieldInfo = {
  /** 横向[动态|固定]表字段key */
  rowSubFieldKey: string;
  /** 横向[动态|固定]表模型key */
  rowSubModelKey: string;
  /** 纵向固定表字段key */
  colSubFieldKey: string;
  /** 纵向固定表模型key */
  colSubModelKey: string;
  /** 横向[动态|固定]表被关联字段key */
  rowRefFieldKey: string;
  /** 纵向固定表关联主键字段key */
  colRefFieldKey: string;
  /** 横向纵向交叉部分字段key数组 */
  crossFieldKeys: string[];
};

/** 二维表关联信息 */
export type ISubTable2DInfo = {
  /** 是否是二维表 */
  subTable2d: boolean;
} & I2DFieldInfo;

/** 检验二维表关联信息 */
export type ICheckTable2DInfo = {
  /** 是否是检验二维表 */
  checkTable2d: boolean;
  /** 检验表数据源（检验项）id */
  checkDsId: string;
  /** 行数 */
  rowCount: number;
  /** 列数 */
  colCount: number;
  /** 检验表数据源 */
  checkDsData: Array<any>;
} & I2DFieldInfo;

export interface IBindField {
  /** 字段key */
  field?: string;
  /** 字段类型 */
  fieldType?: FIELD_TYPE;
  /** 字段所属模型 */
  model?: string;
  /** 模型链路 */
  modelLink?: string;
  /** 字段链路 */
  fieldLink?: string;
  /** 是否是关联模型字段 */
  isFieldModel?: boolean;
  /** 子表模型key */
  subModelKey?: string;
  /** 子表模型类型 */
  subModelType?: string;
  /** 子表字段key */
  subFieldKey?: string;
  /** 字段来源 */
  createType?: CreateType;
  /** 引用的模型key */
  refModelKey?: string;
}

export interface IToFieldItem {
  /** 字段key */
  field: string | undefined;
  /** 字段类型 */
  fieldType: string | undefined;
  /** 字段来源 */
  createType?: CreateType;
}

/** 流程字段权限信息 */
export type IBpmnFieldAuthItem = {
  /** 字段key */
  field: string | undefined;
  /** 字段名称 */
  fieldName: string | undefined;
  /** 模型key */
  modelKey: string | undefined;
  /** 是否是子表 */
  subModel: number;
  /** 编辑 */
  edit: boolean;
  /** 只读 */
  readonly: boolean;
};

export interface IBasicInfoItem {
  /** 单据模板id或者单据实例id */
  key: string;
  /** 单据模板id */
  tid: string;
  /** 唯一key */
  uniqueId: string;
  /** 模型key */
  modelKey: string;
  /** 表单类型 */
  formType: FormTypeEnum;
  /** 平台类型 */
  platformType: PlatformEnum;
  /** 组件所属位置类型 */
  posType?: PosEnum;
  /** 渲染模式类型 */
  renderModeType: RenderModeEnum;
  /** 渲染模式类型-用来控制按钮 */
  btnRenderModeType: RenderModeEnum;
  /** 是否模拟填报 */
  isMockReport: boolean;
  /** 是否是暂存数据 */
  gct_stashData: boolean;
  /** 流程节点类型*/
  bpmnType?: BpmnNodeTypeEnum;
  /** 流程字段权限 */
  bpmnFieldAuthMap?: Record<string, IBpmnFieldAuthItem>;
  /** 事件实例 */
  eventInstance?: any;

  /** 表单变更-状态开关 */
  formChangeStatus: boolean;
  /** 表单变更-原始数据 */
  formChangeOriginData: Record<string, any>;
  /** 表单变更-更新数据 */
  formChangeNewData: Record<string, any>;
  /** 批注开关状态 */
  annSwitchStatus: boolean;
  /** 批注单元格坐标数组 */
  annCellLocationList: Array<string>;
  /** 批注选中的id */
  annSelectId?: string;
  /** 校验字段单元格坐标数组 */
  validatorLocationList: Array<string>;
  /** 校验字段错误信息集合 */
  validatorMessageMap: Record<string, any>;
  /** 移动端使用 tdId集合 */
  mobileTdIdGroups: Map<any, any>;
  /** 移动端选中的tdId */
  mobileSelectTdId?: string;
  /** 内容高亮集合 */
  contentHighlight: Record<string, any>;
  /** 物料查询条件 */
  productSearchFields: string;
}

export interface ICellBorder {
  left?: boolean;
  top?: boolean;
  right?: boolean; // 实际不会出现右下边框
  bottom?: boolean;
  bold?: boolean; // 是否加粗
  boldLeft?: boolean;
  boldTop?: boolean;
  boldRight?: boolean;
  boldBottom?: boolean;
}

export interface IWikiTreeData {
  /** edhrid */
  baseId?: string;
  /** 全路径 */
  fullPath?: string;
  /** id */
  id?: string;
  /** 引用id */
  refId?: string;
  /** 名称 */
  name?: string;
  /** 父节点id */
  parentId?: string | null;
  /** 排序号 */
  sortNum?: number;
  /** 类型(大纲:OUTLINE/单据:DOC) */
  type?: 'OUTLINE' | 'DOC';
  /** 是否可被选中 */
  selectable: boolean;
  /*** 子节点 */
  children?: Array<IWikiTreeData>;
}

export interface IParseFormulaVar {
  /** 原始表达式变量 */
  original: string;
  /** 解析类型 plain / underscore / hash */
  type: string;
  /** 处理后的表达式变量 */
  processed: string;
  /** 如果是 hash 类型，提取的值 */
  hashValue: string;
  /** 获取数据类型 */
  dataType: string;
}

/** 物料消耗表信息 */
export type IMaterialConsumeTableInfo = {
  /** 表格id */
  tableKey: string;
  /** 所属主表的对应子表字段key */
  masterSubField: string;
};
