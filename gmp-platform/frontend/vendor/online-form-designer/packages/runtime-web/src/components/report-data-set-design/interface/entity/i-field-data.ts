/**
 * 字段属性配置
 *
 * @export
 * @interface IFieldData
 */
export interface IFieldData {
  /**
   * 字段唯一标识，使用模型 ID + 字段 ID 组合
   *
   * @type {string}
   */
  id: string;
  /**
   * 字段显示名称（默认显示字段名称）
   *
   * @type {string}
   */
  label: string;
  /**
   * 字段标识，需要唯一，冲突时需要人为修改
   *
   * @type {string}
   */
  key: string;
  /**
   * 模型标识
   *
   * @type {string}
   */
  modelKey: string;
  /**
   * 模型大类
   *
   * @type {string}
   */
  modelCategory: string;
  /**
   * 字段标识
   *
   * @type {string}
   */
  fieldKey: string;
  /**
   * 字段类型
   *
   * @type {string}
   */
  fieldType: string;
  /**
   * 字段名称（公式显示字段用）
   *
   * @author chitanda
   * @date 2025-11-06 16:11:52
   * @type {string}
   */
  fieldName?: string;
  /**
   * 字段名称多语言（公式显示字段用）
   *
   * @author chitanda
   * @date 2025-11-06 16:11:17
   * @type {string}
   */
  fieldNameI18n?: string;
  /**
   * 配置的公式表达式（只公式显示字段可用）
   *
   * @author chitanda
   * @date 2025-11-06 16:11:15
   * @type {string}
   */
  expression?: string;
  /**
   * 配饰的公式表达式回显（纯展示，不可用）（只公式显示字段可用）
   *
   * @type {string}
   */
  expressionEcho?: string;
  /**
   * 编译后的公式表达式（只公式显示字段可用）
   *
   * @author chitanda
   * @date 2025-11-06 16:11:21
   * @type {string}
   */
  compileExpr?: string;
  /**
   * 根公式函数名称（只公式显示字段可用）
   *
   * @type {string}
   */
  functionName?: string;
  /**
   * 字段描述（目前公式显示字段使用）
   *
   * @author chitanda
   * @date 2025-11-06 16:11:24
   * @type {string}
   */
  description?: string;
  /**
   * 公式字段显示类型
   *
   * @author chitanda
   * @date 2026-01-09 16:11:24
   * @type {string}
   */
  mappingType?: string;
}
