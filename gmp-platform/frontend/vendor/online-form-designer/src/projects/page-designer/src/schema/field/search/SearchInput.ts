import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup, Platform } from '/@page-designer/enum';
import { SearchInput as ISearchInput } from '/@page-designer/types/web';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { MaterialEnum, FIELD_TYPE } from '/@/enums/appEnum';

class SearchInput extends BaseSearch {
  maxlength: number;
  enterSearch: boolean;
  searchTooltip: boolean;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchInput';
    this.type = SearchComponents.SearchInput;
    this.maxlength = 200;
    this.enterSearch = true;
    this.searchTooltip = false;
    this.displayLabelText = true;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchInput();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.baseProps,
        maxlength: this.maxlength,
        enterSearch: this.enterSearch,
      },
    };
  }

  get defaultValueEditor() {
    return {
      component: 'text-editor',
      name: 'defaultValue',
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
    };
  }

  get maxlengthEditor() {
    return {
      component: 'number-editor',
      name: 'maxlength',
      label: 'sys.pageDesigner.maxlength',
      group: PropGroup.FIELD_CONFIG,
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

  get searchTooltipEditor() {
    return {
      component: 'switch-editor',
      name: 'searchTooltip',
      label: 'sys.pageDesigner.searchTooltip',
      group: PropGroup.FIELD_CONFIG,
      hidden: (widget) => {
        return (
          widget.props.fieldType !== FIELD_TYPE.TEXT ||
          widget.platform !== Platform.WEB ||
          widget.materialType === MaterialEnum.MaterialTableField
        );
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
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      this.defaultValueEditor,
      this.maxlengthEditor,
      this.enterSearchEditor,
      this.searchTooltipEditor,
      this.opeEditor,
    ];
  }
}

export const widget: ISearchInput = SearchInput.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchInput.getInstance().getSearchPropEditor();
