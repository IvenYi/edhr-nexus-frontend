import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { CreateType, FIELD_TYPE } from '@/enums/appEnum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchSelect as ISearchSelect, Select } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { EntityModelCategoryEnum, EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';

class SearchSelect extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  ignoreOptions: [];
  /** 是否启用了其他选项 */
  useMore: string;
  exp?: string;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.select';
    this.type = SearchComponents.SearchSelectRangUser;

    this.moreOptions = [];
    this.ignoreOptions = [];
    this.useMore = '';
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
    ];
  }
}

export const widget: ISearchSelect = SearchSelect.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchSelect.getInstance().getSearchPropEditor();
