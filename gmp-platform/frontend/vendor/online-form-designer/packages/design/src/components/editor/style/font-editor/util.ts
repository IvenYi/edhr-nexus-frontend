import { TextAlign, TextDecoration } from '@gct/runtime';
import { IFont } from '../../../../interface';

export const DefaultFont: IFont = {
  fontSize: '14px',
  color: '#000000',
  align: TextAlign.LEFT,
  bold: false,
  italic: false,
  textDecoration: TextDecoration.NONE,
};
