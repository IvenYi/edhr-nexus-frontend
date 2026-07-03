import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup, Platform } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { CreateType, FIELD_TYPE } from '@/enums/appEnum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchSelect as ISearchSelect, Select } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { EntityModelCategoryEnum, EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
import { getModelComprehensiveEnumInfoByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { isMultipleOperator } from '@gct/runtime';

class SearchSelect extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  ignoreOptions: [];
  /** 是否启用了其他选项 */
  useMore: string;
  bindModelKey: string;
  modelKey: string;
  showSearch: boolean;
  searchField: string[];
  exp?: string;
  refModelType?: EntityModelTypeEnum;
  enterSearch: boolean;
  /** 自定义枚举值标识 */
  customMenu: boolean;
  /** 自定义枚举值选项值 */
  customMenuFilter: string[] | number[] | boolean[];
  /** 自定义枚举值选项 */
  customMenuOptions: { key: string; value: string }[];
  constructor() {
    super();
    this.name = 'sys.pageDesigner.select';
    this.type = SearchComponents.SearchSelectDepartment;

    this.moreOptions = [];
    this.ignoreOptions = [];
    this.useMore = '';
    this.bindModelKey = '';
    this.modelKey = '';
    this.showSearch = false;
    this.searchField = [];
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
    this.customMenu = false;
    this.customMenuFilter = [];
    this.customMenuOptions = [];
    this.enterSearch = true;
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
        customMenu: false,
        customMenuFilter: [],
        customMenuOptions: [],
        enterSearch: this.enterSearch,
      },
    };
  }

  get showSearchEditor() {
    return {
      component: 'switch-editor',
      name: 'showSearch',
      label: 'sys.pageDesigner.search',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        return (
          widget.props.fieldType !== FIELD_TYPE.REF &&
          widget.props.fieldType !== FIELD_TYPE.REF_MULTI
        );
      },
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
        // 根据算子设置选择是否为多选
        dataChange(widget: SearchWidgets, val: string[]) {
          const multiple = isMultipleOperator(val);
          widget.props.multiple = multiple;
          // if (multiple == true && typeof widget.props.defaultValue !== 'object') {
          //   widget.props.defaultValue = [];
          // } else if (multiple == false && typeof widget.props.defaultValue === 'object') {
          //   widget.props.defaultValue = '';
          // }
        },
      },
    };
  }

  get defaultValueEditor() {
    return {
      component: 'select-editor',
      name: 'defaultValue',
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
      hidden: (widget) => {
        const type = widget.props.fieldType;
        switch (type) {
          case FIELD_TYPE.USER:
          case FIELD_TYPE.USER_MULTI:
          case FIELD_TYPE.ORG:
          case FIELD_TYPE.ORG_MULTI:
          case FIELD_TYPE.ENUM:
          case FIELD_TYPE.ENUM_MULTI:
            return false;
          default:
            return true;
        }
      },
      _config: {
        showSearch: true,
        options: async (widget: any) => {
          const type = widget.props.fieldType;
          switch (type) {
            case FIELD_TYPE.USER:
            case FIELD_TYPE.USER_MULTI:
              return [
                { label: window.$t('sys.sysCurrentUser'), value: 'CURRENT_USER', type: 'SYS_VAR' },
              ];
            case FIELD_TYPE.ORG:
            case FIELD_TYPE.ORG_MULTI:
              return [
                { label: window.$t('sys.sysCurrentOrg'), value: 'CURRENT_ORG', type: 'SYS_VAR' },
              ];
            case FIELD_TYPE.ENUM:
            case FIELD_TYPE.ENUM_MULTI:
              let res = await getModelComprehensiveEnumInfoByModelCategory(
                {
                  modelCategory:
                    widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY,
                },
                {
                  fieldKey: widget.props.field,
                  modelKey: widget.props.modelKey!,
                },
              );
              if (res) {
                if (widget.props.customMenu === true) {
                  res = res.filter((_) => {
                    return widget.props.customMenuFilter.includes(_.value);
                  });
                }
                return res.map((_) => {
                  return {
                    label: _.text,
                    value: _.value,
                  };
                });
              }
              return [];
            default:
              return [];
          }
        },
      },
    };
  }

  get enterSearchEditor() {
    return {
      component: 'switch-editor',
      name: 'enterSearch',
      label: 'sys.pageDesigner.enterSearch',
      group: PropGroup.FIELD_CONFIG,
      hidden: (widget) => widget.platform !== Platform.WEB,
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      {
        component: 'switch-editor',
        name: 'customMenu',
        label: 'sys.pageDesigner.customMenu',
        group: PropGroup.FIELD_CONFIG,
        hidden(widget: Select) {
          return (
            widget.props.readonly ||
            widget.props.fieldReadonly ||
            (widget.props.fieldType !== FIELD_TYPE.ENUM &&
              widget.props.fieldType !== FIELD_TYPE.ENUM_MULTI)
          );
        },
        changeCallback(widget, val) {
          const multiple = isMultipleOperator(widget.props.ope);
          if (multiple === true) {
            widget.props.defaultValue = [];
          } else {
            widget.props.defaultValue = '';
          }
        },
      },
      {
        component: 'select-editor',
        name: 'customMenuFilter',
        label: 'sys.pageDesigner.menuValue',
        group: PropGroup.FIELD_CONFIG,
        required: true,
        hidden: (widget) => {
          return widget.props.readonly || widget.props.fieldReadonly || !widget.props.customMenu;
        },
        changeCallback(widget, val) {
          const defaultVal = widget.props.defaultValue;
          if (typeof defaultVal === 'string') {
            const i = val.findIndex((_) => {
              return _ === defaultVal;
            });
            if (i === -1) {
              widget.props.defaultValue = '';
            }
          } else {
            widget.props.defaultValue = defaultVal.filter((_) => {
              return widget.props.customMenuFilter.includes(_);
            });
          }
        },
        _config: {
          supportGlobData: true,
          multiple: true,
          options: async (widget) => {
            const data =
              (await getModelComprehensiveEnumInfoByModelCategory(
                {
                  modelCategory:
                    widget.props.modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY,
                },
                {
                  modelKey: widget.props.modelKey,
                  fieldKey: widget.props.field,
                },
              )) || [];
            // const defaultOpt = !widget.props.multiple ? [{ value: '', label: 'sys.none' }] : [];
            return data.map((i) => {
              return { value: i.value, label: i.text };
            });
          },
        },
      },
      this.showSearchEditor,
      this.searchFieldEditor,
      this.defaultValueEditor,
      this.enterSearchEditor,
      this.opeEditor,
      this.moreOptionsEditor,
      this.ignoreEditor,
      // 数据联动
      {
        component: 'data-linkage2-editor',
        name: 'ruleConfig',
        label: '',
        group: PropGroup.DATALINKAGE,
        _config: {
          filterFields: [FIELD_TYPE.REF],
          filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
        },
        hidden(widget: Select) {
          return (
            !widget.props.bindModelKey ||
            widget.props.fieldReadonly ||
            (widget.props.fieldType !== FIELD_TYPE.REF &&
              widget.props.fieldType !== FIELD_TYPE.REF_MULTI)
          );
        },
      },
    ];
  }
}

export const widget: ISearchSelect = SearchSelect.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchSelect.getInstance().getSearchPropEditor();
