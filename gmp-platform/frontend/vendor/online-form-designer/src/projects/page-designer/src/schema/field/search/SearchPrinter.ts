import BaseSearch, { getSearchOptions } from './BaseSearch';
import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
import { SearchComponents, PropGroup, BindCmpStyleEnum } from '/@page-designer/enum';
import { SearchPrinter as ISearchPrinter } from '/@page-designer/types/web';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { isMultipleOperator } from '@gct/runtime';

class SearchPrinter extends BaseSearch {
  moreOptions: SEARCH_SEVICE[];
  ignoreOptions: [];
  bindCompStyleType: BindCmpStyleEnum;
  /** 是否启用了其他选项 */
  useMore: string;
  /** 所有选中的选项 */
  selectOption: any;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchPrinter';
    this.type = SearchComponents.SearchPrinter;
    this.placeholder = 'sys.chooseText';
    this.displayLabelText = true;
    this.defaultValue = undefined;
    this.useMore = '';
    this.bindCompStyleType = BindCmpStyleEnum.CMP_TREE_SELECTION;
    this.selectOption = [];
    this.moreOptions = [];
    this.ignoreOptions = [];
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchPrinter();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.baseProps,
        useMore: this.useMore,
        bindCompStyleType: this.bindCompStyleType,
        moreOptions: this.moreOptions,
        ignoreOptions: this.ignoreOptions,
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
        // 根据算子设置选择是否为多选
        dataChange(widget: SearchWidgets, val: string[]) {
          const multiple = isMultipleOperator(val);
          widget.props.multiple = multiple;
        },
      },
    };
  }
  get defaultValueEditor() {
    return {
      component: 'printer-select-option-editor',
      name: { defaultValue: 'defaultValue', selectOption: 'selectOption' },
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
      hidden: (widget) => {
        return !widget.props.modelKey;
      },
      _config: {
        defaultExpandAll: true,
        clearable: true,
        tagName: 'sys.default',
        supportGlobData: true,
        showTagFunc: (row) => row.defaultPrint === '是',
        options: async (widget) => {
          if (!widget.props.modelKey) return [];

          const data: any[] = (await getPrintPrintDropdownList()) || [];

          return data.map((i) => {
            const dftInfo =
              (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
              undefined;
            return {
              ...i,
              value: i.printKey,
              label: i.name,
              disabled: i.type === PrintResourceEnum.INTERNET_PRINT,
              dftPrintInfo:
                i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
                  ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
                  : undefined,
              children: i.printChildNode
                ? i.printChildNode.map((e) => {
                    return {
                      ...e,
                      value: e.printKey,
                      label: e.name,
                    };
                  })
                : [],
            };
          });
        },
      },
    };
  }

  getSearchPropEditor() {
    return [...this.labelEditor, this.placeholderEditor, this.defaultValueEditor, this.opeEditor, this.moreOptionsEditor, this.ignoreEditor];
  }
}

export const widget: ISearchPrinter = SearchPrinter.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchPrinter.getInstance().getSearchPropEditor();
