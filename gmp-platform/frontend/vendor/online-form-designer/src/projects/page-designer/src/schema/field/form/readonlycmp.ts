import {
  FormComponents,
  StyleGroup,
  TagTypeEnum,
  fixedAlignENUM,
  PropGroup,
  Platform,
} from '/@page-designer/enum';
import { ReadonlyCmp } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<ReadonlyCmp, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.ReadonlyCmp,
  icon: '',
  props: {
    ...formItemProps,
    readonly: true,
    fieldReadonly: true,
    fixedAlign: fixedAlignENUM.NONE /**列宽配置 */,
    multiFieldDisplay: false,
    multiFieldConfig: [],
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  // {
  //   component: 'radio-icon-editor',
  //   name: 'fixedAlign',
  //   label: 'sys.pageDesigner.columnFixed',
  //   group: PropGroup.SHOW,
  //   hidden: (widget) => {
  //     console.log('ReadonlyCmp', widget);
  //     return [MaterialEnum.MaterialFormField, MaterialEnum.DescriptionsFormField].includes(
  //       widget.materialType,
  //     );
  //   },
  //   _config: {
  //     options: [
  //       {
  //         label: 'sys.pageDesigner.left',
  //         value: fixedAlignENUM.LEFT,
  //       },
  //       {
  //         label: 'sys.pageDesigner.none',
  //         value: fixedAlignENUM.NONE,
  //       },
  //       {
  //         label: 'sys.pageDesigner.right',
  //         value: fixedAlignENUM.RIGHT,
  //       },
  //     ],
  //   },
  // },
  ...editor,
  {
    component: 'switch-editor',
    name: 'multiFieldDisplay',
    label: '多字段显示',
    required: false,
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return (
        ![FIELD_TYPE.SERIAL].includes(widget.props.fieldType) ||
        widget.materialType !== MaterialEnum.MaterialTableField ||
        widget.platform === Platform.MOBILE
      );
    },
    _config: {
      tooltip: '自定义单元格内容，可以显示多个数据字段',
    },
  },
  {
    component: 'multi-field-config-editor',
    name: 'multiFieldConfig',
    label: '辅助字段',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return !widget.props.multiFieldDisplay;
    },
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
      return !widget.style.tagStyleOpen;
    },
  },
  // {
  //   component: 'color-editor',
  //   name: 'backgroundColor',
  //   label: 'sys.pageDesigner.backgroundColor',
  //   group: StyleGroup.BACKGROUND,
  // },
  // {
  //   component: 'margin-editor',
  //   group: StyleGroup.MARGIN,
  // },
  // {
  //   component: 'border-radius-editor',
  //   group: StyleGroup.BORDER,
  // },
  // {
  //   component: 'border-editor',
  //   group: StyleGroup.BORDER,
  // },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

// export const beforeCreate = (_node: Input) => {};
