import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { CreateType, FIELD_TYPE, MaterialEnum } from '@/enums/appEnum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchSelect as ISearchSelect } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
import { Platform } from '@gct/runtime';
import { beginDrag } from '/@page-designer/schema/utils';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

class SearchSelect extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  ignoreOptions: [];
  /** 是否启用了其他选项 */
  useMore: string;
  bindModelKey: string;
  modelKey: string;
  showSearch: boolean;
  searchField: string[];
  refModelType?: EntityModelTypeEnum;
  customdataSource: boolean = false;
  datasourceConfig?: any = null;
  /**过滤条件 */
  datafilter: any[] = [];
  displayFields: any[] = [];
  /**关联的rdo 的标识 默认name_ */
  rdoUniqueFieldKey?: string;
  rdoVersion: boolean;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.select';
    this.type = SearchComponents.SearchRdoSelect;
    this.moreOptions = [];
    this.ignoreOptions = [];
    this.useMore = '';
    this.bindModelKey = '';
    this.modelKey = '';
    this.showSearch = false;
    this.searchField = [];
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
    this.displayFields = [];
    this.rdoVersion = true;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchSelect();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.baseProps,
        moreOptions: this.moreOptions,
        ignoreOptions: this.ignoreOptions,
        useMore: this.useMore,
        bindModelKey: this.bindModelKey,
        modelKey: this.modelKey,
        showSearch: this.showSearch,
        searchField: this.searchField,
        displayFields: this.displayFields,
        rdoVersion: this.rdoVersion,
      },
    };
  }

  get showSearchEditor() {
    return {
      component: 'switch-editor',
      name: 'showSearch',
      label: 'sys.pageDesigner.search',
      group: PropGroup.FIELD_CONFIG,
    };
  }

  get searchFieldEditor() {
    return {
      component: 'field-exp-editor',
      name: { fieldlist: 'searchField', exp: 'exp' },
      label: 'sys.pageDesigner.quickSearchFields',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      hidden(widget) {
        if (widget.props.bindFieldKey || widget.props.fieldReadonly) {
          return true;
        }
        return !widget.props.showSearch;
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
    };
  }

  get opeEditor() {
    return {
      component: 'radio-list-editor',
      name: 'ope',
      label: 'sys.pageDesigner.operator',
      group: PropGroup.OPERATOR_CONFIG,
      _config: {
        // noBottom: true,
        // minlength: 1,
        options(widget: SearchWidgets) {
          return getSearchOptions(widget.props.fieldType);
        },
      },
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,

      this.opeEditor,
      this.moreOptionsEditor,
      this.ignoreEditor,
      {
        component: 'data-filtering-new-editor',
        label: '',
        name: 'datafilter',
        group: PropGroup.LISTDATA,
        _config: {
          modelKey: 'bindModelKey',
        },
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
        hidden(widget: SearchWidgets) {
          return !widget.props.customdataSource;
        },
      },
      // 支持配置多字段显示
      {
        component: 'rdo-display-fields-editor',
        label: 'sys.model.displayField',
        name: 'displayFields',
        group: PropGroup.FIELD_CONFIG,
        hidden(widget) {
          return (
            !widget.props.bindModelKey ||
            widget.props.fieldReadonly ||
            widget.props.readonly ||
            widget.platform === Platform.MOBILE
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
      this.showSearchEditor,
      this.searchFieldEditor,
      {
        component: 'switch-editor',
        name: 'rdoVersion',
        label: 'sys.pageDesigner.rdoVersion',
        group: PropGroup.FIELD_CONFIG,
        hidden(widget) {
          return (
            !widget.props.bindModelKey ||
            widget.props.fieldReadonly ||
            widget.props.readonly ||
            widget.platform === Platform.MOBILE
          );
        },
        onMounted(widget) {
          if (widget.props?.rdoVersion === undefined) {
            widget.props.rdoVersion = true;
          }
        },
      },
    ];
  }
}

export const widget: ISearchSelect = SearchSelect.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchSelect.getInstance().getSearchPropEditor();
