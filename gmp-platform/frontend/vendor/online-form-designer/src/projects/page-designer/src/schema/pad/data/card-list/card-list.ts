import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
  sortTypeEnum,
} from '/@page-designer/enum';
import { selectionTypeEnums, MaterialEnum } from '/@/enums/appEnum';
import { CardList } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useI18n } from '/@/hooks/web/useI18n';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { cloneDeep } from 'lodash-es';
import { ButtonOpeEnum } from '@gct/runtime';

const { t } = useI18n();
const props: CardList['props'] = {
  title: '${sys.pageDesigner.cardList}',
  model: '',
  /**关联搜索 */
  refSearch: '',
  /**显示标题 */
  showTitle: true,
  /**支持拖拽 */
  draggable: false,
  /** 初始化不加载*/
  // initNotLoad: false,
  /**初始化加载 */
  initLoad: true,
  /**排序字段 */
  collation: [],
  datafilter: [],
  /**可见按钮数量 */
  visibleButtons: 1,
  rowSelection: false,
  rowSelectionType: selectionTypeEnums.SingleChoice,
  doNotSubmit: undefined,
  dataLinkValue: [],
  customdataSource: false,
  datasourceConfig: null,
  layout: {
    label: 'left',
    inputBg: false,
    inputAlign: 'right',
  },
  hasLabelWidth: false,
  labelType: 'percent',
  labelWidth: 30,
  overLabelDisplay: 'wrap',
  ...displayProps,
};
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: CardList = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.cardList',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.CardList,
  materialType: MaterialEnum.cardListFormField,
  icon: 'icon-kapianliebiao',
  children: [],
  props: Object.assign({}, props),
  style: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  events: {},
  formItem: false,
  ignoringStyle: [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'height',
    'borderLeft',
    'borderRight',
    'borderBottom',
    'borderTop',
    'borderTopRightRadius',
    'borderTopLeftRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius',
    'backgroundColor',
  ],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'model-editor',
    name: 'model',
    label: 'sys.pageDesigner.model',
    group: PropGroup.CARDLIST,
    required: true,
    changeCallback(widget: CardList) {
      for (const key in widget.props) {
        if (key !== 'model' && key !== 'modeldata') {
          widget.props[key] = props[key];
        }
      }

      widget.children.forEach((item) => {
        item.children = [];
      });
      widget.props.collation = [
        {
          collationField:
            widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
              ? undefined
              : 'create_time_',
          collationSort: sortTypeEnum.DESC,
        },
      ];
    },
    _config: {
      category: 'entity,data,view',
    },
  },
  {
    component: 'select-editor',
    name: 'refSearch',
    label: 'sys.pageDesigner.refQuerySearch',
    group: PropGroup.CARDLIST,
    dependentProps: ['model'],
    _config: {
      options: () => {
        const { getWidgetByScope } = useDesigner();
        const searchComp = getWidgetByScope(FormComponents.Search).map((i) => {
          return { label: `${t(i.name)} ${i.id}`, value: i.id };
        });
        const qSearchComp = getWidgetByScope(FormComponents.QuickSearch).map((i) => {
          return { label: `${t(i.name)} ${i.id}`, value: i.id };
        });

        return searchComp.concat(qSearchComp);
      },
      labelButton: {
        icon: 'icon-liucheng',
        label: 'sys.pageDesigner.refQuerySearch',
        type: (widget) => {
          return widget.props?.dataLinkValue?.length ? 'primary' : '';
        },
        size: 14,
        tooltip: 'sys.pageDesigner.searchRelation',
        hidden(widget) {
          const { pageJson } = useDesigner();
          const fieldModelKey = pageJson?.widgets?.find((n) => n.id === widget.props.refSearch)
            ?.props?.model;
          return !fieldModelKey || fieldModelKey === widget.props.model;
        },
        clickFn: async (widget) => {
          const { pageJson } = useDesigner();
          const fieldModelKey = pageJson?.widgets?.find((n) => n.id === widget.props.refSearch)
            ?.props?.model;
          const res = await gct.openUtil.modal(
            'DataLinkageConfig',
            {
              context: {
                bindModelKey: widget.props.model,
                fieldModelKey,
              },
              items: cloneDeep(widget.props.dataLinkValue),
              mode: 'mob-search',
              deleteMessage: '确定要删除搜索关系吗?',
              contentTitle: widget.props.dataLinkValue.length
                ? t('sys.pageDesigner.searchRelation')
                : t('sys.pageDesigner.searchRelation') + t('sys.setUp'),
              max: 3,
            },
            { title: t('sys.pageDesigner.searchRelation'), width: 800, height: 520 },
          );
          if (res?.ok) {
            widget.props.dataLinkValue = cloneDeep(res.data);
          }
        },
      },
    },
  },
  {
    component: 'switch-editor',
    name: 'showTitle',
    label: 'sys.pageDesigner.showTitleArea',
    group: PropGroup.CARDLIST,
    dependentProps: ['model'],
  },
  {
    component: 'switch-editor',
    name: 'rowSelection',
    label: 'sys.pageDesigner.rowSelection',
    group: PropGroup.CARDLIST,
    dependentProps: ['model'],
    hidden(widget) {
      return !widget.props.model;
    },
    changeCallback(widget: CardList) {
      if (!widget.props.rowSelectionType) {
        widget.props.rowSelectionType = selectionTypeEnums.SingleChoice;
      }
    },
  },
  {
    component: 'radio-editor',
    name: 'rowSelectionType',
    label: '',
    group: PropGroup.CARDLIST,
    dependentProps: ['model'],
    hidden(widget) {
      return !widget.props.rowSelection || !widget.props.model;
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.' + selectionTypeEnums.SingleChoice,
          value: selectionTypeEnums.SingleChoice,
        },
        {
          label: 'sys.pageDesigner.' + selectionTypeEnums.MultipleChoice,
          value: selectionTypeEnums.MultipleChoice,
        },
      ],
    },
  },
  // {
  //   component: 'switch-editor',
  //   name: 'draggable',
  //   label: 'sys.pageDesigner.cardSupportDrag',
  //   group: PropGroup.CARDLIST,
  //   dependentProps: ['model'],
  //   hidden: () => true,
  // },
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
    hidden(widget) {
      return widget.props.layout?.label === 'top';
    },
  },
  {
    component: 'label-width-editor',
    name: { labelType: 'labelType', labelWidth: 'labelWidth' },
    label: 'sys.pageDesigner.labelWidthTip',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget) {
      return widget.props.layout?.label === 'top' || !widget.props.hasLabelWidth;
    },
  },
  {
    component: 'over-label-display-editor',
    name: 'overLabelDisplay',
    label: '',
    group: PropGroup.FIELD_LAYOUT,
    hidden(widget) {
      return widget.props.layout?.label === 'top' || !widget.props.hasLabelWidth;
    },
  },
  {
    component: 'data-filtering-new-editor',
    label: '',
    name: 'datafilter',
    group: PropGroup.LISTDATA,
    dependentProps: ['model'],
    _config: {
      modelKey: 'model',
      cascadeField: true,
    },
  },
  {
    component: 'sorts-editor',
    label: '',
    name: 'collation',
    group: PropGroup.LISTDATA,
    dependentProps: ['model'],
  },
  // {
  //   component: 'add-button-list-editor',
  //   label: '',
  //   name: { list: 'root:children.3.children', cmpId: 'root:id', model: 'model' },
  //   group: PropGroup.Button,
  //   dependentProps: ['model'],
  //   _config: {
  //     module: 'mobile_module',
  //     createField: () => createWidgetByType(FormComponents.BaseButton),
  //   },
  // },
  {
    component: 'gct-table-button-group-editor',
    label: '',
    name: {
      columns: {
        value: 'root:children.3.children',
        visibleButtons: 'visibleButtons',
      },
    },
    group: PropGroup.LISTBUTTON,
    _config: {
      position: ButtonOpeEnum.SINGLELINE,
      /**添加按钮的回调 */
      eventCallback(widget: any) {
        widget.parentComponent = FormComponents.CardList;
      },
      modelKey: 'model',
      columnsButton: () => {
        return [
          FormComponents.CustomButton,
          FormComponents.SubTableDeleteBtn,
          FormComponents.LinkPageBtn,
        ];
      },
    },
    dependentProps: ['model'],
  },
  // {
  //   component: 'button-show-num-editor',
  //   name: 'visibleButtons',
  //   label: '',
  //   group: PropGroup.ButtonShow,
  //   dependentProps: ['model'],
  //   hidden: (widget) => {
  //     return !widget.children![3].children.length;
  //   },
  // },
  {
    component: 'switch-editor',
    name: 'initLoad',
    label: 'sys.pageDesigner.initializeLoad',
    group: PropGroup.SHOW,
    dependentProps: ['model'],
    onMounted: (widget) => {
      if (!Object.prototype.hasOwnProperty.call(widget.props, 'initLoad')) {
        if (widget.props.initNotLoad === true) widget.props.initLoad = false;
        else widget.props.initLoad = true;
      }
    },
  },
  {
    component: 'radio-editor',
    name: 'doNotSubmit',
    label: 'sys.pageDesigner.submitRuleProp',
    group: PropGroup.CARDLIST,
    hidden(widget) {
      return (
        !widget.props.model ||
        widget.props.modeldata?.modelCategory === EntityModelCategoryEnum.VIEW
      );
    },
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.doSubmit',
          value: undefined,
        },
        {
          label: 'sys.pageDesigner.doNotSubmit',
          value: true,
        },
      ],
    },
  },
  {
    component: 'switch-editor',
    name: 'customdataSource',
    label: 'sys.pageDesigner.customDataSource',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return (
        !widget.props.model || widget.props.modeldata?.modelCategory == EntityModelCategoryEnum.VIEW
      );
    },
  },
  {
    component: 'data-sourse-editor',
    name: 'datasourceConfig',
    label: '',
    dependentProps: ['model'],
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return !widget.props.customdataSource;
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

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'radioEvent',
    title: 'sys.pageDesigner.radioEvent',
    params: ['value'],
  },
  {
    name: 'checkboxEvent',
    title: 'sys.pageDesigner.checkboxEvent',
    params: ['checked'],
  },
  {
    name: 'cellClickEvent',
    title: 'sys.pageDesigner.cellClickEvent',
    params: ['value'],
  },
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (widget: CardList) => {
  const w1 = createWidgetByType(FormComponents.CardHeaderLeft);
  const w2 = createWidgetByType(FormComponents.CardHeaderRight);
  const w3 = createWidgetByType(FormComponents.CardContent);
  const w4 = createWidgetByType(FormComponents.CardOpeBtn);
  w1.id = w2.id = w3.id = w4.id = undefined;
  widget.children.push(...[w1, w2, w3, w4]);
};

export const blackList: (string | RegExp)[] = [
  FormComponents.LeftRightColumns,
];
