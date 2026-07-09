import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  ButtonStyle,
  StyleGroup,
  ButtonSize,
} from '/@page-designer/enum';
import { ButtonProcessContainer } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { AGLINE_ENUMS } from '@/enums/designEnum';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
import { findNodeAll } from '/@/utils/helper/treeHelper';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ButtonProcessContainer = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.processButtonGroup',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.ButtonProcessContainer,
  icon: 'icon-anniuzu',
  children: [],
  props: {
    refForm: '',
    processId: '',
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
    component: 'select-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refProcessForm',
    group: PropGroup.BUTTON,
    required: true,
    _config: {
      selectChange(widget, value) {
        widget.children.forEach((i) => {
          i.props.refForm = value;
        });
      },
      options: async (widget) => {
        const { getWidgetByScope } = useDesigner();
        return getWidgetByScope(FormComponents.FormProcess)
          .filter((i) => i.props.model)
          .map((i) => {
            return { label: `${$t(i.alias)} ${i.id}`, value: i.id };
          });
      },
    },
  },
  {
    component: 'align-editor',
    name: 'align',
    label: 'sys.pageDesigner.align',
    group: PropGroup.ButtonStyle,
    hidden: (widget) => !widget.props.refForm,
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
    hidden: (widget) => !widget.props.refForm,
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
    hidden: (widget) => !widget.props.refForm,
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
    hidden: (widget) => !widget.props.refForm,
    _config: {
      options: [FormComponents.CustomButton],
    },
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

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
export const beforeCreate: LowCodeWidget.beforeCreate = (node: ButtonProcessContainer) => {
  node.children = Object.values(ButtonTypeEnum).map((k) => {
    const widget = createWidgetByType(FormComponents.ProcessApproveButton);
    const name = $t('sys.process.paasBpmnButtonEvent.' + k);
    widget.props.title = name;
    widget.alias = name;
    widget.props.action = k;
    widget.preLocation = node.id;
    widget.name = 'sys.process.paasBpmnButtonEvent.' + k;
    return widget;
  });

  // createWidgetByType
};

export const runCallback: LowCodeWidget.RunCallback = (widget, modal) => {
  //按钮绑定流程id
  const { getWidgetByScope } = useDesigner();
  const process = modal
    ? findNodeAll(modal.children, (v) => v.type === FormComponents.FormProcess)
    : getWidgetByScope(FormComponents.FormProcess);
  const refForm = widget.props.refForm;
  const formWidget = process?.find((i) => i.id === refForm);
  const processId = formWidget?.props?.processId;
  if (!processId) return;
  widget.props.processId = processId;
  widget.children.forEach((i) => {
    if (i.props) {
      i.props.processId = processId;
    } else if (i.children) {
      i.children.forEach((j) => {
        j.props.processId = processId;
      });
    }
  });
};
