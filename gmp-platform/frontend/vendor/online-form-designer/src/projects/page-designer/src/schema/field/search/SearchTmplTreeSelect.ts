import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { CreateType, FIELD_TYPE } from '@/enums/appEnum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchTmplTreeSelect as ISearchSelect, Select } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';

class SearchTmplTreeSelect extends BaseSearch {
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
  constructor() {
    super();
    this.name = 'sys.pageDesigner.select';
    this.type = SearchComponents.SearchTmplTreeSelect;

    this.moreOptions = [];
    this.ignoreOptions = [];
    this.useMore = '';
    this.bindModelKey = '';
    this.modelKey = '';
    this.showSearch = false;
    this.searchField = [];
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchTmplTreeSelect();
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
      },
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      this.showSearchEditor,
      this.searchFieldEditor,
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

export const widget: ISearchSelect = SearchTmplTreeSelect.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchTmplTreeSelect.getInstance().getSearchPropEditor();
