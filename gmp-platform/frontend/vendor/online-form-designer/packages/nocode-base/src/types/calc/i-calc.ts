export type MergeCellItem = {
  /** tdId */
  tdId: string;
  /** 动态内容标识 */
  dataFsSymbol: string;
  /** 单元格可横跨的列数 */
  colspan: number | undefined;
  /** 单元格可横跨的行数 */
  rowspan: number | undefined;
  /** 固定值 */
  value?: any;
  /** 动态渲染值 */
  visibleText?: any;
  /** 边框信息 */
  borderAttrs?: string[];
};

export type IMergeCells = Record<string, MergeCellItem>;

export interface IMarketData {
  /** trId */
  trId: string;
  /** 行状态 */
  status: string;
  /** 基础行高 */
  height: number;
  /** 子表字段id */
  subFieldId?: string;
  /** 子表入口组件id */
  subWidgetId?: string;
  /** 子表tdid(外层包裹处) */
  subWrapperTdId?: string;
  /** tr关联关系 */
  linkTrId?: string;
  /** 列合并信息集合 */
  mergeCells: IMergeCells;
  /** 单元格动态信息 */
  dynCells: Record<
    string,
    {
      /** tdId */
      tdId: string;
      /** 单元格坐标 */
      tdIndex: number;
      /** 动态内容标识 */
      dataFsSymbol: string;
      /** 单元格所占宽度 */
      cellFixedWidth: number;
      /** 单元格样式 */
      style: any;
      /** 单元格是否列合并 */
      isCellMerge: boolean;
    }
  >;
}

export interface IDealWithItem {
  /** 唯一key */
  uuid: string;
  /** 行状态 */
  status: string;
  /** 基础行高 */
  height: number;
  /** 子表字段id */
  subFieldId?: string;
}

interface IPageRelation {
  /** 开始坐标 */
  start: number;
  /** 结束坐标 */
  end: number;
}

interface IMergeBlock {
  /** tdId */
  firstTdId: string;
  /** 原始tdId */
  sourceTdId: string;
  /** 单元格可横跨的行数 */
  rowspan?: number;
  /** 单元格可横跨的列数 */
  colspan?: number;
  /** 固定值 */
  value?: any;
  /** 是否走动态组件 */
  isDynRo?: boolean;
  /** 动态渲染值 */
  visibleText?: any;
  /** 边框信息 */
  borderAttrs?: string[];
}

export interface ISubTableItem {
  uuid: string;
  /** 子表内容trId集合 */
  containerIds: string[];
  /** 当前页动态行高集合 */
  dynamicRowHeights: Record<string, number | number[]>;
  fieldId: string;
  mergeBlock?: Record<string, IMergeBlock>;
  /** 子表入口组件id */
  widgetId: string;
  /** 子表tdid(外层包裹处) */
  wrapperTdId: string;
}

export interface IPageItem {
  /** 唯一key */
  uuids: Set<unknown>;
  /** 当前页子表数据信息 */
  relation: Record<string, IPageRelation>;
  /** 当前页组件总高度 */
  totalHeight: number;
  /** 动态行高 */
  dynHeights: Map<string, number | number[]>;
}

export interface IPageData {
  /** 唯一key */
  uuid: string;
  /** 当前页内容trId集合 */
  containerIds: string[];
  /** 当前页动态行高集合 */
  dynamicRowHeights: Record<string, number | number[]>;
  /** 合并信息 */
  mergeBlock?: Record<string, IMergeBlock>;
  /** 当前页子表数据信息 */
  relation?: Record<string, IPageRelation>;
  /** 当前页组件总高度 */
  totalHeight: number;
  /** 当前页子表信息集合 */
  subTableMap: Record<string, ISubTableItem>;
}
