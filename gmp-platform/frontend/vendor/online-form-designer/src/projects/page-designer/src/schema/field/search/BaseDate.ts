import { PropGroup } from '/@page-designer/enum';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import BaseSearch, { getSearchOptions } from './BaseSearch';
import { SEARCH_SEVICE } from '@gct/runtime';

class BaseDate extends BaseSearch {
  /**日期范围 */
  range: undefined;
  /**是否区间搜索 */
  isRang: boolean;
  /**区间跨度（天） */
  sectionDate: undefined;
  /**默认值 */
  defaultExpression: undefined;
  /**默认开始 */
  defaultStartExpression: undefined;
  /**默认结束 */
  defaultEndExpression: undefined;
  /**区间跨度（天） */
  sectionTime: undefined;
  // 是否显示时间
  isShowTime: boolean = true;

  constructor() {
    super();

    this.range = undefined;
    this.isRang = true;
    this.sectionDate = undefined;
    this.defaultExpression = undefined;
    this.defaultStartExpression = undefined;
    this.defaultEndExpression = undefined;
    this.sectionTime = undefined;
    this.placeholder = 'sys.chooseText';
  }

  override get baseProps() {
    return {
      ...super.baseProps,
      isShowTime: this.isShowTime,
    };
  }

  getBaseDateProps() {
    return {
      ...this.baseProps,
      range: this.range,
      isRang: this.isRang,
      sectionDate: this.sectionDate,
      defaultExpression: this.defaultExpression,
      defaultStartExpression: this.defaultStartExpression,
      defaultEndExpression: this.defaultEndExpression,
    };
  }

  getBaseTimeProps() {
    return {
      ...this.baseProps,
      isRang: this.isRang,
      sectionTime: this.sectionTime,
      defaultExpression: this.defaultExpression,
      defaultStartExpression: this.defaultStartExpression,
      defaultEndExpression: this.defaultEndExpression,
    };
  }

  get sectionDateEditor() {
    return {
      component: 'number-editor',
      name: 'sectionDate',
      label: 'sys.pageDesigner.rangSpan',
      group: PropGroup.FIELD_CONFIG,
    };
  }

  get sectionTimeEditor() {
    return {
      component: 'number-editor',
      name: 'sectionTime',
      label: 'sys.pageDesigner.rangSpan',
      group: PropGroup.FIELD_CONFIG,
    };
  }

  override get isRangEditor() {
    return {
      component: 'switch-editor',
      name: 'isRang',
      label: 'sys.pageDesigner.rangSearch',
      group: PropGroup.FIELD_CONFIG,
      changeCallback(widget: SearchWidgets, isRang: boolean) {
        widget.props.ope = isRang ? [SEARCH_SEVICE.RANGE] : [SEARCH_SEVICE.EQ];
        widget.props.defaultValueType = null;
        widget.props.defaultValue = null;
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
          options() {
            return getSearchOptions('rangtype');
          },
        },
      },
    ];
  }
}

export default BaseDate;
