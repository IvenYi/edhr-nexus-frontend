import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { baseBtnProp } from '../../common-config/base-button-config';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.PDA,
  name: 'sys.pageDesigner.columnLink',
  alias: '',
  type: FormComponents.LinkPageBtn,
  display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-Custom',
  children: [],
  internal: true,
  props: {
    ...baseBtnProp,
    title: '${sys.pageDesigner.columnLink}',
    icon: '',
    type: 'link',
    linkPage: undefined,
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
      defaultValue: 'sys.pageDesigner.columnLink',
    },
  },
  {
    component: 'select-group-editor',
    name: 'linkPage',
    label: 'sys.pageDesigner.linkPage',
    group: PropGroup.BUTTON,
    required: true,
    _config: {
      options: async () => {
        const tree = (await getCategoryListComplete({ module: PageTypeEnum.PAD })) || [];
        return tree.map((i) => {
          const children = i.children?.map((c) => {
            return { label: c.name, value: c.id };
          });
          return { label: i.name, value: i.id, disabled: true, children };
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
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: [],
  },
  {
    name: 'beforeJump',
    title: 'sys.pageDesigner.beforeJump',
    params: [],
  },
  {
    name: 'afterJump',
    title: 'sys.pageDesigner.afterJump',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
