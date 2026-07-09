export interface openPopupType {
  value?: string | string[];
  title?: string;
  // 列表展示类型
  listType: ListType;
  // 选项接口
  getOptions: (params?: SearchData) => Promise<{
    options: Option[];
    total?: number; // 启用分页时提供
  }>;
  //有缓存功能的接口
  getOptionsUseCache: (params?: SearchData) => Promise<{
    options: Option[];
    total?: number; // 启用分页时提供
  }>;
  // 是否多选
  multiple?: boolean;
  // 是否显示搜索框
  searchable?: boolean;
  // 是否启用分页查询
  paged?: boolean;
  // 是否显示暂无数据
  showEmpty?: boolean;
  // 根据 ids 获取对应选项（启用分页时提供，用于回显数据）
  getOptionsByIds?: (ids: string[]) => Promise<Option[]>;
  /**打开模态框的时候需要临时添加的查询条件 */
  queryData?: Object;
  /** 自定义枚举值列表 */
  customMenuFilter?: string[];
  refVersion?: boolean; //是否引用版本 逻辑参考pc
  /** 自定义字段 */
  displayFields?: object[];
  /** 忽略大小写 */
  ignoreCase?: number; // 1,0
}

export interface Option {
  /**显示label */
  label: string;
  /**唯一标识 */
  value: string | number;
  // 是否叶子节点（树形结构时使用）
  leaf?: boolean;
  // 是否禁用
  disabled?: boolean;
  // icon font 图标
  textColor?: string;
  iconColor?: string;
  icon?: string;
  /**原始数据 */
  _protoValue: IObject;
  // 子节点（树形结构时使用）
  children?: Option[];
  /**选完后回显的值 */
  __LABEL__?: string;
}

// 枚举、用户、部门
export type ListType = 'enum' | 'user' | 'org' | 'rdo' | 'printer' | 'label_template_ref';

export interface SearchData {
  pageNumber: number;
  pageSize: number;
  searchValue: string;
  query?: Object;
}
