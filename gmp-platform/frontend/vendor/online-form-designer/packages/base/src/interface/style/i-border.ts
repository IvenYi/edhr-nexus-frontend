import { BorderStyle } from '@gct/runtime';

export interface IBorderItem {
  style?: BorderStyle;
  color?: string;
  width?: string;
}

export interface IBorder {
  top?: IBorderItem;
  right?: IBorderItem;
  bottom?: IBorderItem;
  left?: IBorderItem;
  topRightRadius?: string;
  topLeftRadius?: string;
  bottomRightRadius?: string;
  bottomLeftRadius?: string;
}
