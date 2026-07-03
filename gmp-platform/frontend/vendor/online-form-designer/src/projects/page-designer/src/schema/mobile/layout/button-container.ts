import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  ButtonStyle,
  StyleGroup,
  ButtonSize,
} from '/@page-designer/enum';
import { ButtonContainer } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { AGLINE_ENUMS } from '@/enums/designEnum';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ButtonContainer = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.buttonContainer',
  alias: '',
  display: DisplayEnums.BLOCK,
  // internal: true,
  type: FormComponents.ButtonContainer,
  icon: 'icon-anniuzu',
  children: [],
  props: {
    buttonStyle: ButtonStyle.ORDINARY,
    /**对齐方式 */
    align: AGLINE_ENUMS.LEFT,
    /**主轴方向 */
    margin: 8,
    size: ButtonSize.DEFAULT,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  // {
  //   component: 'select-editor',
  //   name: 'buttonStyle',
  //   label: 'sys.pageDesigner.buttonStyle',
  //   group: PropGroup.ButtonStyle,
  //   _config: {
  //     options: Object.values(ButtonStyle).map((key) => {
  //       return { label: 'sys.pageDesigner.' + key, value: key };
  //     }),
  //   },
  // },
  {
    component: 'align-editor',
    name: 'align',
    label: 'sys.pageDesigner.align',
    group: PropGroup.ButtonStyle,
    _config: {
      options: [
        { label: AGLINE_ENUMS.LEFT, value: 'icon-PicLeft' },
        { label: AGLINE_ENUMS.CENTER, value: 'icon-center' },
        { label: AGLINE_ENUMS.RIGHT, value: 'icon-PicRight' },
        // { label: AGLINE_ENUMS.BETWEEN, value: 'icon-liangduanduiqi' },
      ],
    },
  },
  {
    component: 'number-editor',
    name: 'margin',
    label: 'sys.pageDesigner.buttonMargin',
    group: PropGroup.ButtonStyle,
    _config: {
      addonAfter: 'px',
      min: 0,
      max: 100,
    },
  },
  {
    component: 'button-container-editor',
    name: '',
    label: 'sys.pageDesigner.buttonZone',
    group: PropGroup.BUTTON,
    _config: {
      options: [
        FormComponents.CustomButton,
        FormComponents.SubmitButton,
        FormComponents.ResetButton,
      ] as any,
    },
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
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
  // {
  //   component: 'number-editor',
  //   name: 'height',
  //   label: 'sys.height',
  //   group: StyleGroup.LAYOUT,
  // },
  // {
  //   component: 'font-editor',
  //   name: 'labelFont',
  //   label: 'sys.name',
  //   group: StyleGroup.STYLE,
  // },
  // {
  //   component: 'font-editor',
  //   name: 'contentFont',
  //   label: 'sys.content',
  //   group: StyleGroup.STYLE,
  // },
  // {
  //   component: 'boolean-editor',
  //   name: 'tagStyleOpen',
  //   label: 'sys.pageDesigner.tagStyle',
  //   group: StyleGroup.STYLE,
  //   _config: {
  //     showType: 'checkbox',
  //     options: [
  //       {
  //         label: 'sys.pageDesigner.configureContentAsLabelStyle',
  //         value: true,
  //       },
  //     ],
  //   },
  // },
  // {
  //   component: 'tag-editor',
  //   name: 'tagStyle',
  //   group: StyleGroup.STYLE,
  //   hidden: (widget) => {
  //     return !widget.style.tagStyleOpen;
  //   },
  // },
  {
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
  {
    component: 'border-radius-editor',
    group: StyleGroup.BORDER,
  },
  {
    component: 'border-editor',
    group: StyleGroup.BORDER,
  },
];

export const whiteList: (string | RegExp)[] = [/^(.*)-button$/];
