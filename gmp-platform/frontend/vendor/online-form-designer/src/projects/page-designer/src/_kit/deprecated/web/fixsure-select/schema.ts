import {
  CreateType,
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export interface FixsureSelectProps extends LowCodeWidget.WidgetProps {
  noNeedAutoQuery: boolean;
  required: boolean;
  readonly: boolean;
  usage?: string;
  refForm?: string;
  refFormField: string[];
  refSearch?: string;
}
export interface IFixsureSelect extends LowCodeWidget.BasicSchema {
  props: FixsureSelectProps;
}

export class FixsureSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./fixsure-select-designer.vue'));
  kit: string[] = ['MEDPROOLD'];
  schema: IFixsureSelect = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.fixsureSelect',
    alias: '',
    type: KitType.FIXSURE_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      noNeedAutoQuery: false,
      required: false,
      readonly: false,
      usage: undefined,
      refFormField: ['device_ids_', 'workflow_step_id_'],
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    {
      component: 'field-editor',
      name: 'field',
      label: 'sys.pageDesigner.field',
      group: PropGroup.FIELD_CONFIG,
      // required: true,
      _config: {
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    {
      component: 'switch-editor',
      name: 'noNeedAutoQuery',
      label: '无需自动关联查询',
      group: PropGroup.ADVANCED,
    },
    {
      component: 'select-editor',
      name: 'usage',
      label: '使用场景',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        options: () => [
          {
            label: '进站',
            value: 'em_txn_move_in',
          },
          {
            label: '出站',
            value: 'em_txn_move',
          },
        ],
      },
      hidden: (widget: IFixsureSelect) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.ADVANCED,
      required: false,
      _config: {
        tips: '会自动绑定关联表单中的工步和设备字段进行查询',
      },
      onMounted(widget: IFixsureSelect) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = '';
        }
      },
      hidden: (widget: IFixsureSelect) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-container-search-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.ADVANCED,
      required: true,
      _config: {
        tips: '会自动绑定查询批次ID用来查询',
      },
      onMounted(widget: IFixsureSelect) {
        if (!widget.props?.refSearch) return;
        const { getWidgetByScope } = useDesigner();
        const allSearchWidgets = getWidgetByScope(KitType.CONTAINER_SEARCH);
        const searchWidget = allSearchWidgets.find((item) => item.id === widget.props?.refSearch);
        if (!searchWidget) {
          widget.props.refSearch = undefined;
        }
      },
      hidden: (widget: IFixsureSelect) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    ...(displayEditor as any),
  ];
  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'valueData'],
    },
  ];
}
