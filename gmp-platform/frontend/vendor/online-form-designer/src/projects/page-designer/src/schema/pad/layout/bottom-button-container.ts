import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  ButtonStyle,
  StyleGroup,
  ButtonSize,
} from '/@page-designer/enum';
import { BottomButtonContainer } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
import { useDesigner } from '../../../hooks/useDesigner';
import { findNodeAll } from '/@/utils/helper/treeHelper';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BottomButtonContainer = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.operateButton',
  alias: '',
  display: DisplayEnums.BLOCK,
  // internal: true,
  type: FormComponents.BottomButtonContainer,
  icon: 'icon-anniuzu',
  children: [],
  props: {
    buttonStyle: ButtonStyle.ORDINARY,
    /**主轴方向 */
    margin: 8,
    size: ButtonSize.DEFAULT,
    enableProcess: false,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'number-editor',
    name: 'margin',
    label: 'sys.pageDesigner.buttonMargin',
    group: PropGroup.ButtonStyle,
    _config: {
      addonAfter: 'px',
      min: 0,
      max: 16,
    },
    hidden: (widget) => {
      return widget?.children!.length < 2;
    },
  },
  // {
  //   component: 'switch-editor',
  //   name: 'enableProcess',
  //   label: 'sys.pageDesigner.processButtonGroup',
  //   group: PropGroup.BUTTON,
  //   changeCallback: (widget, val) => {
  //     if (val) {
  //       const btns = Object.values(ButtonTypeEnum).map((k) => {
  //         const node = createWidgetByType(FormComponents.ProcessApproveButton);
  //         const name = $t('sys.process.paasBpmnButtonEvent.' + k);
  //         node.props.title = name;
  //         node.alias = name;
  //         node.props.action = k;
  //         node.preLocation = widget.id;
  //         node.name = 'sys.process.paasBpmnButtonEvent.' + k;
  //         return node;
  //       });
  //       widget.children.unshift(...btns);
  //     } else {
  //       widget.children = widget.children.filter(
  //         (e) => e.type !== FormComponents.ProcessApproveButton,
  //       );
  //     }
  //   },
  // },
  {
    component: 'select-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refProcessForm',
    group: PropGroup.BUTTON,
    required: true,
    hidden: (widget) => {
      return !widget.props.enableProcess;
    },
    _config: {
      options: async () => {
        const { getWidgetByScope } = useDesigner();
        return getWidgetByScope(FormComponents.FormProcess)
          .filter((i) => i.props.model)
          .map((i) => {
            return { label: `${$t(i.alias)} ${i.id}`, value: i.id, model: i.props.model };
          });
      },
    },
  },
  {
    component: 'gct-button-group-editor',
    name: 'root:children',
    label: 'sys.pageDesigner.buttonZone',
    group: PropGroup.BUTTON,
    _config: {
      options: () => [
        FormComponents.CustomButton,
        FormComponents.SubmitButton,
        FormComponents.ResetButton,
        FormComponents.ExcuteButton,
      ],
    },
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node, modal) => {
  const { getWidgetByScope } = useDesigner();
  const process = modal
    ? findNodeAll(modal.children, (v) => v.type === FormComponents.FormProcess)
    : getWidgetByScope(FormComponents.FormProcess);
  const refForm = _node.props.refForm;
  const formwidget = process?.find((i) => i.id === refForm);
  const processId = formwidget?.props?.processId;
  if (!processId) return;
  _node.props.processId = processId;
  _node.children.length &&
    _node.children.forEach((w) => {
      if (w.type === FormComponents.ProcessApproveButton) {
        w.props.processId = processId;
        w.props.refForm = refForm;
      }
    });
};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [
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
