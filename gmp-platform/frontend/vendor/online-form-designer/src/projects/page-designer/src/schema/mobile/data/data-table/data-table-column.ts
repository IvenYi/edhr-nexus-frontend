import {
  Platform,
  fixedAlignENUM,
  BindCmpStyleEnum,
  FormComponents,
  PropGroup,
  StyleGroup,
  tableColumnWidthEnum,
  BindCmpStyleTypeEnum,
  TagTypeEnum,
} from '/@page-designer/enum';
import { ColumnTable } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../../common-config/common-field-editor-config';
import { FIELD_TYPE } from '/@/enums/appEnum';

interface WidgetSchemas extends Omit<ColumnTable, 'props'> {
  props: PartialByKeys<ColumnTable['props'], 'fieldType'>;
}

export const widget: ColumnTable = {
  //字段标识
  id: '',
  //字段显示类型
  type: FormComponents.DataTableColumn,
  // 国际化信息
  i18n: {},
  name: '',
  alias: '',
  icon: '',
  platform: Platform.MOBILE,
  isField: true,
  props: {
    fieldId: '',
    fieldType: undefined,
    field: '',
    label: '',
    modelKey: '',
    bindModelKey: undefined,
    bindFieldKey: '',
    fixedAlign: fixedAlignENUM.NONE,
    fieldCodeChain: '',
    fieldName: '',
    returnType: undefined,
    ...displayProps,
  },
  style: {
    columnwidthConfigure: tableColumnWidthEnum.ATUO,
    columnwidth: 25,
  },
  preLocation: '',
  events: {},
  formItem: false,
};
export const propEditorList: LowCodeWidget.PropEditor[] = [
  // 字段名称
  {
    component: 'custom-name-editor',
    name: 'label',
    label: 'sys.pageDesigner.fieldTitle',
    group: PropGroup.BASIC,
  },

  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: (widget) => {
      if (FIELD_TYPE.BOOLEAN === widget.props.fieldType) {
        return BindCmpStyleTypeEnum.BindBool;
      } else if ([FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.REF_MULTI].includes(widget.props.fieldType)) {
        return BindCmpStyleTypeEnum.BindMulti;
      } else {
        return BindCmpStyleTypeEnum.BindLink;
      }
    },
    hiddenCallback(widget) {
      return ![
        FIELD_TYPE.BOOLEAN,
        FIELD_TYPE.ENUM_MULTI,
        FIELD_TYPE.ENUM,
        FIELD_TYPE.REF_MULTI,
        FIELD_TYPE.REF,
      ].includes(widget.props.fieldType);
    },
  }),
  ...displayEditor,
];
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'column-width-editor',
    name: { percentage: 'columnwidth', type: 'columnwidthConfigure' },
    label: '',
    group: StyleGroup.LAYOUT,
    _config: {
      columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.PERCENTAGE],
    },
  },
  {
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
    hidden(widget: WidgetSchemas) {
      return [
        FIELD_TYPE.ATTACHMENT,
        FIELD_TYPE.IMAGE,
        FIELD_TYPE.ENUM,
        FIELD_TYPE.ENUM_MULTI,
      ].includes(widget.props.fieldType as FIELD_TYPE);
    },
  },
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
      return [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE, FIELD_TYPE.RDO_REF].includes(
        widget.props.fieldType as FIELD_TYPE,
      );
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

      return !widget.style.tagStyleOpen;
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const beforeCreate = (widget: ColumnTable) => {
  // colunmCreate(widget);
};
