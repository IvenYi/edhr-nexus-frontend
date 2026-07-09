import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  EntityModelTypeEnum,
  EntityModelCategoryEnum,
} from '@gct/runtime';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';

export interface FileCollectProps extends LowCodeWidget.WidgetProps {
  /**
   * 关联表单
   */
  modelKey: string;
  refForm?: string;
  refSearch?: string;
  refSearchForm: string;
  refFormField: string[];
  refSearchField: string[];
  noNeedAutoQuery: boolean;
}

export interface IFileCollect extends LowCodeWidget.BasicSchema {
  props: FileCollectProps;
}

export class FileCollectPluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPROOLD'];

  component: Component = defineAsyncComponent(() => import('./file-collect-designer.vue'));

  schema: IFileCollect = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.fileCollect',
    alias: '',
    type: KitType.FILE_COLLECT,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.fileCollect',
    icon: 'icon-fuzhibanben',
    props: {
      refForm: undefined,
      refSearch: undefined,
      refSearchForm: undefined,
      refFormField: ['device_ids_'],
      refSearchField: ['product_id_', 'spec_id_'],
      noNeedAutoQuery: false,
      modeldata: {
        /**模型大类 */
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      modelKey: 'em_document_set',
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
      onMounted(widget: IFileCollect) {
        if (!widget.props?.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props?.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = undefined;
        }
      },
      hidden: (widget: IFileCollect) => {
        return widget.props.noNeedAutoQuery;
      },
    },
    {
      component: 'ref-container-search-editor',
      name: 'refSearch',
      label: 'sys.pageDesigner.refSearch',
      group: PropGroup.FILECOLLECT,
      required: true,
      onMounted(widget: IFileCollect) {
        if (!widget.props?.refSearch) return;
        const { allWidget } = useDesigner();
        const allSearchWidgets = allWidget.value.filter((i) => i.type === KitType.CONTAINER_SEARCH);
        const searchWidget = allSearchWidgets.find((item) => item.id === widget.props?.refSearch);
        if (!searchWidget) {
          widget.props.refSearch = undefined;
          widget.props.refSearchForm = undefined;
        }
        // widget.props.refSearchForm
      },
      hidden: (widget: IFileCollect) => {
        return widget.props.noNeedAutoQuery;
      },
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
}
