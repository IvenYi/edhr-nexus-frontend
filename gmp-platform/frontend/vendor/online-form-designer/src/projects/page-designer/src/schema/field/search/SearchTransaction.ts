import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SearchTransaction as ISearchTransaction } from '/@page-designer/types/web';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { SEARCH_SEVICE } from '@/enums/designEnum';

class SearchTransaction extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  ignoreOptions: [];
  useMore: string;
  searchField: string[];
  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchTransaction';
    this.type = SearchComponents.SearchTransaction;
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
    this.moreOptions = [];
    this.ignoreOptions = [];
    this.useMore = '';
    this.searchField = [];
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchTransaction();
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
        searchField: this.searchField,
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
        // minlength: 1,
        options(widget: SearchWidgets) {
          return getSearchOptions(widget.props.fieldType);
        },
      },
    };
  }

  getSearchPropEditor() {
    return [...this.labelEditor, this.placeholderEditor, this.opeEditor, this.moreOptionsEditor, this.ignoreEditor];
  }
}

export const widget: ISearchTransaction = SearchTransaction.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchTransaction.getInstance().getSearchPropEditor();
