import { UniqueConstraintType, FIELD_TYPE } from '@/enums/appEnum';
import {
  FieldDefaultValueTypeEnum,
  FieldSysVarDefaultValueEnum,
} from '@/projects/app-designer/src/enum';

export interface FieldFormState {
  id?: string;
  modelKey: stirng;
  name: string;
  key: string;
  type: FIELD_TYPE;
  required: number;
  parentField: number;
  uniqueConstraint: {
    type: UniqueConstraintType;
    fieldKeys?: string[];
  };
  /** 默认值 */
  defaultValue: {
    type: FieldDefaultValueTypeEnum;
    value?: string | number | boolean | FieldSysVarDefaultValueEnum;
    name?: string;
  };
  description: string;
  /** 字段特性配置 */
  specificConfig: {
    /**数值/长度限制 */
    minValue?: number;
    /**数值/长度限制 */
    maxValue?: number;
    /**数值精度 */
    digits?: number;
    /** 修约规则 */
    rulesForRounding?: number;

    /** 布尔 true 文案 */
    true?: string;
    /** 布尔 false 文案 */
    false?: string;

    /** 上传数量 */
    maxNumber?: number;
    /** 文件大小 */
    fileSize?: number;
    /** 文件类型 */
    fileTypes?: Array<string>;

    // 流水号规则新增参数(2024年6月12日17:10:12)
    ruleType?: string;

    /** 显示规则 人员、模型应用 */
    displayRule?: {
      exp: string;
      exprInEditor: string;
      relationColumns: string[];
    };

    /**
     * 公式新增参数
     * 2024年11月21日
     */
    expType?: string;
    /**实时计算 */
    expRealCompute?: boolean;
    /** 公式配置 */
    expConfig?: any | { exp: string; expression: string; relationColumns: string[] };

    /** 汇总配置 */
    aggConfig?: {
      /** 汇总类型 */
      aggFunc: string;
      /** 汇总字段名 */
      relationColumns: string[];
    };

    ruleConfig?: any | { nodes: any[]; designJson: any; fieldKey };
    [k: string]: any;
    /**枚举 */
    customEnumConfig?: {
      enabled: number;
      values: string[];
    };
    /**前端公式 */
    formulaConfig?: {
      exp: string;
      expression: string;
      showQrCode?: boolean;
      digits?: number;
      truelabel?: string;
      falselabel?: string;
    };
  };

  /**关联信息KEY 如:枚举/主子/关联 */
  bindInfo?: string;
  /** 主子/引用关联模型类型 */
  refModelType?: string;
  i18nConfig?: string;
  /**
   * 普通数据类型 值为fieldType
   * 映射类型(公式、函数等实际映射的类型)
   */
  mappingType?: string;
  /** 主子关联  绑定子模型字段 */
  bindFieldKey?: string;

  /** 在线表单新建字段中的子模型key */
  subModelKey?: string;
}

export interface SpecificConfig {
  exp?: string; // 公式的表达式（key）
  expression?: string;
  relationColumns?: Array<any>; // 公式/汇总 关联的字段集合
  aggFunc?: string; // 汇总字段的枚举
  bindField?: string;
  refModelType?: string;
  digits?: number;
}
