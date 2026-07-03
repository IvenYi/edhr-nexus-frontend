import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { FlowDiagram } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { useDesigner } from '../../../hooks/useDesigner';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: FlowDiagram = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.flowDiagram',
  alias: '',
  type: FormComponents.FlowDiagram,
  display: DisplayEnums.BLOCK,
  icon: 'icon-a-liuchengtu10',
  children: [],
  props: {
    processId: '',
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
  ignoringStyle: [],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'select-editor',
    name: 'refForm',
    label: 'sys.pageDesigner.refProcessForm',
    group: PropGroup.BUSINESS_CONFIG,
    required: true,
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
  ...displayEditor,
];
export const styleEditorList: LowCodeWidget.StyleEditor[] = [];
export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {
  // const { getWidgetByScope } = useDesigner();
  // const process = getWidgetByScope(FormComponents.FormProcess);
  // const refForm = _node.props.refForm;
  // const formwidget = process?.find((i) => i.id === refForm);
  // const processId = formwidget?.props.processId;
  // _node.props.processId = processId;
};
export const blackList: (string | RegExp)[] = [];
