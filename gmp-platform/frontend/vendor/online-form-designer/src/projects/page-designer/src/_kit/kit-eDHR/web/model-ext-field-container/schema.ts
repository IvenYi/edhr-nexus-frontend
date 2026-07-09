import {
  DisplayEnums,
  FieldMetaDTO,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { beginDrag, createWidgetByType } from '../../../../schema/utils';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

async function createExtFields(modelKey: string) {
  const fieldData: FieldMetaDTO[] = (await getFieldMetaList({ modelKey })) || [];
  const extFieldsMeta = fieldData.filter((field) => field?.specificConfig?.extField);

  const extFields = extFieldsMeta.map((field: any) => {
    const comp = beginDrag(field, {
      materialType: MaterialEnum.MaterialFormField,
    });
    return comp;
  });
  return extFields;
}

export interface ModelExtFieldContainerProps extends LowCodeWidget.WidgetProps {
  title: string;
  refModel: string;
  bindModelKey?: string;
  refForm: string;
  refFormModel: string | undefined;
  rowLength: number;
  isSupportFold: string;
  defaultFold: boolean;
}
export interface IModelExtFieldContainer extends LowCodeWidget.BasicSchema {
  props: ModelExtFieldContainerProps;
  children: any;
}

export default class ModelExtFieldContainer implements IDesignerProvider {
  component: Component = defineAsyncComponent(
    () => import('./model-ext-field-container-designer.vue'),
  );

  kit: string[] = ['eDHR'];
  schema: IModelExtFieldContainer = {
    id: '',
    platform: Platform.WEB,
    name: '模型设置字段容器',
    alias: '',
    type: KitType.MODEL_EXT_FIELD_CONTAINER,
    display: DisplayEnums.BLOCK,
    icon: 'icon-liebiaoxuanzeqi',
    props: {
      title: '模型设置字段容器',
      refModel: 'em_product',
      refFormModel: '',
      refForm: '',
      rowLength: 2,
      isSupportFold: '1',
      defaultFold: false,
      ...displayProps,
    },
    children: [],
    style: {},
    events: {},
    formItem: false,
    ignoringStyle: [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'backgroundColor',
    ],
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.SHOW,
    },

    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      required: true,
      group: PropGroup.BUSINESS_CONFIG,
      _config: {
        clearable: true,
        bindModelKey: 'refFormModel',
      },
      changeCallback: async (widget: IModelExtFieldContainer, value) => {
        const refModel = widget.props.refFormModel;
        if (!refModel || !widget.props.refForm) {
          widget.children[0] = null;
          widget.children[1] = [];
        } else {
          widget.props.refModel = refModel;
          const { excludeSubTableFormWidget: formWidgets } = useDesigner();
          const formWidget = formWidgets.value.find((d) => d.id === value);
          const form = createWidgetByType(formWidget.type);
          form.alias = '关联模型表单';
          form.children = [];
          form.props = formWidget.props;
          widget.children[0] = form;
          widget.children[1] = await createExtFields(refModel);
          console.log('children: widget!!!', widget.children, formWidget);
        }
      },
    },

    {
      component: 'number-editor',
      name: 'rowLength',
      label: 'sys.pageDesigner.NumberOfSingleLineDisplays',
      group: PropGroup.SHOW,
      formItemClass: 'in-row-editor',
      _config: {
        min: 1,
        max: 5,
      },
    },

    {
      component: 'collapse-editor',
      name: { support: 'isSupportFold', defaultFold: 'defaultFold' },
      label: 'sys.pageDesigner.isCollapse',
      group: PropGroup.SHOW,
    },

    ...displayEditor,
  ];

  beforeCreate?: Function | undefined = () => {};

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'onFieldChange',
      title: 'sys.pageDesigner.onChange',
      params: ['value', 'item', 'formData'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
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
      component: 'color-editor',
      name: 'backgroundColor',
      label: 'sys.pageDesigner.backgroundColor',
      group: StyleGroup.BACKGROUND,
    },
  ];

  designerConfig: LowCodeWidget.DesignerConfig = {
    hideMask: true,
  };
}
