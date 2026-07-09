import { CellWidgetRenderComp, CellWidgetCategory } from '../enums';
import {
  CellWidgetViewState,
  LabelPosition,
  Orientation,
  RangeValidateMode,
  RangeValidateMode,
  DecimalDisplayMode,
  SignatureTypeEnum,
  BooleanShowMode,
  SignShowTypeEnum,
  SignatureTimeTypeEnum,
  ImageDisplayModeEnum,
  SignatureNumberTypeEnum,
} from '@gct/nocode-base';
import { Dependency_ENUM, ASSIGNMENTSTRATEGY_ENUM } from '@gct/runtime';
import type { IBindField } from '@gct/nocode-base';

export namespace CellWidget {
  export interface BasicSchema {
    category: CellWidgetCategory;
    required?: boolean;
    disabled?: boolean;
    renderComp: CellWidgetRenderComp;
    viewState?: CellWidgetViewState; // 查看设计-显示状态 只读/禁用/跟随设计
    // 通用样式配置
    fontSize?: number;
    letterSpace?: number;
    /**
     * 前缀
     */
    prefix?: string;
    /**
     * 后缀
     */
    suffix?: string;
    /**
     * 空值符
     */
    emptySymbol?: string;
    /**
     * 组件高度
     */
    compHeight: number;
    /**
     * 组件宽度
     */
    compWidth: number;
    /** 事件类型 */
    eventType?: string;
    /** 事件方法名 */
    eventMethod?: string;
    /**
     * 组件依赖
     */
    componentDependency?: DisplayProps;
  }

  export interface Text extends BasicSchema {
    category: CellWidgetCategory.Text;
    renderComp: CellWidgetRenderComp.Input;
    placeholder?: string;
    defaultValue?: string;
    maxlength?: number;
    minlength?: number;
    regex?: string;
    regexHint?: string;
  }

  export interface Trace extends Text {
    category: CellWidgetCategory.Trace;
    renderComp: CellWidgetRenderComp.Input;
    /** 条码解析规则配置 */
    parseRuleProps?: ParseRuleProps;
  }

  export interface DateTime extends BasicSchema {
    category: CellWidgetCategory.DateTime;
    renderComp: CellWidgetRenderComp.DateTime;
    placeholder?: string;
    /**
     * 默认系统日期
     */
    defaultSystemDate?: boolean;
    /**
     * 格式化字符串
     */
    format?: string;
    /**
     * 自定义格式化字符串
     */
    customFormat?: boolean;
    /**
     * 格式化分隔符
     */
    formatSeparator?: string;
    /**
     * 格式化模版
     */
    formatTemplate?: string;

    /** 启用上下限校验 */
    enableRangeValidate?: boolean;
    /** 上限校验模式 */
    maxValidateMode?: RangeValidateMode;
    /** 下限校验模式 */
    minValidateMode?: RangeValidateMode;
    /**上限日期 */
    max?: string;
    /** 上限公式表达式 */
    maxExpr?: string;
    /** 上限公式表达式显示文本 */
    maxExprEcho?: string;
    /**下限日期 */
    min?: string;
    /** 下限公式表达式 */
    minExpr?: string;
    /** 下限公式表达式显示文本 */
    minExprEcho?: string;
  }

  export interface Integer extends BasicSchema {
    category: CellWidgetCategory.Integer;
    renderComp: CellWidgetRenderComp.Integer;
    placeholder?: string;
    defaultValue?: number;
    /**
     * 角标值
     * @author lingxiaoming
     * @date 2024-06-19 03:20:45
     * @type {string}
     */
    scriptValue?: string;
    /**
     * 是否是上角标，false为下角标
     * @author lingxiaoming
     * @date 2024-06-19 03:20:50
     * @type {boolean}
     */
    isSuperScript?: boolean;
    /** 公式表达式 */
    expr?: string;
    /** 公式表达式显示文本 */
    exprEcho?: string;
    /** 启用上下限校验 */
    enableRangeValidate?: boolean;
    /** 上限校验模式 */
    maxValidateMode?: RangeValidateMode;
    /** 下限校验模式 */
    minValidateMode?: RangeValidateMode;
    /**上限数值 */
    max?: number;
    /** 上限公式表达式 */
    maxExpr?: string;
    /** 上限公式表达式显示文本 */
    maxExprEcho?: string;
    /**下限数值 */
    min?: number;
    /** 下限公式表达式 */
    minExpr?: string;
    /** 下限公式表达式显示文本 */
    minExprEcho?: string;
    /** 启用计数器 */
    enableStepCounter?: boolean;
    /** 自增步数 */
    stepCounter?: number;
  }

  export interface Double extends Integer {
    category: CellWidgetCategory.Double;
    renderComp: CellWidgetRenderComp.Double;
    displayMode?: DecimalDisplayMode;
  }

  export interface Decimal extends Double {
    category: CellWidgetCategory.Decimal;
    renderComp: CellWidgetRenderComp.Decimal;
    precision?: number;
  }

  /**
   * 附加引入的字段信息
   * @author lingxiaoming
   * @date 2024-06-18 04:10:19
   * @export
   * @interface AttachField
   */
  export interface AttachField {
    /**
     * 字段信息
     */
    fieldMeta: IBindField;
    /**
     * 字段渲染组件
     */
    fieldWidget: CellWidget.BasicSchema;
  }

  export interface Boolean extends BasicSchema {
    category: CellWidgetCategory.Boolean;
    renderComp:
      | CellWidgetRenderComp.Radio
      | CellWidgetRenderComp.Checkbox
      | CellWidgetRenderComp.Select
      | CellWidgetRenderComp.Switch;
    defaultValue: boolean | null;
    trueText?: string;
    falseText?: string;
    /**
     * 排列方向
     */
    direction?: Orientation;
    /**
     * label位置
     */
    labelPosition: LabelPosition;
    showMode: BooleanShowMode;
    trueAttachFields: AttachField[] | undefined;
    falseAttachFields: AttachField[] | undefined;
    /**
     * 图标和文本的间距
     */
    iconLabelSpace?: number;
  }

  export interface File extends BasicSchema {
    category: CellWidgetCategory.File | CellWidgetCategory.Image;
    renderComp: CellWidgetRenderComp.Attachment | CellWidgetRenderComp.Image;
    /**
     * 最大上传数量
     */
    maxCount?: number;
    /**
     * 最大单个上传文件大小
     */
    maxSize?: number;
    /**
     * 允许上传的文件类型数组
     */
    acceptTypes?: Array<string>;
    /** 是否显示文件名称 */
    showFileName?: number;
  }

  export interface Image extends File {
    category: CellWidgetCategory.Image;
    renderComp: CellWidgetRenderComp.Image;
    /** 图片显示模式 */
    imageDisplayMode?: ImageDisplayModeEnum;
  }

  export interface Signature extends BasicSchema {
    category: CellWidgetCategory.Signature;
    renderComp: CellWidgetRenderComp.Signature;
    signatureType: SignatureTypeEnum;
    signDisplayStyle: SignShowTypeEnum;
    signTimeType: SignatureTimeTypeEnum;
    populateFields: AttachField[] | undefined;
    signatureNumber: SignatureNumberTypeEnum;
  }

  export interface User extends BasicSchema {
    category: CellWidgetCategory.User;
    renderComp: CellWidgetRenderComp.User;
    placeholder?: string;
    defaultValue?: string;
  }

  export interface Org extends BasicSchema {
    category: CellWidgetCategory.Org;
    renderComp: CellWidgetRenderComp.Org;
    placeholder?: string;
    defaultValue?: string;
  }

  export interface Expression extends BasicSchema {
    category: CellWidgetCategory.Expression;
    renderComp: CellWidgetRenderComp.Expression;
  }

  export interface Agg extends BasicSchema {
    category: CellWidgetCategory.Agg;
    renderComp: CellWidgetRenderComp.Agg;
  }

  export interface Ref extends BasicSchema {
    category: CellWidgetCategory.Ref;
    renderComp: CellWidgetRenderComp.Ref;
    placeholder?: string;
    /** 快速搜索字段 */
    searchField?: string[];
    /** 数据填充 */
    autofillRules?: Array<{ toField: string; fromField: string }>;
    /** 数据筛选 */
    dataFilter: {
      dataRule: string;
      dataRuleConfig: string;
      dataRuleEnabled: boolean;
    };
  }

  export interface EnumOption {
    /**
     * 唯一标识
     */
    id: string;
    text: string;
    value: string;
    /**
     * 是否是默认选中的
     * @author lingxiaoming
     * @date 2024-05-16 02:09:16
     * @type {boolean}
     */
    defaultSelected?: boolean;
    /** 是否显示 */
    display?: boolean;
    /**
     * 引入字段
     * @author lingxiaoming
     * @date 2024-06-18 04:11:50
     * @type {AttachField[]}
     */
    attachFields: AttachField[] | undefined;
  }
  export interface Enum extends BasicSchema {
    category: CellWidgetCategory.Enum;
    placeholder?: string;
    renderComp:
      | CellWidgetRenderComp.Select
      | CellWidgetRenderComp.Radio
      | CellWidgetRenderComp.Checkbox;
    options: EnumOption[];
    /**
     * 排列方向
     */
    direction?: Orientation;
    /**
     * label位置
     */
    labelPosition: LabelPosition;
    /**
     * 图标和文本的间距
     */
    iconLabelSpace?: number;
  }
}

export interface DisplayProps {
  /**组件依赖排序 */
  sortDependency: Dependency_ENUM[];
  /**组件依赖配置 */
  configDependency: Partial<
    Record<
      Dependency_ENUM,
      {
        /**公式信息 */
        expression?: string;
        /**中文翻译 */
        expressionStr?: string;
        strategy?: ASSIGNMENTSTRATEGY_ENUM;
        value?: boolean;
      }
    >
  >;
}

/**
 * 条码解析规则配置参数
 * @export
 * @interface ParseRuleProps
 */
export interface ParseRuleProps {
  /** 条码解析规则id */
  parsingRuleId?: string;
  /** 条码字段到表单字段的映射 */
  fillMapArr?: Array<{
    /** 条码字段 */
    barcodeField?: string;
    /** 表单字段 */
    formFields?: string[];
  }>;
}
