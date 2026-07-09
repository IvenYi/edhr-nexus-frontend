import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  TagTypeEnum,
  FormComponents,
  FIELD_TYPE
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { createFieldWidgetByType, getCompPos } from '/@page-designer/schema/utils';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '../../../../schema/common-config/display-editor-config';
import { baseBtnProp, buttonEditor, permissionEditor } from '@gct-paas/design';

export interface ViewChartButtonProps extends LowCodeWidget.WidgetProps {
  title: string;
  refModal: string;
  refForm: string,
}
export interface IViewChartButton extends LowCodeWidget.BasicSchema {
  props: ViewChartButtonProps;
}

export default class MedProDeviceSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./view-chart-button-designer.vue'));

  kit: string[] = ['QMS'];

  schema: IViewChartButton = {
    id: '',
    platform: Platform.WEB,
    name: '控制图查看',
    alias: '',
    type: KitType.VIEW_CHART_BUTTON,
    display: DisplayEnums.BLOCK,
    icon: 'icon-Custom',
    children: [],
    props: {
      ...baseBtnProp,
      title: '${自定义}',
      refModal: undefined,
      refForm: undefined,
      icon: 'icon-park:writing-fluently',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
        defaultValue: 'sys.pageDesigner.custombutton'
      },
    },
    {
      component: 'select-editor',
      name: 'refModal',
      label: 'sys.pageDesigner.modalBox',
      group: PropGroup.BUTTON,
      required: false,
      changeCallback(widget) {
        widget.props.refForm = undefined;
        const rangeUser = createFieldWidgetByType(FormComponents.RangeUser);
        console.log(rangeUser, 'rangeUser')
        widget.children[0] = rangeUser;
      },
      _config: {
        options: () => {
          const { pageJson } = useDesigner();
          return pageJson.modals.map((i) => {
            return { label: `${$t(i.modalName)}[${i.id}] `, value: i.id };
          });
        },
      },
      hidden(widget: any) {
        return (
          widget.parentComponent === FormComponents.SubTable ||
          widget.parentComponent === FormComponents.SubDataTable
        );
      },
    },
    {
      component: 'select-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.assignPage',
      group: PropGroup.BUTTON,
      required: false,
      _config: {
        options: (widget) => {
          if (!widget.props.refModal) return [];
          const { pageJson } = useDesigner();
          const scope =
            pageJson.modals.find((modal) => widget.props.refModal === modal.id)?.children || [];
          return findNodeAll(scope, (w) => {
            return (
              [
                FormComponents.Form,
                FormComponents.RdoForm,
                FormComponents.MedProRdoForm,
                FormComponents.FormProcess,
              ].includes(w.type) &&
              !getCompPos(w, FIELD_TYPE.MASTERSLAVE, FormComponents.Form)
            );
          }).map((i) => {
            return { value: i.id, label: `${$t(i.name)}[${i.id}] ` };
          });
        },
      },
      hidden(widget: any) {
        return (
          widget.parentComponent === FormComponents.SubTable ||
          widget.parentComponent === FormComponents.SubDataTable
        );
      },
    },

    ...(displayEditor as any),
    ...buttonEditor,
    ...permissionEditor,
  ];

  beforeCreate?: Function | undefined = (widget: any) => {
    const rangeUser = createFieldWidgetByType(FormComponents.RangeUser);
    console.log(rangeUser, 'rangeUser')
    widget.children[0] = rangeUser;
  };

  events?: LowCodeWidget.EventsType[] = [
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

  styleEditors: LowCodeWidget.StyleEditor[] = [
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
      component: 'font-editor',
      name: 'labelFont',
      label: 'sys.name',
      group: StyleGroup.STYLE,
    },
    {
      component: 'font-editor',
      name: 'contentFont',
      label: 'sys.content',
      group: StyleGroup.STYLE,
    },
    {
      component: 'boolean-editor',
      name: 'hidden',
      label: '元素显隐',
      group: StyleGroup.STYLE,
      _config: {
        showType: 'checkbox',
        options: [
          {
            label: '是否隐藏元素',
            value: true,
          },
        ],
      },
    },
    {
      component: 'boolean-editor',
      name: 'tagStyleOpen',
      label: 'sys.pageDesigner.tagStyle',
      group: StyleGroup.STYLE,
      _config: {
        showType: 'checkbox',
        options: [
          {
            label: 'sys.pageDesigner.configureContentAsLabelStyle',
            value: true,
          },
        ],
      },
      changeCallback: (widget, value) => {
        if (value && !widget.style.tagStyle) {
          widget.style.tagStyle = {
            color: '',
            tagType: TagTypeEnum.RADIUS,
          };
        }
      },
    },
  ];
}
