import { Platform, FormComponents, DisplayEnums, StyleGroup } from '/@page-designer/enum';
import { BaseButton } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import commonStyle from '../../common-config/common-style';
import { displayEditor } from '../../common-config/display-editor-config';
import { baseBtnProp, baseBtnEditor } from '../../common-config/base-button-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: BaseButton = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.button',
  alias: '',
  display: DisplayEnums.INLINE_BLOCK,
  type: FormComponents.BaseButton,
  icon: 'icon-Collapse',
  children: [],
  props: {
    ...baseBtnProp,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [...baseBtnEditor, ...displayEditor];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: [],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const designerConfig: LowCodeWidget.DesignerConfig = {
  basicProps: {
    key_label: 'sys.pageDesigner.button',
    alias_hidden: true,
  },
};
