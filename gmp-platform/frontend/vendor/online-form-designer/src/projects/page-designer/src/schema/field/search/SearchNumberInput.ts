import { SEARCH_SEVICE } from '@gct/runtime';
import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchNumberInput as ISearchNumberInput } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

export class SearchNumberInput extends BaseSearch {
  maxValue: undefined;
  minValue: undefined;
  /** 是否区间搜索 */
  isRang: boolean;

  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchNumber';
    this.type = SearchComponents.SearchNumberInput;
    this.maxValue = undefined;
    this.minValue = undefined;
    this.isRang = true;
    this.displayLabelText = true;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchNumberInput();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.baseProps,
        maxValue: this.maxValue,
        minValue: this.minValue,
        isRang: this.isRang,
      },
    };
  }

  get opeEditor() {
    return [
      {
        component: 'radio-list-editor',
        name: 'ope',
        label: 'sys.pageDesigner.operator',
        group: PropGroup.OPERATOR_CONFIG,
        hidden: (widget: SearchWidgets) => {
          return widget.props.isRang;
        },
        _config: {
          // minlength: 1,
          options(widget: SearchWidgets) {
            return getSearchOptions(widget.props.fieldType);
          },
        },
      },
      {
        component: 'radio-list-editor',
        name: 'ope',
        label: 'sys.pageDesigner.operator',
        group: PropGroup.OPERATOR_CONFIG,
        hidden: (widget: SearchWidgets) => {
          return !widget.props.isRang;
        },
        _config: {
          // minlength: 1,
          // maxlength: 1,
          options: getSearchOptions('rangtype'),
        },
      },
    ];
  }

  get defaultValueEditor() {
    return [
      {
        component: 'rang-number-editor',
        name: 'defaultValue',
        label: 'sys.pageDesigner.defaultValue',
        group: PropGroup.FIELD_CONFIG,
        hidden: (widget: SearchWidgets) => {
          return !widget.props.isRang;
        },
      },
      {
        component: 'number-editor',
        name: 'defaultValue',
        label: 'sys.pageDesigner.defaultValue',
        group: PropGroup.FIELD_CONFIG,
        hidden: (widget: SearchWidgets) => {
          return widget.props.isRang;
        },
      },
    ];
  }

  override get isRangEditor() {
    return {
      component: 'switch-editor',
      name: 'isRang',
      label: 'sys.pageDesigner.rangSearch',
      group: PropGroup.FIELD_CONFIG,
      changeCallback(widget: SearchWidgets, isRang: boolean) {
        widget.props.ope = isRang ? [SEARCH_SEVICE.RANGE] : [SEARCH_SEVICE.EQ];
        widget.props.defaultValue = undefined;
      },
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      this.isRangEditor,
      ...this.opeEditor,
      ...this.defaultValueEditor,
    ];
  }
}

export const widget: ISearchNumberInput = SearchNumberInput.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchNumberInput.getInstance().getSearchPropEditor();
