import { FIELD_TYPE, SEARCH_SEVICE } from '@gct/runtime';
import BaseDate from './BaseDate';
import { PropGroup, SearchComponents } from '/@page-designer/enum';
import { SearchDateTime as ISearchDateTime } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

export class SearchDateTime extends BaseDate {
  /**组件类型 */
  dateType: string;

  // 默认值类型
  defaultValueType: string;
  /**显示时间 */
  isShowTime: boolean;
  constructor() {
    super();
    this.name = 'sys.pageDesigner.searchDatetime';
    this.type = SearchComponents.SearchDateTime;

    this.dateType = 'YYYY-MM-DD HH:mm';
    this.displayLabelText = true;
    this.defaultValueType = '';
    this.defaultValue = '';
    this.isShowTime = true;
  }

  get showTime() {
    return {
      component: 'switch-editor',
      name: 'isShowTime',
      label: 'sys.pageDesigner.bindCmpStyle.bindTime',
      group: PropGroup.FIELD_CONFIG,
      hidden(widget) {
        const { fieldType } = widget.props;
        if (fieldType === FIELD_TYPE.DATE_TIME) {
          return false;
        }
        return true;
      },
      changeCallback(widget: any, val: boolean) {
        const { props } = widget;
        if (val === true) {
          props.dateType = 'YYYY-MM-DD HH:mm';
        } else {
          props.dateType = 'YYYY-MM-DD';
        }
      },
    };
  }

  get defaultValueEditor() {
    return {
      component: 'date-default-value-editor',
      name: { list: 'defaultValueType;defaultValue' },
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
      hidden: (widget) => {
        const { isRang, ope, fieldType } = widget.props;
        if (fieldType === FIELD_TYPE.DATE || fieldType === FIELD_TYPE.DATE_TIME) {
          return isRang === true && (!ope || !ope.includes(SEARCH_SEVICE.RANGE));
        }
        return true;
      },
    };
  }

  override get opeEditor() {
    const items = super.opeEditor;
    const changeCallback = (widget) => {
      widget.props.defaultValueType = null;
      widget.props.defaultValue = null;
    };
    items[0].changeCallback = changeCallback;
    items[1].changeCallback = changeCallback;
    return items;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SearchDateTime();
    }
    return this.instance;
  }

  getSearchWidget() {
    return {
      ...this.baseAttrs,
      props: {
        ...this.getBaseDateProps(),
        dateType: this.dateType,
      },
    };
  }

  getSearchPropEditor() {
    return [
      ...this.labelEditor,
      this.placeholderEditor,
      this.isRangEditor,
      this.defaultValueEditor,
      this.showTime,
      ...this.opeEditor,
    ];
  }
}

export const widget: ISearchDateTime = SearchDateTime.getInstance().getSearchWidget();

export const propEditorList: LowCodeWidget.PropEditor[] =
  SearchDateTime.getInstance().getSearchPropEditor();
