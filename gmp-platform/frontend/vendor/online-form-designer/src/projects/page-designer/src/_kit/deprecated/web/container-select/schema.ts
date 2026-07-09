import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export interface ContainerSelectProps extends LowCodeWidget.WidgetProps {
  txnType?: string;
  refSearch: string;
}
export interface IContainerSelect extends LowCodeWidget.BasicSchema {
  props: ContainerSelectProps;
}

export class ContainerSelect implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./container-select-designer.vue'));

  kit: string[] = ['MEDPROOLD'];
  schema: IContainerSelect = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.containerSelect',
    alias: '',
    type: KitType.CONTAINER_SELECT,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    props: {
      refSearch: '',
      txnType: '',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'select-editor',
      name: 'txnType',
      label: '批次事务类型',
      group: PropGroup.TABLESELECT_CONFIG,
      required: true,
      _config: {
        options: () => [
          {
            label: '批次合并',
            value: 'em_txn_container_combine',
          },
          {
            label: '批次关联',
            value: 'em_txn_container_association',
          },
          {
            label: '解除批次关联',
            value: 'em_txn_container_disassociation',
          },
        ],
      },
    },
    {
      component: 'select-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.TABLESELECT_CONFIG,
      _config: {
        options: () => {
          const { getWidgetByScope } = useDesigner();
          return getWidgetByScope(KitType.CONTAINER_SEARCH).map((i) => {
            return { label: `${t(i.name)} ${i.id}`, value: i.id };
          });
        },
      },
    },
    ...(displayEditor as any),
  ];
  events?: LowCodeWidget.EventsType[] = [
    {
      name: 'onChange',
      title: 'sys.pageDesigner.onChange',
      params: ['selectedData'],
    },
  ];
}
