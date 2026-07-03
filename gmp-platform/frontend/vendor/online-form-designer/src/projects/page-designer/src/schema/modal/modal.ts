import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { BuiltinType, Platform, PropGroup, StyleGroup } from '/@page-designer/enum';
import { LowCodeModal } from '/@page-designer/types/modal-types';
import { widget as body } from './modal-body';
import { widget as footer } from './modal-footer';
import { buildShortUUID } from '/@/utils/uuid';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LowCodeModal.Modal = {
  id: '',
  /**默认是WEB 添加的时候会根据当前环境改变 */
  platform: Platform.WEB,
  /**系统用的name */
  name: 'sys.pageDesigner.modal',
  alias: '',
  /**用户新建编辑的name */
  modalName: '',
  type: BuiltinType.MODAL,
  js: '',
  css: '',
  children: [body, footer],
  props: {
    modalTitle: '弹窗',
    unitType: 'px',
    modalWidth: 800,

    isSubTableModal: false,
    bindSubTableId: '',
    createModalTitle: '新建弹窗',
    editModalTitle: '编辑弹窗',

    hasFooter: true,
    openMode: 'modal',

    /**just mobile */
    mUnitType: '%',
    mModalWidth: 80,
  },
  style: {
    paddingAll: '16',
    paddingTop: '16',
    paddingRight: '16',
    paddingBottom: '16',
    paddingLeft: '16',
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
    component: 'text-editor',
    name: 'modalTitle',
    label: 'sys.pageDesigner.modalTitleName',
    group: PropGroup.BASIC,
    _config: {
      showCount: true,
      maxlength: 32,
    },
    hidden: (widget) => {
      return widget.props.isSubTableModal;
    },
  },

  {
    component: 'input-unit-editor',
    name: { unitType: 'unitType', modalWidth: 'modalWidth' },
    label: 'sys.pageDesigner.modalWidthProp',
    group: PropGroup.MODAL,
    hidden: (widget) => {
      return widget.platform === Platform.MOBILE;
    },
  },

  {
    component: 'input-unit-editor',
    name: { unitType: 'mUnitType', modalWidth: 'mModalWidth' },
    label: 'sys.pageDesigner.modalHeightProp',
    group: PropGroup.MODAL,
    hidden: (widget) => {
      return widget.platform !== Platform.MOBILE;
    },
    _config: {
      filterUnitType: 'px',
    },
  },

  {
    component: 'text-editor',
    name: 'createModalTitle',
    label: 'sys.pageDesigner.createModalTitle',
    group: PropGroup.MODALTITLECONFIG,
    _config: {
      i18n: true,
    },
    hidden: (widget) => {
      return !widget.props.isSubTableModal;
    },
  },

  {
    component: 'text-editor',
    name: 'editModalTitle',
    label: 'sys.pageDesigner.editModalTitle',
    group: PropGroup.MODALTITLECONFIG,
    _config: {
      i18n: true,
    },
    hidden: (widget) => {
      return !widget.props.isSubTableModal;
    },
  },
  {
    component: 'select-editor',
    name: 'openMode',
    label: 'sys.appDesigner.openMode',
    group: PropGroup.MODAL,
    hidden: (widget) => {
      return widget.platform !== Platform.WEB;
    },
    _config: {
      options: () => {
        return [
          {
            label: '打开弹窗页面',
            value: 'modal',
          },
          {
            label: '右侧划入页面',
            value: 'drawer',
          },
        ];
      },
    },
    changeCallback: (widget, value) => {
      if (value === 'drawer') {
        widget.props.unitType = '%';
        widget.props.modalWidth = 80;
      } else {
        widget.props.unitType = 'px';
        widget.props.modalWidth = 800;
      }
    },
  },
  {
    component: 'switch-editor',
    name: 'hasFooter',
    label: 'sys.pageDesigner.operateButton',
    group: PropGroup.BUTTON,
    hidden: (widget) => {
      return widget.props.isSubTableModal;
    },
  },
];

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
    _config: {
      hiddenMarginOrPadding: 'margin',
    },
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
export const beforeCreate = (widget: LowCodeModal.Modal) => {
  widget.children[0].id = buildShortUUID(widget.children[0].type);
  widget.children[1].id = buildShortUUID(widget.children[1].type);
};

export const designerConfig: LowCodeWidget.DesignerConfig = {
  basicProps: {
    key_label: '弹窗',
    alias_hidden: true,
  },
};
