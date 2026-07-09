export interface Props {
  title?: string;
  showTabs?: Array<'User' | 'Org' | 'UserGroup'>;
  selectValues: any;
  multiple?: Boolean;
  selectOptions?: Array<any>;
}

export interface Options extends Props {
  callback?: (value: any) => void;
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

export interface optionType {
  label: string;
  value: string;
  labels?: any;
  _item: object;
  pId?: any;
  checked?: Boolean;
}

export interface TreeOptions extends optionType {
  isLeaf?: Boolean;
  expand?: boolean;
  children: TreeOptions[];
}

export interface DOMRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}
