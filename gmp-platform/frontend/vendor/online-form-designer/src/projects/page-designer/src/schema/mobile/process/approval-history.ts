import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { ApprovalHistory } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { useDesigner } from '../../../hooks/useDesigner';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ApprovalHistory = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.approvalHistory',
  alias: '',
  type: FormComponents.ApprovalHistory,
  display: DisplayEnums.BLOCK,
  icon: 'icon-biaodan',
  children: [],
  props: {
    processId: '',
    title: '审批历史',
    showTitle: true,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
  ignoringStyle: [],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'title-enable-editor',
    name: { title: 'title', showTitle: 'showTitle' },
    label: '',
    group: PropGroup.BUSINESS_CONFIG,
  },
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
  {
    component: 'switch-editor',
    name: 'showOpinion',
    label: 'sys.pageDesigner.showOpinion',
    group: PropGroup.BUSINESS_CONFIG,
  },
  {
    component: 'switch-editor',
    name: 'showSignature',
    label: 'sys.pageDesigner.showSignature',
    group: PropGroup.BUSINESS_CONFIG,
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
