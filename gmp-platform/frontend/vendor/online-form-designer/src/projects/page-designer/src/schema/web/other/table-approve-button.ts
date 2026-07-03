import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { TableApproveButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { buttonProps, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
import { openWindowEnums, FIELD_TYPE } from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { getCompPos } from '/@page-designer/schema/utils';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: TableApproveButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.approve',
  alias: '',
  type: FormComponents.TableApproveButton,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-Custom',
  children: [],
  internal: true,
  props: {
    ...baseBtnProp,
    title: '${sys.pageDesigner.approve}',
    icon: '',
    type: 'link',
    refModal: '',
    refForm: '',
    openType: openWindowEnums.OPEN,
  },
  style: {},
  events: {},
  formItem: false,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.title',
    group: PropGroup.BUTTON,
    _config: {
      i18n: true,
      maxlength: 10,
      showCount: true,
      defaultValue: 'sys.pageDesigner.approve'
    },
  },
  {
    component: 'radio-editor',
    name: 'openType',
    label: 'sys.pageDesigner.approvalMethod',
    group: PropGroup.BUTTON,
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.openThePopUpBox',
          value: openWindowEnums.OPEN,
        },
        {
          label: 'sys.pageDesigner.jumpToApprovalPage',
          value: openWindowEnums.APPROVE,
        },
      ],
    },
  },
  {
    component: 'select-editor',
    name: 'refModal',
    label: 'sys.pageDesigner.modalBox',
    group: PropGroup.BUTTON,
    required: true,
    hidden(widget) {
      return widget.props.openType !== openWindowEnums.OPEN;
    },
    changeCallback(widget) {
      widget.props.refForm = undefined;
    },
    _config: {
      options: () => {
        const { pageJson } = useDesigner();
        return pageJson.modals.map((i) => {
          return { label: `${$t(i.modalName)}[${i.id}] `, value: i.id };
        });
      },
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeClick',
    title: 'sys.pageDesigner.beforeClick',
    params: [],
  },
  {
    name: 'afterClick',
    title: 'sys.pageDesigner.afterClick',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
