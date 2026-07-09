import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { Descriptions } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { beginDrag } from '/@page-designer/schema/utils';
import { MaterialEnum } from '/@/enums/appEnum';

const { t } = useI18n();

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Descriptions = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.descList',
  alias: '',
  type: FormComponents.Descriptions,
  icon: 'icon-biaodan',
  children: [],
  dropPlaceholder: '选择关联模型',
  props: {
    model: undefined,
    layout: {
      label: 'left',
      inputBg: false,
      inputAlign: 'right',
    },
    refSearch: undefined,
    column: 1,
    ...displayProps,
  },
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.LIST,
    required: true,
    _config: {
      type: 'NDO,BASE,TREE,TRANSACTION',
      category: 'entity,view',
    },
    changeCallback(widget: Descriptions) {
      widget.children = [];
      widget.dropPlaceholder = widget.props.model ? '选择模型字段' : '选择关联模型';
    },
  },
  {
    component: 'select-editor',
    name: 'refSearch',
    label: 'sys.pageDesigner.refQuerySearch',
    group: PropGroup.LIST,
    dependentProps: ['model'],
    _config: {
      options: () => {
        const { getWidgetByScope } = useDesigner();
        return [
          ...getWidgetByScope(FormComponents.Search),
          ...getWidgetByScope(FormComponents.QuickSearch),
        ].map((i) => {
          return { label: `${t(i.name)} ${i.id}`, value: i.id };
        });
      },
    },
  },
  {
    component: 'table-field-list-editor',
    name: 'root:children',
    label: '',
    group: PropGroup.FIELD,
    hidden(widget) {
      return !widget.props.model;
    },
    _config: {
      createField: (item, widget: Descriptions) => {
        try {
          const fieldWidget = beginDrag(item, {
            materialType: MaterialEnum.DescriptionsFormField,
            preLocation: widget.id,
          });
          return fieldWidget;
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  {
    component: 'mobile-form-layout-editor',
    name: 'layout',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    dependentProps: ['model'],
  },
  {
    component: 'switch-editor',
    name: 'hasLabelWidth',
    label: 'sys.pageDesigner.hasLabelWidthConfig',
    group: PropGroup.FIELD_LAYOUT,
    dependentProps: ['model'],
    hidden(widget: Descriptions) {
      return widget.props.layout.label === 'top';
    },
  },
  {
    component: 'label-width-editor',
    name: { labelType: 'labelType', labelWidth: 'labelWidth' },
    label: 'sys.pageDesigner.labelWidthTip',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: Descriptions) {
      return widget.props.layout.label === 'top' || !widget.props.hasLabelWidth;
    },
  },
  {
    component: 'over-label-display-editor',
    name: 'overLabelDisplay',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget: Descriptions) {
      return widget.props.layout.label === 'top' || !widget.props.hasLabelWidth;
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

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };
