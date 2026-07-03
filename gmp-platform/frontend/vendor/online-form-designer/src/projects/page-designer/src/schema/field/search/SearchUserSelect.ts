import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { CreateType, FIELD_TYPE } from '@/enums/appEnum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchSelect as ISearchSelect, Select } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';


class SearchSelect extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  ignoreOptions: [];
  /** 是否启用了其他选项 */
  useMore: string;
  bindModelKey: string;
  modelKey: string;
  searchField: string[];
  exp?: string;
  refModelType?: EntityModelTypeEnum;
  customdataSource = false;
  datasourceConfig?: object;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.select';
    this.type = SearchComponents.SearchUserSelect;
    this.moreOptions = [];
    this.ignoreOptions = [];
    this.useMore = '';
    this.bindModelKey = '';
    this.modelKey = '';
    this.searchField = [];
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
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
        searchField: this.searchField,
        customMenu: false,
        customMenuFilter: [],
        customMenuOptions: [],
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

  get defaultValueEditor() {
    return {
      component: 'select-editor',
      name: 'defaultValue',
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        // showSearch: true,
        options: async (widget: SearchWidgets) => {
          return [
            { label: $t('sys.sysCurrentUser'), value: 'CURRENT_USER', type: 'SYS_VAR' },
          ];
        },
      },
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      this.defaultValueEditor,
      this.opeEditor,
      this.moreOptionsEditor,
      this.ignoreEditor,
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
    ];
  }
}

export const widget: ISearchSelect = SearchSelect.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchSelect.getInstance().getSearchPropEditor();
