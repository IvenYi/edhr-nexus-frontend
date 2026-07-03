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

export const columncommonStyle = {
  columnwidthConfigure: tableColumnWidthEnum.ATUO,
  columnwidth: 100,
  columnFontStyleByRule: [],
  columnBackgroundByRule: [],
};
export const columnStyleEditorList: LowCodeWidget.StyleEditor[] = [
  // 字段名称
  {
    component: 'column-width-editor',
    name: { number: 'columnwidth', type: 'columnwidthConfigure' },
    label: '',
    group: StyleGroup.LAYOUT,
    _config: {
      columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.ENUMERATION],
    },
  },
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
