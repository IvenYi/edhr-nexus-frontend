import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { ExportButton } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor } from '../../common-config/display-editor-config';
import { getExcelTmplList } from '/@/apis/gct-apaas/ExcelTmplController';
import { buttonStyleEditor, buttonEditor } from '../../common-config/button-editor-config';
import { permissionEditor } from '../../common-config/permission-editor-config';
import { hiddenButtonProps } from '../../common-config/button-props-func';
import { baseBtnProp } from '../../common-config/base-button-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: ExportButton = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.exportbutton',
  alias: '',
  type: FormComponents.ExportButton,
  icon: 'icon-daochu',
  children: [],
  display: DisplayEnums.INLINE_BLOCK,
  displayName: 'sys.pageDesigner.toolkitButton.export',
  props: {
    ...baseBtnProp,
    model: '',
    templateKey: '',
    timeout: 20,
    title: '${sys.export}',
    icon: 'icon-park:efferent-four',
    refTable: '',
    // ...displayProps,
    // basic: buttonProps,
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
      defaultValue: 'sys.export',
    },
  },
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.BUTTON,
    required: true,
    changeCallback(widget: ExportButton) {
      widget.props.templateKey = '';
    },
    _config: {
      type: '',
    },
  },
  {
    component: 'select-editor',
    name: 'templateKey',
    label: 'sys.pageDesigner.exportTemplate',
    group: PropGroup.BUTTON,
    hidden: (widget) => !widget.props.model,
    _config: {
      options: async (widget) => {
        if (!widget.props.model) return [];
        const data =
          (await getExcelTmplList({ modelKey: widget.props.model, type: 'EXPORT' })) || [];
        return data
          .filter((e) => !!e.configJson && !e.version)
          .map((i) => {
            return { value: i.key, label: i.name };
          });
      },
    },
  },
  {
    component: 'select-editor',
    name: 'refTable',
    label: 'sys.pageDesigner.refTable',
    group: PropGroup.BUTTON,
    dependentProps: ['model'],
    _config: {
      options: () => {
        const { allTableWidget } = useDesigner();
        return allTableWidget.value.map((i) => {
          return { label: `${t(i.name)}${i.id}`, value: i.id };
        });
      },
    },
  },

  {
    component: 'number-editor',
    name: 'timeout',
    label: 'sys.pageDesigner.timeout',
    group: PropGroup.BUTTON,
    hidden: (widget): boolean => {
      return hiddenButtonProps(widget);
    },
    _config: {
      addonAfter: 'S',
    },
  },
  ...displayEditor,
  ...buttonEditor,
  ...permissionEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'beforeExport',
    title: 'sys.pageDesigner.beforeExport',
    params: [],
  },
  {
    name: 'afterExport',
    title: 'sys.pageDesigner.afterExport',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
export const styleEditorList: LowCodeWidget.StyleEditor[] = [...buttonStyleEditor];
