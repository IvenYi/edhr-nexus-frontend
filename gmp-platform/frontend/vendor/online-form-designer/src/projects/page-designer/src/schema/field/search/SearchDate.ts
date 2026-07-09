import { SearchComponents } from '/@page-designer/enum';
import { SearchDate as ISearchDate } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { SearchDateTime } from './SearchDateTime';

class SearchDate extends SearchDateTime {
  static override instance: any;

  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchDate';
    this.type = SearchComponents.SearchDate;

    this.dateType = 'YYYY-MM-DD';
  }

  static override getInstance() {
    if (!this.instance) {
      this.instance = new SearchDate();
    }
    return this.instance;
  }
}

export const widget: ISearchDate = SearchDate.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchDate.getInstance().getSearchPropEditor();
