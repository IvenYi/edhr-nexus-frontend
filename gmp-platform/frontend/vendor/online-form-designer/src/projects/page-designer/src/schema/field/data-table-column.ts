import {
  tableColumnWidthEnum,
  BindCmpStyleEnum,
  fixedAlignENUM,
  PropGroup,
  StyleGroup,
  TagTypeEnum,
  Platform,
  searchListByFieldType,
  TextDecoration,
  ProgressTypeEnum,
  tagEnum,
  FormComponents,
} from '/@page-designer/enum';
import { ColumnTable, FormulaTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import { merge } from 'lodash-es';
import { createdSearchField } from '/@page-designer/schema/utils';
import { useI18n } from '/@/hooks/web/useI18n';
import columnEditorConfig from '../common-config/column-editor-config';
import { buildShortUUID } from '/@/utils/uuid';

/**字段拖入表格内的逻辑 */
interface WidgetSchemas extends Omit<ColumnTable, 'props'> {
  props: PartialByKeys<ColumnTable['props'], 'fieldType'>;
}
const { t } = useI18n();

const columns = {
  props: {
    fixedAlign: fixedAlignENUM.NONE,
    embeddedSearch: false,
  },
  style: {
    columnwidthConfigure: tableColumnWidthEnum.ATUO,
    columnwidth: 100,
    columnFontStyleByRule: [],
    columnBackgroundByRule: [],
  },
  // formItem: false,
};

const tempComponent = [];

export function runWidget(widget: LowCodeWidget.FieldSchema): ColumnTable {
  const columnWidget = merge({}, { ...widget }, columns);
  if (widget.platform === Platform.MOBILE) {
    /**移动端汇总字段 */
    columnWidget.style.columnwidth = 25;
    columnWidget.style.columnwidthConfigure = tableColumnWidthEnum.ATUO;
    return columnWidget;
  }
  /** bindFieldKey 存在必然是关联模型关联字段 不需要内嵌搜索*/
  columnWidget.props.embeddedSearch = !columnWidget.props.bindFieldKey;
  const searchField = searchListByFieldType.includes(widget.props.fieldType!);
  if (searchField && columnWidget.props.embeddedSearch) {
    if (!tempComponent.includes(widget.props.fieldType!)) {
      const search = createdSearchField(widget.props);
      if (search) {
        search.alias = t('sys.pageDesigner.embeddedSearch');
        columnWidget.children = [search];
        search.materialType = MaterialEnum.MaterialTableField;
      }
    }
    columnWidget.props.readonly = true;
    columnWidget.props.required = false;
  }
  if (!searchField) {
    columnWidget.props.readonly = true;
    columnWidget.props.embeddedSearch = false;
    columnWidget.props.required = false;
    widget.props.fieldType === FIELD_TYPE.SERIAL && (columnWidget.props.fieldReadonly = true);
  }
  return columnWidget;
}

export function runSubtableFieldWidget(widget: LowCodeWidget.FieldSchema) {
  const columnWidget = merge({}, { ...widget }, columns);
  return columnWidget;
}

export function webRunPropEditor(list: LowCodeWidget.PropEditor[]) {
  return [
    ...list,
    ...columnEditorConfig.fixedAlignEditor,
    {
      component: 'radio-display-editor',
      name: 'displayType',
      label: 'sys.pageDesigner.displayStyle',
      group: PropGroup.SHOW,
      // dependentProps: ['readonly'],
      _config: {
        options: [
          {
            icon: 'paperclip',
            label: 'sys.pageDesigner.oneFile',
            value: 'concise',
          },
          {
            icon: 'fujian',
            label: 'sys.pageDesigner.fileName',
            value: 'more',
          },
        ],
      },
      hidden(widget: WidgetSchemas) {
        if (widget.props.fieldType !== FIELD_TYPE.ATTACHMENT) {
          return true;
        }
      },
    },
    {
      component: 'max-display-editor',
      name: 'displayMaxNum',
      label: 'sys.pageDesigner.displayMaxNum',
      group: PropGroup.SHOW,
      // dependentProps: ['readonly'],
      _config: {
        min: 1,
        max: 20,
        precision: 0,
      },
      hidden(widget: WidgetSchemas) {
        if (widget.props.fieldType !== FIELD_TYPE.IMAGE) {
          return true;
        }
      },
    },
  ];
}

const styleUtils = {
  columnWidthEditor: [
    {
      component: 'column-width-editor',
      name: { number: 'columnwidth', type: 'columnwidthConfigure' },
      label: '',
      group: StyleGroup.LAYOUT,
      _config: {
        columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.ENUMERATION],
      },
      hidden(widget: WidgetSchemas) {
        return widget.platform == Platform.MOBILE;
      },
    },
    {
      component: 'column-width-editor',
      name: { percentage: 'columnwidth', type: 'columnwidthConfigure' },
      label: '',
      group: StyleGroup.LAYOUT,
      _config: {
        columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.PERCENTAGE],
      },
      hidden(widget: WidgetSchemas) {
        return widget.platform === Platform.WEB || widget.platform === Platform.PAD;
      },
    },
  ],
  labelFontEditor: [
    {
      component: 'font-editor',
      name: 'labelFont',
      label: 'sys.name',
      group: StyleGroup.STYLE,
      hidden(widget: WidgetSchemas) {
        return widget.platform === Platform.PAD;
      },
    },
  ],
  contentFontEditor: [
    {
      component: 'font-editor',
      name: 'contentFont',
      label: 'sys.content',
      group: StyleGroup.STYLE,
      hidden(widget: WidgetSchemas) {
        if (
          widget.props?.fieldType == FIELD_TYPE.DATA_TABLE_FORMULA ||
          widget.type == FormComponents.DataTableFormula
        ) {
          return true;
        }
        return [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE, FIELD_TYPE.SIGNATURE].includes(
          widget.props.fieldType as FIELD_TYPE,
        );
      },
      _config: {
        hiddenColor: true, //隐藏颜色
      },
    },
  ],
  tagEditor: [
    {
      component: 'boolean-editor',
      name: 'tagStyleOpen',
      label: 'sys.pageDesigner.tagStyle',
      group: StyleGroup.STYLE,
      hidden(widget: WidgetSchemas) {
        if (
          [FIELD_TYPE.BOOLEAN, FIELD_TYPE.EXPRESSION].includes(
            widget.props.fieldType as FIELD_TYPE,
          ) &&
          widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN
        ) {
          return true;
        }
        if (
          widget.props?.fieldType == FIELD_TYPE.DATA_TABLE_FORMULA ||
          widget.type == FormComponents.DataTableFormula
        ) {
          return true;
        }
        return [
          FIELD_TYPE.ATTACHMENT,
          FIELD_TYPE.IMAGE,
          FIELD_TYPE.RDO_REF,
          FIELD_TYPE.SIGNATURE,
        ].includes(widget.props.fieldType as FIELD_TYPE);
      },
      _config: {
        showType: 'checkbox',
        options: [
          {
            label: 'sys.pageDesigner.configureContentAsLabelStyle',
            value: true,
          },
        ],
      },
      changeCallback: (widget, value) => {
        if (value && !widget.style.tagStyle) {
          widget.style.tagStyle = {
            color: '',
            tagType: TagTypeEnum.RADIUS,
          };
        }
      },
    },
    {
      component: 'tag-editor',
      name: 'tagStyle',
      group: StyleGroup.STYLE,
      hidden: (widget) => {
        if (
          [FIELD_TYPE.BOOLEAN, FIELD_TYPE.EXPRESSION].includes(
            widget.props.fieldType as FIELD_TYPE,
          ) &&
          widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN
        ) {
          return true;
        }

        if (
          [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE, FIELD_TYPE.RDO_REF].includes(
            widget.props.fieldType as FIELD_TYPE,
          )
        ) {
          return true;
        }

        if (
          widget.props?.fieldType == FIELD_TYPE.DATA_TABLE_FORMULA ||
          widget.type == FormComponents.DataTableFormula
        ) {
          return true;
        }

        return !widget.style.tagStyleOpen;
      },
    },
  ],
  columnFormulaStyleByRule: [
    {
      component: 'column-tag-editor',
      name: 'columnFontStyleByRule',
      label: '',
      group: StyleGroup.STYLE,
      _config: {
        generator: getFontStyleRule,
      },
      hidden(widget: WidgetSchemas) {
        const isFormula =
          widget.props?.fieldType == FIELD_TYPE.DATA_TABLE_FORMULA ||
          widget.type == FormComponents.DataTableFormula;
        return !isFormula;
      },
    },
    {
      component: 'column-backgound-editor',
      name: 'columnBackgroundByRule',
      label: '',
      group: StyleGroup.BACKGROUND,
      _config: {
        generator: getBackgroundRule,
      },
      hidden(widget: WidgetSchemas) {
        const isFormula =
          widget.props?.fieldType == FIELD_TYPE.DATA_TABLE_FORMULA ||
          widget.type == FormComponents.DataTableFormula;
        return !isFormula;
      },
    },
  ],
};

export function runStyleEditor(): LowCodeWidget.StyleEditor[] {
  return [
    ...styleUtils.columnWidthEditor,
    ...styleUtils.contentFontEditor,
    ...styleUtils.tagEditor,
    ...styleUtils.columnFormulaStyleByRule,
  ] as LowCodeWidget.StyleEditor[];
}

export function mobileRunSubTableStyleEditor(): LowCodeWidget.StyleEditor[] {
  return [
    {
      component: 'column-width-editor',
      name: { number: 'columnwidth', type: 'columnwidthConfigure' },
      label: '',
      group: StyleGroup.LAYOUT,
      _config: {
        columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.ENUMERATION],
      },
      hidden(widget: WidgetSchemas) {
        return widget.platform == Platform.MOBILE;
      },
    },
    ...styleUtils.labelFontEditor,
    ...styleUtils.contentFontEditor,
    ...styleUtils.tagEditor,
    ...styleUtils.columnFormulaStyleByRule,
  ] as LowCodeWidget.StyleEditor[];
}

export function runEventEditor(list: LowCodeWidget.EventsType[]) {
  return [];
}

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
function getBackgroundRule() {
  return {
    id: buildShortUUID('background'),
    displayRule: '',
    backgroundColor: '',
  };
}
