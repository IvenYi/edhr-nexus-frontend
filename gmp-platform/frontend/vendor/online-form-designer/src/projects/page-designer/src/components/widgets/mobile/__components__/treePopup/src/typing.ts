export interface Options {
  options: optionType[];
  height?: string; // popup的高度
  callback?: (value: any) => void;
  disabledOk?: boolean | Function; // 确定按钮是否可用
  showTag?: boolean | Function;
  showCancel?: boolean | Function;
  showBtnArea?: (IData) => boolean;
  lazy?: boolean; // 是否懒加载,分页加载
  async?: boolean; // 是否异步加载，点击加载子数据
  showSearch?: boolean; // 是否支持搜索
  asyncApi?: (IData) => Promise<boolean | undefined>; // 异步加载的方法。返回值，数据是否加载完毕，用于分页加载数据时
  selectedOptions?: optionType[]; // 所有选中项的opts
  customSearch?: Function;
}

export interface optionType {
  label: string;
  value: string;
  parentId?: string;
  labels?: any;
  checked?: Boolean;
  hasChild?: boolean;
  id?: string;
}

export enum SelectType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export interface openPickerByType {
  ids?: any;
  title?: string;
  type: SelectType;
  // options: Array<optionType>;
  checked?: (checkedId) => void; // 选中时
  saved?: (selectedId, selectedData) => void; // 保存时
  closed?: Function; // 关闭后
  // callback: openPickerByCallback;
}

export type openPickerByCallback = (
  value: string[] | string,
  // rows: OrgUserResponse[] | OrgUserResponse,
) => void;

export interface TreeOptions {
  label: string;
  value: any;
  labels?: any;
  parentId?: any;
  checked?: Boolean;
  expand?: boolean;
  children: TreeOptions[];
  disabled?: Boolean;
}
