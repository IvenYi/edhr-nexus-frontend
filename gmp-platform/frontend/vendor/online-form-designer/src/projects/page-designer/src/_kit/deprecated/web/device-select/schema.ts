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

export interface DeviceSelectProps extends LowCodeWidget.WidgetProps {
  noNeedAutoQuery: boolean;
  required: boolean;
  readonly: boolean;
  usage?: string;
  refSearch?: string;
  refSearchForm: string;
  refSearchField: string;
}
export interface IDeviceSelect extends LowCodeWidget.BasicSchema {
  props: DeviceSelectProps;
}

export class DeviceSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./device-select-designer.vue'));
  kit: string[] = ['MEDPROOLD'];
  schema: IDeviceSelect = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.deviceSelect',
    alias: '',
    type: KitType.DEVICE_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      noNeedAutoQuery: false,
      required: false,
      readonly: false,
      usage: undefined,
      refSearch: '',
      refSearchForm: '',
      refSearchField: 'workflow_step_id_',
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
          {
            label: '其他事务',
            value: 'other_txn',
          },
        ],
      },
      hidden: (widget: IDeviceSelect) => {
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
        tips: '会自动绑定查询出的批次用来查询',
      },
      onMounted(widget: IDeviceSelect) {
        if (!widget.props?.refSearch) return;
        const { getWidgetByScope } = useDesigner();
        const allSearchWidgets = getWidgetByScope(KitType.CONTAINER_SEARCH);
        const searchWidget = allSearchWidgets.find((item) => item.id === widget.props?.refSearch);
        if (!searchWidget) {
          widget.props.refSearch = undefined;
          widget.props.refSearchForm = '';
        }
      },
      hidden: (widget: IDeviceSelect) => {
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
