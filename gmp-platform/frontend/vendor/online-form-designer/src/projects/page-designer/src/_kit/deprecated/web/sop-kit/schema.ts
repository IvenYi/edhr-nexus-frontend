import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';

export interface SopKitProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  modelKey: string;
  refForm?: string;
  refSearch?: string;
  refSearchForm?: string;
  refFormField?: string[];
  refSearchField?: string[];
  bindModelKey?: string;
  noNeedAutoQuery: boolean;
  openNew: boolean;
}

export interface ISopKit extends LowCodeWidget.BasicSchema {
  props: SopKitProps;
}

export class SopKitPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPROOLD'];

  component: Component = defineAsyncComponent(() => import('./sop-kit-designer.vue'));

  schema: ISopKit = {
    id: '',
    platform: Platform.WEB,
    name: 'sop',
    alias: '',
    type: KitType.SOP_KIT,
    display: DisplayEnums.BLOCK,
    displayName: 'SOP',
    icon: 'icon-fuzhibanben',
    props: {
      refForm: undefined,
      refSearch: undefined,
      refSearchForm: undefined,
      refFormField: ['device_ids_'],
      refSearchField: ['product_id_', 'spec_id_'],
      bindModelKey: '',
      modelKey: 'em_sop_usage_rule',
      noNeedAutoQuery: false,
      openNew: false,
      ...displayProps,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'switch-editor',
      name: 'noNeedAutoQuery',
      label: '无需自动关联查询',
      group: PropGroup.FILECOLLECT,
    },
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.FILECOLLECT,
      required: false,
      onMounted(widget: ISopKit) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = undefined;
        }
      },
      hidden: (widget: ISopKit) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-container-search-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.FILECOLLECT,
      required: true,
      onMounted(widget: ISopKit) {
        if (!widget.props?.refSearch) return;
        const { allWidget } = useDesigner();
        const allSearchWidgets = allWidget.value.filter((i) => i.type === KitType.CONTAINER_SEARCH);
        const searchWidget = allSearchWidgets.find((item) => item.id === widget.props?.refSearch);
        if (!searchWidget) {
          widget.props.refSearch = undefined;
          widget.props.refSearchForm = undefined;
        }
      },
      hidden: (widget: ISopKit) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'switch-editor',
      name: 'openNew',
      label: 'sys.kit.openNew',
      required: false,
      group: PropGroup.FILECOLLECT,
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      label: 'sys.pageDesigner.maximumHeight',
      group: StyleGroup.LAYOUT,
      name: 'maxHeight',
      _config: {
        min: 200,
      },
    },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];
  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
