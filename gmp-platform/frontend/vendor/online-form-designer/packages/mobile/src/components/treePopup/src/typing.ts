export interface Options extends Props {
  // api: Function;
  // title: string;
  // options?: optionType[];
  // fieldKey?: string;
  // modelKey?: string;
  // isTreeData?: boolean;
  callback?: (value: any) => void;
}

export interface Props {
  api: Function;
  title: string;
  options?: optionType[];
  fieldKey?: string;
  modelKey?: string;
  isTreeData?: boolean;
  hasNoLabels?: boolean;
}

export interface optionType {
  label: string;
  value: any;
  parentId?: any;
  labels?: any;
  checked?: Boolean;
  selectable?: Boolean;
  _item: DeptItem;
}

export enum SelectType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export enum DEPT_TYPE {
  GROUP = 'GROUP',
  DEPARTMENT = 'DEPARTMENT',
}

export interface openPickerByType {
  ids?: string[] | string;
  type: SelectType;
  callback: openPickerByCallback;
}

export type openPickerByCallback = (
  value: string[] | string,
  // rows: OrgUserResponse[] | OrgUserResponse,
) => void;

export interface DeptItem {
  id: string;
  name: string;
  parentId: string;
  type: DEPT_TYPE;
  sortNum?: Number;
}

export interface TreeOptions {
  label: string;
  value: any;
  labels?: any;
  _item: DeptItem;
  parentId?: any;
  checked?: Boolean;
  expand?: boolean;
  selectable?: Boolean;
  children: TreeOptions[];
}
