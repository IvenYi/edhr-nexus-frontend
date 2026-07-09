import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { TagTypeEnum, TextDecoration, BorderStyle } from '/@page-designer/enum';

const style: LowCodeWidget.BasicStyle = {
  position: '',
  top: '',
  left: '',
  right: '',
  bottom: '',
  width: '',
  height: '',
  backgroundColor: '',
  marginAll: '',
  marginTop: '',
  marginRight: '',
  marginBottom: '',
  marginLeft: '',
  paddingAll: '',
  paddingTop: '',
  paddingRight: '',
  paddingBottom: '',
  paddingLeft: '',
  labelFont: {
    align: 'left',
    fontSize: '',
    bold: false,
    italic: false,
    textDecoration: TextDecoration.NONE,
    color: '',
  },
  contentFont: {
    align: 'left',
    fontSize: '',
    bold: false,
    italic: false,
    textDecoration: TextDecoration.NONE,
    color: '',
  },
  tagStyle: {
    color: '',
    tagType: TagTypeEnum.RADIUS,
  },
  tagStyleOpen: false,
  borderAll: {
    borderStyle: BorderStyle.NONE,
    borderColor: '#F0F0F0',
    borderWidth: '1',
  },
  borderLeft: {
    borderStyle: BorderStyle.NONE,
    borderColor: '#F0F0F0',
    borderWidth: '1',
  },
  borderRight: {
    borderStyle: BorderStyle.NONE,
    borderColor: '#F0F0F0',
    borderWidth: '1',
  },
  borderBottom: {
    borderStyle: BorderStyle.NONE,
    borderColor: '#F0F0F0',
    borderWidth: '1',
  },
  borderTop: {
    borderStyle: BorderStyle.NONE,
    borderColor: '#F0F0F0',
    borderWidth: '1',
  },
  borderTopRightRadius: '0',
  borderTopLeftRadius: '0',
  borderBottomRightRadius: '0',
  borderBottomLeftRadius: '0',
  borderAllRadius: '0',
};
export default style;

export const notNeedPxStyle = [
  'position',
  'backgroundColor',
  'bold',
  'italic',
  'textDecoration',
  'color',
  'borderStyle',
  'borderColor',
];
