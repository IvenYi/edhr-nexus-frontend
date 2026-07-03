import { ColumnTable, FormulaTable } from '/@page-designer/types/web';
import {
  tableColumnWidthEnum,
  StyleGroup,
  TagTypeEnum,
  TextDecoration,
  tagEnum,
  ProgressTypeEnum,
} from '/@page-designer/enum';

import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { buildShortUUID } from '/@/utils/uuid';
import { FIELD_TYPE } from '/@/enums/appEnum';

export const columncommonStyle = {
  columnwidthConfigure: tableColumnWidthEnum.ATUO,
  columnwidth: 25,
  columnFontStyleByRule: [],
  columnBackgroundByRule: [],
};
export const columnStyleEditorList: LowCodeWidget.StyleEditor[] = [
  // 字段名称
  {
    component: 'column-width-editor',
    name: { percentage: 'columnwidth', type: 'columnwidthConfigure' },
    label: '',
    group: StyleGroup.LAYOUT,
    hidden: (widget) => {
      return !!widget.preLocation?.includes(FIELD_TYPE.MASTERSLAVE);
    },
    _config: {
      columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.PERCENTAGE],
    },
  },
  {
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
    hidden: (widget) => {
      return !widget.preLocation?.includes(FIELD_TYPE.MASTERSLAVE);
    },
  },
  // {
  //   component: 'font-editor',
  //   name: 'contentFont',
  //   label: 'sys.content',
  //   group: StyleGroup.STYLE,
  //   hidden: (widget) => {
  //     return !widget.preLocation?.includes(FIELD_TYPE.MASTERSLAVE);
  //   },
  // },
  {
    component: 'column-tag-editor',
    name: 'columnFontStyleByRule',
    label: '',
    group: StyleGroup.STYLE,
    _config: {
      generator: getFontStyleRule,
    },
  },
  {
    component: 'column-backgound-editor',
    name: 'columnBackgroundByRule',
    label: '',
    group: StyleGroup.BACKGROUND,
    _config: {
      generator: getbackgroundRule,
    },
  },
];

export const colunmCreate = (widget: ColumnTable | FormulaTable) => {
  widget.style.columnBackgroundByRule = [getbackgroundRule()];
  widget.style.columnFontStyleByRule = [getFontStyleRule()];
};
/**添加样式规则 */
function getFontStyleRule() {
  return {
    id: buildShortUUID('content'),
    displayRule: '',
    contentFont: {
      fontSize: '',
      bold: false,
      italic: false,
      textDecoration: TextDecoration.NONE,
      color: '',
      align: 'left',
    },
    tagStyle: {
      color: '#0DAA9C',
      tagType: TagTypeEnum.RADIUS,
      progressBarType: ProgressTypeEnum.CIRCLE,
    },
    progressStyle: {
      color: '#0DAA9C',
      tagType: ProgressTypeEnum.CIRCLE,
    },
    tagType: tagEnum.TAG,
    tagStyleOpen: false,
  };
}

/**添加背景下规则 */
function getbackgroundRule() {
  return {
    id: buildShortUUID('background'),
    displayRule: '',
    backgroundColor: '',
  };
}
