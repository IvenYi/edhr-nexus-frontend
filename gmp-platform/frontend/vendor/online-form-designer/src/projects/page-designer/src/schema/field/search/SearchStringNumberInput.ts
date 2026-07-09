import { SearchNumberInput as ISearchNumberInput, SearchWidgets } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { SearchNumberInput } from './SearchNumberInput';
import { PropGroup, SearchComponents } from '@gct/runtime';

/**
 * 高精度小数数值输入框
 *
 * @author zhanghanrui
 * @date 2024-09-13 11:09:07
 * @class SearchStringNumberInput
 * @extends {SearchNumberInput}
 */
class SearchStringNumberInput extends SearchNumberInput {
  static override instance;
  constructor() {
    super();
    this.type = SearchComponents.SearchStringNumberInput;
  }

  static override getInstance() {
    if (!this.instance) {
      this.instance = new SearchStringNumberInput();
    }
    return this.instance;
  }

  override get defaultValueEditor() {
    return [
      {
        component: 'rang-number-editor',
        name: 'defaultValue',
        label: 'sys.pageDesigner.defaultValue',
        group: PropGroup.FIELD_CONFIG,
        hidden: (widget: SearchWidgets) => {
          return !widget.props.isRang;
        },
        _config: {
          stringMode: true,
          precision: -1,
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
        _config: {
          stringMode: true,
          precision: -1,
        },
      },
    ];
  }
}

export const widget: ISearchNumberInput = SearchStringNumberInput.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchStringNumberInput.getInstance().getSearchPropEditor();
