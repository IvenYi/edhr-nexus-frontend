import { CSSProperties } from 'vue';
import { PanelType } from '/@online-form/views/designer/enums';
import {
  PaperWidgeValueType,
  PaperWidgeType,
  BwipCodeType,
  DiagonalDirection,
  WidgetImageSizeMode,
  LineType,
  LineDirection,
  TimeDiffFormat,
} from '@gct/nocode-base';
import { CreateType } from '@gct/runtime';

import type { IBindField } from '@gct/nocode-base';

export namespace PaperWidget {
  export interface BasicSchema {
    /** 组件id */
    id: string;
    icon: string;
    /** 组件类型 */
    type: PaperWidgeType;
    name: string;
    /** 组件值 */
    value?: string;
    layout: {
      width?: number;
      height?: number;
      top?: number;
      left?: number;
    };
    resizable: boolean;
    sort: number;
    dragToPos: PanelType[];
  }

  export interface Text extends BasicSchema {
    type: PaperWidgeType.Text;
    valueType: PaperWidgeValueType;
    fieldType?: string; // 字段类型
    modelKey?: string; // 模型key
    modelLink?: string; // 模型链路
    fieldLink?: string; // 字段链路
    isFieldModel?: boolean; // 是否是关联模型字段
    subModelKey?: string; // 子表模型key
    subFieldKey?: string; // 子表字段key
    createType?: CreateType; // 字段来源
    /** 引用的模型key */
    refModelKey?: string;
    styles: {
      fontFamily: string;
      fontSize: number;
      color: string;
      fontWeight?: string;
      fontStyle?: string;
      textDecoration?: string;
      alignItems: string;
      justifyContent: string;
    };
  }

  export interface Image extends BasicSchema {
    type: PaperWidgeType.Image;
    sizeMode: WidgetImageSizeMode;
  }

  export interface Barcode extends BasicSchema {
    type: PaperWidgeType.Barcode;
    valueType: PaperWidgeValueType;
    fieldType?: string; // 字段类型
    modelKey?: string; // 模型key
    modelLink?: string; // 模型链路
    fieldLink?: string; // 字段链路
    isFieldModel?: boolean; // 是否是关联模型字段
    subModelKey?: string; // 子表模型key
    subFieldKey?: string; // 子表字段key
    createType?: CreateType; // 字段来源
    refModelKey?: string; // 引用的模型key
    codeType: BwipCodeType.Code39 | BwipCodeType.Code128;
    showValue: boolean;
    styles?: {
      justifyContent: string;
    };
  }

  export interface Qrcode extends BasicSchema {
    type: PaperWidgeType.Qrcode;
    valueType: PaperWidgeValueType;
    fieldType?: string; // 字段类型
    modelKey?: string; // 模型key
    modelLink?: string; // 模型链路
    fieldLink?: string; // 字段链路
    isFieldModel?: boolean; // 是否是关联模型字段
    subModelKey?: string; // 子表模型key
    subFieldKey?: string; // 子表字段key
    createType?: CreateType; // 字段来源
    refModelKey?: string; // 引用的模型key
    codeType: BwipCodeType.QRCode | BwipCodeType.GS1DataMatrix;
  }

  export interface Pagination extends BasicSchema {
    type: PaperWidgeType.Pagination;
    format: string;
    customFormat: string;
    styles: {
      fontFamily: string;
      fontSize: number;
      color: string;
      fontWeight?: string;
      fontStyle?: string;
      textDecoration?: string;
      alignItems: string;
      justifyContent: string;
    };
  }

  export interface Watermark extends BasicSchema {
    type: PaperWidgeType.Watermark;
    styles: CSSProperties;
  }

  export interface DiagonalName {
    /** 是否启用绑定字段 */
    enableBindField: boolean;
    /** 绑定的字段 */
    bindField?: IBindField;
    /** 直接名称 */
    rawName?: string;
  }
  /**
   * 表头分栏
   */
  export interface Diagonal extends BasicSchema {
    type: PaperWidgeType.Diagonal;
    size: 2 | 3;
    names: [string, string, string];
    /** 是否启用绑定字段 */
    enableFields?: [boolean, boolean, boolean];
    /** 绑定的字段 */
    bindFields?: [IBindField | undefined, IBindField | undefined, IBindField | undefined];
    /** 分栏方向 */
    direction: DiagonalDirection;
  }

  /**
   * 上下限
   */
  export interface RangeLimit extends BasicSchema {
    type: PaperWidgeType.RangeLimit;
    /**
     * 自定义的上限值名称
     */
    upperLimitLabel?: string;
    /**
     * 自定义的下限值名称
     */
    lowerLimitLabel?: string;
    /**
     * 自定义的标准值名称
     */
    standardValueLabel?: string;
    /**
     * 自定义的上公差名称
     */
    upperToleranceLabel?: string;
    /**
     * 自定义的下公差名称
     */
    lowerToleranceLabel?: string;
    /**
     * 绑定的显示类型字段
     */
    showTypeField: IBindField;
    /**
     * 绑定的上限值字段
     */
    upperLimitField: IBindField;
    /**
     * 绑定的下限值字段
     */
    lowerLimitField: IBindField;
    /**
     * 绑定的标准值字段
     */
    standardValueField: IBindField;
  }

  /**
   * 线条
   */
  export interface Line extends BasicSchema {
    type: PaperWidgeType.Line;
    /** 线条外观 */
    lineStyle: {
      /** 线条宽度 */
      borderWidth: number;
      /** 线条颜色 */
      borderColor: string;
      /** 线条样式 */
      borderStyle: LineType;
    };
    /** 组件宽度 */
    lineWidth: number;
    styles: {
      alignItems: string;
      justifyContent: string;
    };
    rotate?: number;
    direction?: LineDirection;
  }

  /**
   * 序号
   */
  export interface Serialnumber extends BasicSchema {
    type: PaperWidgeType.Serialnumber;
    /** 初始数值 */
    initialValue: number;
    /** 自增跨度 */
    autoAddValue: number;
  }

  /**
   * 上下限
   */
  export interface Power extends BasicSchema {
    type: PaperWidgeType.Power;
    /**
     * 绑定的最终值数值字段
     */
    valueField: IBindField;
    /**
     * 绑定的基础数值字段
     */
    baseValueField: IBindField;
    /**
     * 绑定的指数值字段
     */
    exponentValueField: IBindField;
  }

  export interface TimeDiff extends BasicSchema {
    type: PaperWidgeType.TimeDiff;
    /**
     * 格式
     */
    format: TimeDiffFormat;
    /**
     * 绑定的开始时间字段
     */
    startDefault: boolean;
    startField: IBindField;
    /**
     * 绑定的结束时间字段
     */
    endDefault: boolean;
    endField: IBindField;
  }
}
