import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  BindCmpStyleTypeEnum,
  TagTypeEnum,
  BindCmpStyleEnum,
} from '/@page-designer/enum';
import { FIELD_TYPE } from '@/enums/appEnum';
import { GenSwitch } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor as editor, displayProps } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: GenSwitch = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.switch',
  alias: '',
  type: FormComponents.GenSwitch,
  icon: 'icon-kaiguan',
  props: {
    label: '${sys.pageDesigner.switch}',
    defaultValue: true,
    truelabel: '真',
    falselabel: '假',
    bindCompStyleType: 'BOOLEAN',
    fieldType: 'boolean',
    disabled: false,
    displayLabelText: true,
    ...displayProps,
  },
  style: {},
  events: {},
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'custom-name-editor',
    name: 'label',
    label: 'sys.pageDesigner.title',
    formItemStyle: { marginBottom: '12px' },
    group: PropGroup.GENSWITCH,
    changeCallback(widget) {
      // widget.alias = widget.props.label;
    },
    _config: {
      formItemCheckbox: {
        label: 'sys.pageDesigner.displayLabelText',
        propsKey: 'displayLabelText'
      }
    },
  },
  {
    component: 'boolean-editor',
    name: { truevalue: 'truelabel', falsevalue: 'falselabel' },
    label: 'sys.pageDesigner.booleanOptions',
    group: PropGroup.GENSWITCH,
    required: true,
  },
  // 布尔的默认值
  {
    component: 'select-editor',
    name: 'defaultValue',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.GENSWITCH,
    _config: {
      clearable: false,
      supportGlobData: true,
      options: async (widget) => {
        return [
          { label: widget.props.truelabel || '真', value: true },
          { label: widget.props.falselabel || '假', value: false },
        ];
      },
    },
  },
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: BindCmpStyleTypeEnum.BindBool,
    groupName: PropGroup.GENSWITCH,
  }),
  ...editor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'row'],
  },
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
  },
  {
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
  },
  {
    component: 'boolean-editor',
    name: 'tagStyleOpen',
    label: 'sys.pageDesigner.tagStyle',
    group: StyleGroup.STYLE,
    hidden(widget) {
      if (
        [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE, FIELD_TYPE.RDO_REF].includes(
          widget.props.fieldType,
        )
      ) {
        return true;
      }
      if (
        [FormComponents.GenSwitch, FormComponents.Switch, FormComponents.EXPRESSION].includes(
          widget.type,
        )
      ) {
        return widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN;
      }
      return false;
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
        [FormComponents.GenSwitch, FormComponents.Switch, FormComponents.EXPRESSION].includes(
          widget.type,
        ) &&
        widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN
      ) {
        return true;
      }
      return !widget.style.tagStyleOpen;
    },
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
