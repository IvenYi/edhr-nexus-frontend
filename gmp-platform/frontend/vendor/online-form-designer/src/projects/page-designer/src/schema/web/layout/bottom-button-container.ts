import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
  ButtonSize,
  ButtonStyle,
} from '/@page-designer/enum';
import { BottomButtonContainer } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { AGLINE_ENUMS } from '@/enums/designEnum';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
import { createWidgetByType } from '../../utils';
import { useDesigner } from '../../../hooks/useDesigner';
import { findNodeAll } from '/@/utils/helper/treeHelper';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BottomButtonContainer = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.operateButton',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.BottomButtonContainer,
  icon: 'icon-anniuzu',
  children: [],
  props: {
    /**对齐方式 */
    align: AGLINE_ENUMS.LEFT,
    /**主轴方向 */
    margin: 16,
    size: ButtonSize.DEFAULT,
    buttonStyle: ButtonStyle.ORDINARY,
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
      max: 100,
      min: 0,
      addonAfter: 'px',
    },
    hidden: (widget) => {
      if (!widget || !widget.children) {
        return false;
      }
      return widget.children.length < 2;
    },
  },
  {
    component: 'switch-editor',
    name: 'enableProcess',
    label: 'sys.pageDesigner.processButton',
    group: PropGroup.BUTTON,
    changeCallback: (widget, val) => {
      if (val) {
        const btns = Object.values(ButtonTypeEnum).map((k) => {
          const node = createWidgetByType(FormComponents.ProcessApproveButton);
          const name = $t('sys.process.paasBpmnButtonEvent.' + k);
          node.props.title = name;
          node.alias = name;
          node.props.action = k;
          node.preLocation = widget.id;
          node.name = 'sys.process.paasBpmnButtonEvent.' + k;
          return node;
        });
        widget.children.unshift(...btns);
      } else {
        widget.children = widget.children.filter(
          (e) => e.type !== FormComponents.ProcessApproveButton,
        );
      }
    },
  },
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
            console.log('map=-=-', i);
            return { label: `${$t(i.alias)} ${i.id}`, value: i.id, model: i.props.model };
          });
      },
    },
  },
  {
    component: 'button-container-editor',
    name: '',
    label: 'sys.pageDesigner.buttonZone',
    group: PropGroup.BUTTON,
    _config: {
      options: () => {
        const { appInfo } = useAppInfoStore();
        if (appInfo.suiteKey === 'MEDPRO') {
          return [
            FormComponents.CustomButton,
            FormComponents.SubmitButton,
            FormComponents.ResetButton,
            FormComponents.ExcuteButton,
            FormComponents.ProcessButton,
          ];
        } else {
          return [
            FormComponents.CustomButton,
            FormComponents.SubmitButton,
            FormComponents.ResetButton,
            FormComponents.ProcessButton,
          ];
        }
      },
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
