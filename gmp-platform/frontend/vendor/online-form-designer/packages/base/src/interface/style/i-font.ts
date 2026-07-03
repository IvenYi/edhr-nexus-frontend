import { TextAlign, TextDecoration } from '@gct/runtime';

export interface IFont {
  fontSize?: string;
  bold: boolean;
  italic: boolean;
  textDecoration: TextDecoration;
  color: string;
  align: TextAlign;
}
