import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { BuiltinType, Platform, PropGroup } from '/@page-designer/enum';
import { LowCodeModal } from '/@page-designer/types/modal-types';
import { widget as body } from './modal-body';
import { widget as footer } from './modal-footer';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LowCodeModal.Modal = {
  id: '',
  /**默认是WEB 添加的时候会根据当前环境改变 */
  platform: Platform.WEB,
  /**系统用的name */
  alias: '',
  name: 'sys.pageDesigner.modal',
  /**用户新建编辑的name */
  modalName: '',
  type: BuiltinType.MODAL,
  js: '',
  css: '',
  children: [body, footer],
  props: {
    modalTitle: '节点配置',
    modalWidth: 800,
    /**just mobile */
    position: 'bottom',
    modalWidthPercent: 70,
    model: '',
  },
  events: {},
  i18n: {},
  runJs: '',
  los: {},
  icon: 'icon-motaikuang1',
  isField: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'number-editor',
    name: 'modalWidth',
    label: 'sys.pageDesigner.modalWidth',
    group: PropGroup.BASIC,
    // hidden: (widget) => {
    //   return widget.platform === Platform.MOBILE;
    // },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onMounted',
    title: 'sys.pageDesigner.onMounted',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
