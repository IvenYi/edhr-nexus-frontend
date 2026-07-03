import { SearchComponents, PropGroup, TableSearchTypeEnum } from '/@page-designer/enum';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { SEARCH_TYPE } from '/@page-designer/schema/common';
import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
import { displayProps } from '../../common-config/display-editor-config';

export function getSearchOptions(type: SearchWidgets['props']['fieldType'] | 'more' | 'rangtype' | 'ignore') {
  return (
    SEARCH_TYPE[type!].filter?.map((i) => {
      return { label: `sys.model.${i}`, value: i };
    }) || []
  );
}

class BaseSearch {
  static instance;
  /** 组件唯一标识 */
  id: string;
  /** 组件名称 */
  name: string | undefined;
  /**组件类型 需和文件名一致 */
  type: SearchComponents | undefined;
  /**i18n字段 */
  i18n: Record<string, string>;
  /**字段key */
  field: string;
  /**字段id */
  fieldId: string;
  /**字段类型 */
  fieldType: FIELD_TYPE | undefined;
  /**字段名称 */
  label: string;
  /** 默认值 */
  defaultValue: any;
  /**显示标题 */
  displayLabelText: boolean;

  clearable: boolean;
  ope: SEARCH_SEVICE[];
  placeholder: string;

  constructor() {
    this.id = '';
    this.name = undefined;
    this.type = undefined;
    this.i18n = {};
    this.field = '';
    this.fieldId = '';
    this.fieldType = undefined;
    this.label = '';
    this.displayLabelText = true;
    this.defaultValue = undefined;
    this.clearable = true;
    this.ope = [];
    this.placeholder = 'sys.inputText';
  }

  get baseAttrs() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      i18n: this.i18n,
    };
  }

  get baseProps() {
    return {
      field: this.field,
      fieldId: this.fieldId,
      fieldType: this.fieldType,
      label: this.label,
      displayLabelText: this.displayLabelText,
      defaultValue: this.defaultValue,
      clearable: this.clearable,
      ope: this.ope,
      placeholder: this.placeholder,
      ...displayProps,
    };
  }

  get labelEditor() {
    return [
      {
        component: 'custom-name-editor',
        name: 'label',
        label: 'sys.pageDesigner.fieldTitle',
        group: PropGroup.BASIC,
        _config: {
          formItemCheckbox: {
            label: 'sys.pageDesigner.displayLabelText',
            propsKey: 'displayLabelText',
          },
        },
      },
      // {
      //   component: 'checkbox-editor',
      //   name: 'displayLabelText',
      //   label: '',
      //   group: PropGroup.BASIC,
      // },
      {
        component: 'input-attr-editor',
        name: '',
        label: 'sys.pageDesigner.inputAttr',
        group: PropGroup.FIELD_CONFIG,
        _config: {
          needFieldAttrs: ['readonly'],
        },
        hidden: (widget) => {
          return (
            (widget.isSearchField && widget.materialType === 'tableField') ||
            widget.props.field === 'operating_state_'
          );
        },
      },
      {
        component: 'dependency-editor',
        name: 'componentDependency',
        label: '',
        group: PropGroup.COMPONENTDEPENDENCY,
        hidden: (widget) => {
          return (
            (widget.isSearchField && widget.materialType === 'tableField') ||
            widget.props.field === 'operating_state_'
          );
        },
      },
    ];
  }

  get placeholderEditor() {
    return {
      component: 'text-editor',
      name: 'placeholder',
      label: 'sys.pageDesigner.fieldPlaceholder',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
    };
  }

  get isRangEditor() {
    return {
      component: 'switch-editor',
      name: 'isRang',
      label: 'sys.pageDesigner.rangSearch',
      group: PropGroup.FIELD_CONFIG,
      changeCallback(widget: SearchWidgets, isRang: boolean) {
        widget.props.ope = isRang ? [SEARCH_SEVICE.RANGE] : [SEARCH_SEVICE.EQ];
      },
    };
  }

  get moreOptionsEditor() {
    return {
      component: 'checkbox-list-editor',
      name: 'moreOptions',
      label: 'sys.pageDesigner.nullCondition',
      group: PropGroup.OPERATOR_CONFIG,
      _config: {
        options: () => getSearchOptions('more'),
      },
    };
  }

  get ignoreEditor() {
    return {
      component: 'checkbox-list-editor',
      name: 'ignoreOptions',
      label: 'sys.pageDesigner.matchingRule',
      group: PropGroup.OPERATOR_CONFIG,
      _config: {
        options: () => getSearchOptions('ignore'),
      },
    };
  }

  // propEditor
}

export default BaseSearch;
