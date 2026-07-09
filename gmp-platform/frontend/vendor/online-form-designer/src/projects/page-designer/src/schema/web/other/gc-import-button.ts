import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { ExportButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
// import { hiddenButtonProps } from '../../common-config/button-props-func';
import { baseBtnProp } from '../../common-config/base-button-config';
import { useAppInfoStore } from '/@/store/modules/app-info';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ExportButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.importbutton',
  alias: '',
  type: FormComponents.ImportButton,
  icon: 'icon-daoru',
  children: [],
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.import',
  props: {
    model: '',
    templateKey: '',
    timeout: 20,
    // basic: buttonProps,
    ...baseBtnProp,
    title: '${sys.import}',
    icon: 'icon-park:afferent-four',
    batchImport: false,
  },
  style: {},
  events: {},
  i18n: {},
  formItem: false,
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
      defaultValue: 'sys.import',
    },
  },
  // {
  //   component: 'model-editor',
  //   name: 'model',
  //   label: 'sys.pageDesigner.model',
  //   group: PropGroup.BUTTON,
  //   required: true,
  //   changeCallback(widget: ExportButton) {
  //     widget.props.templateKey = '';
  //   },
  //   _config: {
  //     type: '',
  //   },
  // },
  {
    component: 'select-editor',
    name: 'templateKey',
    label: 'sys.pageDesigner.importTemplate',
    group: PropGroup.BUTTON,
    required: true,
    hidden: (widget) => !widget.props.model,
    _config: {
      options: async (widget) => {
        if (!widget.props.model) return [];
        const data =
          (await getExcelTmplList({ modelKey: widget.props.model, type: 'IMPORT' })) || [];
        return data
          .filter((e) => !!e.configJson && !!e.version)
          .map((i) => {
            return { value: i.key, label: i.name };
          });
      },
    },
  },
  {
    component: 'switch-editor',
    label: 'sys.pageDesigner.batchImport',
    name: 'batchImport',
    group: PropGroup.BUTTON,
    hidden: () => {
      const appInfoStore = useAppInfoStore();
      const inMedPro = appInfoStore.appInfo.suiteKey === 'MEDPRO';
      return !inMedPro;
    },
  },
  // {
  //   component: 'number-editor',
  //   name: 'timeout',
  //   label: 'sys.pageDesigner.timeout',
  //   group: PropGroup.BUTTON,
  //   hidden: (widget): boolean => {
  //     return hiddenButtonProps(widget);
  //   },
  //   _config: {
  //     addonAfter: 'S',
  //   },
  // },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeImport',
    title: 'sys.pageDesigner.beforeImport',
    params: [],
  },
  {
    name: 'afterImport',
    title: 'sys.pageDesigner.afterImport',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [];
