import { PropGroup, FormComponents, StyleGroup, Platform } from '/@page-designer/enum';
import { Select } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { CARD_TRIGGER_ENUM, CreateType, FIELD_TYPE } from '@gct/runtime';
import { formItemProps } from '../../common-config/formItem-editor-config';
import getAutofillEditor from '../../common-config/autofill-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { beginDrag } from '/@page-designer/schema/utils';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Select, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.RdoSelect,
  icon: '',
  props: {
    multiple: false,
    clearable: true,
    defaultValue: undefined,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    bindModelKey: '',
    showSearch: false,
    enableAutofill: false,
    autofillRules: [],
    ...formItemProps,
    fieldType: undefined,
    rdoVersion: false,
    customdataSource: false,
    datasourceConfig: null,
    datafilter: [],
    searchField: [],
    exp: '',
    refCard: false,
    refCardId: '',
    cardTrigger: CARD_TRIGGER_ENUM.HOVER,
    rdoUniqueFieldKey: 'name_',
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  ...commonFieldEditorConfig.placeholderEditor,

  {
    component: 'rdo-display-fields-editor',
    label: 'sys.model.displayField',
    name: 'displayFields',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return (
        !widget.props.bindModelKey || widget.platform === Platform.MOBILE || widget.props.readonly
      );
    },
    formItemStyle: { marginBottom: '12px' },
    _config: {
      // tooltip: 'sys.pageDesigner.fieldsDisplayedInTheDropdownOptions',
      modelByKey: 'bindModelKey',
      draggable: true,
      filterFn: (field) => {
        const USER_DEFINED_TYPES = [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.INTEGER,
          FIELD_TYPE.LONG,
          FIELD_TYPE.DECIMAL,
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.BOOLEAN,
          FIELD_TYPE.DATE,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.SERIAL,
          FIELD_TYPE.USER,
          FIELD_TYPE.USER_MULTI,
          FIELD_TYPE.ORG,
          FIELD_TYPE.ORG_MULTI,
          FIELD_TYPE.ENUM,
          FIELD_TYPE.ENUM_MULTI,
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.RDO_REF,
        ];
        const SYS_TYPES = [
          'create_user_id_',
          'create_time_',
          'modify_user_id_',
          'modify_time_',
          'create_org_id_',
          'modify_org_id_',
        ];
        const BUILTIN_KYES = ['base_id_', 'version_', 'default_'];
        return (
          (field.createType === CreateType.USER_DEFINED &&
            USER_DEFINED_TYPES.includes(field.type)) ||
          (field.createType === CreateType.SYSTEM && SYS_TYPES.includes(field.key)) ||
          (field.createType === CreateType.BUILTIN && !BUILTIN_KYES.includes(field.key))
        );
      },
      createField: (item, widget) => {
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: widget.id,
        });
        return fieldWidget;
      },
    },
    async onMounted(widget) {
      const data = (await getFieldMetaList({ modelKey: widget.props.bindModelKey })) || [];
      const defaultKey = data.find((e) => !!e.rdoUniqueFieldKey)?.key ?? 'name_';
      const defaultFields = [defaultKey];
      const widgetList = defaultFields.map((key) => {
        const field = data.find((field) => field.key === key);
        return {
          key,
          // @ts-ignore
          ...beginDrag(field, {
            materialType: MaterialEnum.MaterialTableField,
            preLocation: widget.id,
          }),
        };
      });

      const fields = widgetList.map((item) => {
        return {
          ...item,
          props: {
            ...item.props,
            disabled: item.key === defaultKey,
            _preset: item.key === defaultKey,
            _frozen: item.key === defaultKey,
          },
        };
      });
      if (!widget.props.displayFields?.length) {
        widget.props.displayFields = fields;
      }
    },
  },

  {
    component: 'data-filtering-new-editor',
    label: '',
    name: 'datafilter',
    group: PropGroup.LISTDATA,
    _config: {
      modelKey: 'bindModelKey',
    },
    hidden(widget) {
      return !widget.props.bindModelKey || widget.props.fieldReadonly;
    },
  },
  // 搜索开关
  {
    component: 'switch-editor',
    name: 'showSearch',
    label: 'sys.pageDesigner.search',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return (
        widget.platform === Platform.MOBILE ||
        widget.platform === Platform.PAD ||
        widget.props.bindFieldKey ||
        widget.props.fieldReadonly
      );
    },
  },
  // 搜索字段
  {
    component: 'field-exp-editor',
    name: { fieldlist: 'searchField', exp: 'exp' },
    label: 'sys.pageDesigner.quickSearchFields',
    group: PropGroup.FIELD_CONFIG,
    required: true,
    hidden(widget) {
      if (widget.props.bindFieldKey || widget.props.fieldReadonly) {
        return true;
      }
      return !widget.props.showSearch || widget.platform === Platform.MOBILE;
    },
    _config: {
      tips: 'sys.pageDesigner.quickSearchTips',
      filterFields: [
        FIELD_TYPE.LONG_TEXT,
        FIELD_TYPE.TEXT,
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.LONG,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.SERIAL,
      ],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      multiple: true,
      modelKey: 'bindModelKey',
    },
  },
  // 数据联动
  {
    component: 'data-linkage2-editor',
    name: 'ruleConfig',
    label: '',
    group: PropGroup.DATALINKAGE,
    _config: {
      filterFields: [FIELD_TYPE.RDO_REF],
      filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
    },
    hidden(widget: Select) {
      return (
        !widget.props.bindModelKey ||
        widget.props.fieldReadonly ||
        widget.props.fieldType !== FIELD_TYPE.RDO_REF
      );
    },
  },

  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...getAutofillEditor({ groupName: PropGroup.FIELD_CONFIG }),
  {
    component: 'switch-editor',
    name: 'rdoVersion',
    label: 'sys.pageDesigner.rdoVersion',
    group: PropGroup.FIELD_CONFIG,
  },
  {
    component: 'switch-editor',
    name: 'customdataSource',
    label: 'sys.pageDesigner.customDataSource',
    group: PropGroup.DATASOURCE,
  },
  {
    component: 'data-sourse-editor',
    name: 'datasourceConfig',
    label: '',
    group: PropGroup.DATASOURCE,
    hidden(widget: Select) {
      return !widget.props.customdataSource;
    },
  },
  {
    component: 'switch-editor',
    name: 'refCard',
    label: 'sys.pageDesigner.refCardLabel',
    group: PropGroup.CARDDISPLAY,
    hidden(widget) {
      return widget.platform === Platform.PAD;
    },
  },
  {
    component: 'gct-ref-card-editor',
    name: 'refCardId',
    label: '',
    group: PropGroup.CARDDISPLAY,
    hidden(widget) {
      return !widget.props.refCard;
    },
  },
  {
    component: 'radio-editor',
    name: 'cardTrigger',
    label: 'sys.pageDesigner.cardTrigger',
    group: PropGroup.CARDDISPLAY,
    _config: {
      options: Object.values(CARD_TRIGGER_ENUM).map((key) => {
        return { label: 'sys.pageDesigner.cardTriggerType.' + key, value: key };
      }),
    },
    formItemClass: 'in-row-editor',
    hidden(widget) {
      return !widget.props.refCard || widget.platform === Platform.MOBILE;
    },
    onMounted(widget) {
      if (widget.props.cardTrigger === undefined) {
        widget.props.cardTrigger = CARD_TRIGGER_ENUM.HOVER;
      }
    },
  },
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType !== MaterialEnum.MaterialTableField ||
        (widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB)
      );
    },
  },
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
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
  // {
  //   component: 'boolean-editor',
  //   name: 'tagStyleOpen',
  //   label: 'sys.pageDesigner.tagStyle',
  //   group: StyleGroup.STYLE,
  //   _config: {
  //     showType: 'checkbox',
  //     options: [
  //       {
  //         label: 'sys.pageDesigner.configureContentAsLabelStyle',
  //         value: true,
  //       },
  //     ],
  //   },
  // },
  // {
  //   component: 'tag-editor',
  //   name: 'tagStyle',
  //   group: StyleGroup.STYLE,
  //   hidden: (widget) => {
  //     return !widget.style.tagStyleOpen;
  //   },
  // },
  // {
  //   component: 'color-editor',
  //   name: 'backgroundColor',
  //   label: 'sys.pageDesigner.backgroundColor',
  //   group: StyleGroup.BACKGROUND,
  // },
  // {
  //   component: 'margin-editor',
  //   group: StyleGroup.MARGIN,
  // },
  // {
  //   component: 'border-radius-editor',
  //   group: StyleGroup.BORDER,
  // },
  // {
  //   component: 'border-editor',
  //   group: StyleGroup.BORDER,
  // },
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
/**设计时配置信息 */
export const designerConfig: LowCodeWidget.DesignerConfig = {
  hideMask(widget: any) {
    return widget.props.readonly;
  },
};
