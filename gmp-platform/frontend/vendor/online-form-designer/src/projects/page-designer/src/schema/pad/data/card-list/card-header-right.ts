import {
  Platform,
  FormComponents,
  DisplayEnums,
  // sortTypeEnum,
} from '/@page-designer/enum';
import { CardHeaderRight } from '/@page-designer/types/mobile';
import commonStyle from '../../../common-config/common-style';
import { displayProps } from '../../../common-config/display-editor-config';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: CardHeaderRight = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.cardHeaderRight',
  alias: 'sys.pageDesigner.cardHeaderRight',
  display: DisplayEnums.BLOCK,
  type: FormComponents.CardHeaderRight,
  icon: 'icon-Collapse',
  children: [],
  props: {
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
