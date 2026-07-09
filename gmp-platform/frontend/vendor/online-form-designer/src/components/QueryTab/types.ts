import { EntityModelCategoryEnum } from 'packages/runtime/src';
import { IEditableTab } from '/@/components/EditableTabs';
import { SearchWidgets } from '/@/projects/page-designer/src/types/web';
import { QueryValueType, DynamicDateType, QueryTabType } from './constants';

/** 查询字段相关配置 */
export type IQueryField = {
  /** 对应模型字段的key */
  field: string;
  /** 模型字段的操作符集合 */
  ope: string[];
  /** 直接值 */
  rawValue?: any;
  /** 值的类型 */
  valueType: QueryValueType;
  /** 动态时间类型 */
  dynamicDateType?: DynamicDateType;
};

/** 带查询条件的标签页结构 */
export interface IQueryTab extends IEditableTab {
  /** 类型，builtin的不允许修改和编辑 */
  type: QueryTabType;
  /** 查询字段的 */
  queryFields: Record<string, IQueryField>;
  /** 国家化配置 */
  i18n?: any;
}

/** 存储用户自定义配置相关的结构 */
export interface IQueryTabConfig {
  /** 隐藏的tabs页面 */
  hiddenTabs: string[];
  /** 自定义的tabs页面集合 */
  customTabs: IQueryTab[];
  /** 存一份内置页面集合 */
  builtinTabs: IQueryTab[];
}

export type CountRequestFn = (query: IParams) => Promise<number> | number;

export interface QueryTabControllerConstructorOpts {
  /** 配置存储的唯一标识 */
  configId: string;
  /** 分页配置的筛选项 */
  searchWidgets: SearchWidgets[];
  /** 模型的分类 */
  modelCategory: EntityModelCategoryEnum;
  /** 内置分页配置数据 */
  builtinTabs: IQueryTab[];
  /** 请求分页总条数回调 */
  countRequest?: CountRequestFn;
}
