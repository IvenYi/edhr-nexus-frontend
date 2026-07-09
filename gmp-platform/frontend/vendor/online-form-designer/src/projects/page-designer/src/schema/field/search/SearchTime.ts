import BaseDate from './BaseDate';
import { SearchComponents } from '/@page-designer/enum';
import { SearchTime as ISearchTime } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

class SearchTime extends BaseDate {
  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchTime';
    this.type = SearchComponents.SearchTime;
    this.displayLabelText = true;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchTime();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.getBaseTimeProps(),
      },
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      this.isRangEditor,
      ...this.opeEditor,
    ];
  }
}

export const widget: ISearchTime = SearchTime.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchTime.getInstance().getSearchPropEditor();
