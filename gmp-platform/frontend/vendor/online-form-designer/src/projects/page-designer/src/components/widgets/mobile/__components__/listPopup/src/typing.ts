export interface Props {
  api: Function;
  title: string;
  options: optionType[];
  optionLabelProp?: String; // 下拉框中显示的字段，默认取得是label，可用此属性配置显示其他的字段。
  fieldKey?: any;
  fieldType?: string;
  showSearch?: Boolean | undefined;
  isTree?: Boolean;
  lazy?: Boolean;
  selectedOptions?: optionType[]; // 所有选中项的opts，用于懒加载时，数据不全，多选状态下，无法回显全部的选中项
  remote?: Boolean; // 是否远程搜索
  iconNode?: Boolean; // 需要渲染图标
  multiple?: Boolean;
  scan?: Boolean; //是否支持扫码
  customSearch?: Function;
}

export interface Options extends Props {
  callback?: (value: any) => void;
}

export enum SelectType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export interface openPickerByType {
  ids?: string[] | string;
  type?: SelectType;
  callback: openPickerByCallback;
}

export type openPickerByCallback = (
  args: { a: string | any[], checkOptions: optionType[] },
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
