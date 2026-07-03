import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
} from '/@page-designer/enum';
import { Iframe } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Iframe = {
  id: '',
  platform: Platform.MOBILE,
  name: 'iframe',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.Iframe,
  icon: 'icon-Collapse',
  children: [],
  props: {
    title: 'iframe',
    iframeUrl: '',
    ...displayProps,
  },
  i18n: {},
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'desc-text-editor',
    name: 'iframeUrl',
    label: 'sys.pageDesigner.linkAddress',
    // required: true,
    validate: async (...arg) => {
      const reg = /^http(s)?:\/\/[^\s]+/;
      const promise: any = new Promise((resolve, reject) => {
        if (reg.test(arg[1]) || arg[1] == '') {
          resolve(true);
        } else {
          reject(t('sys.pageDesigner.linkAddressNotValidUrl'));
        }
      });
      return promise;
    },
    group: PropGroup.IFRAME,
    _config: {
      // showCount: true,
      // maxlength: 128,
      tips: 'sys.pageDesigner.embedAccessLinkAddr',
      placeholder: 'sys.pageDesigner.linkAddress',
    },
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: StyleGroup.LAYOUT,
  },
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

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
