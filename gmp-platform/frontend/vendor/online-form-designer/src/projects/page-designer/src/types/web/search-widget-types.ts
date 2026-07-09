import { LowCodeWidget } from '../widget-basic-types';
import { DateRangeEnums } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';

export interface SearchInput extends LowCodeWidget.SearchSchema {
  props: {
    maxlength: number;
    /** 回车搜索 */
    enterSearch: boolean;
  } & LowCodeWidget.SearchSchema['props'];
}

export interface SearchTransaction extends LowCodeWidget.SearchSchema {
  props: {
    maxlength: number;
    /** 回车搜索 */
    enterSearch: boolean;
  } & LowCodeWidget.SearchSchema['props'];
}

export interface SearchPrinter extends LowCodeWidget.SearchSchema {
  props: {
    maxlength: number;
    /** 回车搜索 */
    enterSearch: boolean;
  } & LowCodeWidget.SearchSchema['props'];
}

export interface SearchNumberInput extends LowCodeWidget.SearchSchema {
  props: {
    maxValue?: number;
    minValue?: number;
  } & LowCodeWidget.SearchSchema['props'];
}
export interface SearchSwitch extends LowCodeWidget.SearchSchema {
  props: {
    checkedChildren: string;
    unCheckedChildren: string;
    moreOptions: SEARCH_SEVICE[];
  } & LowCodeWidget.SearchSchema['props'];
}
export interface SearchDate extends LowCodeWidget.SearchSchema {
  props: {
    /**组件类型 */
    dateType: 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD';
    /**日期范围 */
    range?: keyof typeof DateRangeEnums;

    /**区间跨度（天） */
    sectionDate?: number;
    /**默认值 */
    defaultExpression?: string;
    /**默认开始 */
    defaultStartExpression?: string;
    /**默认结束 */
    defaultEndExpression?: string;
  } & LowCodeWidget.SearchSchema['props'];
}
export interface SearchDateTime extends LowCodeWidget.SearchSchema {
  props: {
    /**组件类型 */
    dateType: 'YYYY HH' | 'YYYY-MM HH:mm' | 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD';
    /**日期范围 */
    range?: keyof typeof DateRangeEnums;

    /**区间跨度（天） */
    sectionDate?: number;
    /**默认值 */
    defaultExpression?: string;
    /**默认开始 */
    defaultStartExpression?: string;
    /**默认结束 */
    defaultEndExpression?: string;
  } & LowCodeWidget.SearchSchema['props'];
}
export interface SearchTime extends LowCodeWidget.SearchSchema {
  props: {
    /**区间跨度（小时） */
    sectionTime?: number;
    /**默认值 */
    defaultExpression?: string;
    /**默认开始 */
    defaultStartExpression?: string;
    /**默认结束 */
    defaultEndExpression?: string;
  } & LowCodeWidget.SearchSchema['props'];
}

export interface SearchSelect extends LowCodeWidget.SearchSchema {
  props: {
    bindModelKey: string;
    modelKey: string;
    selectType?: string;
    moreOptions: SEARCH_SEVICE[];
    showSearch: boolean;
    searchField: string[];
    refModelType?: EntityModelTypeEnum;
  } & LowCodeWidget.SearchSchema['props'];
}

export interface SearchTmplTreeSelect extends LowCodeWidget.SearchSchema {
  props: {
    bindModelKey: string;
    modelKey: string;
    selectType?: string;
    moreOptions: SEARCH_SEVICE[];
    showSearch: boolean;
    searchField: string[];
    refModelType?: EntityModelTypeEnum;
  } & LowCodeWidget.SearchSchema['props'];
}
export interface SearchBizProcess extends LowCodeWidget.SearchSchema {
  props: {
    bindModelKey: string;
    modelKey: string;
    selectType?: string;
    moreOptions: SEARCH_SEVICE[];
    showSearch: boolean;
    searchField: string[];
    refModelType?: EntityModelTypeEnum;
  } & LowCodeWidget.SearchSchema['props'];
}

export type SearchWidgets =
  | SearchInput
  | SearchNumberInput
  | SearchSwitch
  | SearchDate
  | SearchDateTime
  | SearchTime
  | SearchSelect
  | SearchBizProcess;
