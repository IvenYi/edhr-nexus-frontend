export interface TagItem {
  name: string;
  key: string | number;
  color?: string;
  customColor?: string; // 自定义颜色
}

export interface CollapseItem {
  label: string;
  name: any;
  key?: string;
  hasTag?: boolean; //
  isCopy?: boolean; // 是否可复制
  render?: string;
  tagList?: TagItem[]; //
  ellipsis?: boolean; //是否省略
  hidden?: boolean; //是否隐藏
  handle?: Function;
  span?: number; //占位
  useSlot?: boolean;
  slotName?: string;
  slotData?: any;
}
