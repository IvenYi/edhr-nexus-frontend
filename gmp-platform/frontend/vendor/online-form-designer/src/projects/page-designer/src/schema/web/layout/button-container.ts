import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  ButtonStyle,
  StyleGroup,
  ButtonSize,
} from '/@page-designer/enum';
import { ButtonContainer } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { AGLINE_ENUMS } from '@/enums/designEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ButtonContainer = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.buttonContainer',
  alias: '',
  display: DisplayEnums.BLOCK,
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
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
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
        { label: AGLINE_ENUMS.BETWEEN, value: 'icon-liangduanduiqi1' },
      ],
    },
  },
  {
    component: 'number-editor',
    name: 'margin',
    label: 'sys.pageDesigner.buttonMargin',
    group: PropGroup.ButtonStyle,
    _config: {
      max: 100,
      min: 0,
      addonAfter: 'px',
    },
  },
  {
    component: 'radio-bgc-editor',
    name: 'size',
    label: 'sys.pageDesigner.buttonSize',
    group: PropGroup.ButtonStyle,
    _config: {
      options: Object.values(ButtonSize).map((i) => {
        return { value: i, label: 'sys.pageDesigner.' + i };
      }),
    },
  },
  {
    component: 'button-container-editor',
    name: '',
    label: 'sys.pageDesigner.buttonZone',
    group: PropGroup.BUTTON,
    _config: {
      options(widget) {
        const options = [
          FormComponents.CustomButton,
          FormComponents.SubmitButton,
          FormComponents.RefreshButton,
          FormComponents.ResetButton,
          FormComponents.LabelPrintButton,
          // FormComponents.DocumentPrintButton,
          FormComponents.ProcessButton,
        ];
        if (widget.preLocation?.startsWith('master_slave')) {
          options.push(FormComponents.SubTableAddBtn);
        }
        return options;
      },
    },
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
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
    component: 'tag-editor',
    name: 'tagStyle',
    group: StyleGroup.STYLE,
    hidden: (widget) => {
      return !widget.style.tagStyleOpen;
    },
  },
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
