import {
  Platform,
  PropGroup,
  FormComponents,
  StyleGroup,
  DisplayEnums,
} from '/@page-designer/enum';
import { GenImage } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayProps, displayEditor } from '../../common-config/display-editor-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: GenImage = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.genImage',
  alias: '',
  type: FormComponents.GenImage,
  // display: DisplayEnums.INLINE_BLOCK,
  icon: 'icon-tupian_wudaima',
  props: {
    title: '${sys.pageDesigner.genImage}',
    imgUrl: '',
    prompt: '',
    auxiliary: '',
    autoWidth: true,
    width: 60,
    height: 60,
    maxHeight: 60,
    displayLabelText: true,
    ...displayProps,
  },
  style: {},
  events: {},
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.title',
    group: PropGroup.GENIMAGE,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32, formItemCheckbox: {
        label: 'sys.pageDesigner.displayLabelText',
        propsKey: 'displayLabelText'
      }
    },
  },
  {
    component: 'image-upload-editor',
    name: 'imgUrl',
    label: 'sys.pageDesigner.uploadImage',
    group: PropGroup.GENIMAGE,
  },
  {
    component: 'texteare-editor',
    name: 'prompt',
    label: 'sys.pageDesigner.prompt',
    group: PropGroup.GENIMAGE,
    _config: {
      i18n: true,
      maxlength: 120,
      showCount: true,
    },
  },
  {
    component: 'texteare-editor',
    name: 'auxiliary',
    label: 'sys.pageDesigner.auxiliary',
    group: PropGroup.GENIMAGE,
    _config: {
      i18n: true,
      maxlength: 120,
      showCount: true,
    },
  },
  {
    component: 'checkbox-editor',
    name: 'autoWidth',
    label: 'sys.pageDesigner.imageSize',
    group: PropGroup.GENIMAGE,
    _config: {
      isInRow: true,
      isRight: true,
    },
  },
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: PropGroup.GENIMAGE,
    hidden(widget) {
      return widget.props.autoWidth;
    },
    _config: {
      addonAfter: 'px',
      min: 1,
      max: 1920,
      isInRow: true,
    },
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: PropGroup.GENIMAGE,
    hidden(widget) {
      return widget.props.autoWidth;
    },
    _config: {
      addonAfter: 'px',
      min: 1,
      max: 1024,
      isInRow: true,
    },
  },
  {
    component: 'number-editor',
    name: 'maxHeight',
    label: 'sys.pageDesigner.maximumHeight',
    group: PropGroup.GENIMAGE,
    hidden(widget) {
      return !widget.props.autoWidth;
    },
    _config: {
      addonAfter: 'px',
      min: 1,
      max: 1024,
      isInRow: true,
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
    component: 'font-editor',
    name: 'labelFont',
    label: 'sys.name',
    group: StyleGroup.STYLE,
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

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
