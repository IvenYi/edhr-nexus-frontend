import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SearchComponents, PropGroup } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { SearchSwitch as ISearchSwitch } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

class SearchSwitch extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  /** 是否启用了其他选项 */
  useMore: string;
  checkedChildren: string;
  unCheckedChildren: string;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchSwitch';
    this.type = SearchComponents.SearchSwitch;

    this.moreOptions = [];
    this.useMore = '';
    this.checkedChildren = '是';
    this.unCheckedChildren = '否';
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchSwitch();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.baseProps,
        moreOptions: this.moreOptions,
        useMore: this.useMore,
        checkedChildren: this.checkedChildren,
        unCheckedChildren: this.unCheckedChildren,
      },
    };
  }

  get checkedChildrenEditor() {
    return {
      component: 'text-editor',
      name: 'checkedChildren',
      label: 'sys.pageDesigner.checkedLabel',
      group: PropGroup.BASIC,
    };
  }

  get unCheckedChildrenEditor() {
    return {
      component: 'text-editor',
      name: 'unCheckedChildren',
      label: 'sys.pageDesigner.uncheckedLabel',
      group: PropGroup.BASIC,
    };
  }

  get defaultValueEditor() {
    return {
      component: 'select-editor',
      name: 'defaultValue',
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        options: async (widget) => {
          const info = await FieldSchema.getConfigByField(
            widget.props.modelKey,
            widget.props.field,
          );
          const option = info?.specificConfig;
          const excludes = ['ruleConfig'];

          return option
            ? Object.entries(option).filter(([value, _]) => !excludes.includes(value)).map(([value, label]) => ({
                label,
                value: (value === true || value === 'true') ? 1 : 0,
              }))
            : [];
        },
        valueType: 'boolean',
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
      // this.checkedChildrenEditor,
      // this.unCheckedChildrenEditor,
      this.defaultValueEditor,
      this.opeEditor,
      // this.moreOptionsEditor,
    ];
  }
}

export const widget: ISearchSwitch = SearchSwitch.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchSwitch.getInstance().getSearchPropEditor();
