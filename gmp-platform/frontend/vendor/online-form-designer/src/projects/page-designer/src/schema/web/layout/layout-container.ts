import { Platform, PropGroup, FormComponents, DisplayEnums } from '/@page-designer/enum';
import { LayoutContainer } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { AGLINE_ENUMS } from '@/enums/designEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LayoutContainer = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.layoutContainer',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.LayoutContainer,
  icon: 'icon-bujurongqi',
  children: [],
  props: {
    name: '',
    /**布局方式 */
    layoutDisplay: DisplayEnums.BLOCK,
    /**对齐方式 */
    textAlign: AGLINE_ENUMS.LEFT,
    /**主轴方向 */
    mainAxios: '',
    /**横轴对对齐方式*/
    justifyContent: '',
    /**纵轴对对齐方式*/
    alignItems: '',
    /**间距 */
    margin: 5,
    ...displayProps,
  },
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  // {
  //   component: 'text-editor',
  //   name: 'name',
  //   label: 'sys.pageDesigner.widgetName',
  //   group: PropGroup.BASIC,
  // },
  {
    component: 'align-editor',
    name: 'textAlign',
    label: 'sys.pageDesigner.align',
    group: PropGroup.BASIC,
    _config: {
      options: [
        { label: AGLINE_ENUMS.LEFT, value: 'icon-zuoduiqi' },
        { label: AGLINE_ENUMS.CENTER, value: 'icon-juzhongduiqi' },
        { label: AGLINE_ENUMS.RIGHT, value: 'icon-youduiqi' },
      ],
    },
  },
  {
    component: 'number-editor',
    name: 'margin',
    label: 'sys.pageDesigner.childMargin',
    group: PropGroup.BASIC,
    _config: {
      addonAfter: 'px',
    },
  },

  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
