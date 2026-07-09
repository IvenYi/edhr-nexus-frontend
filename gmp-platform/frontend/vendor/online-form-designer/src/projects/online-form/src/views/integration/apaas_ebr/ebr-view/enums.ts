/**
 * 模块枚举
 */
export enum EModuleEnum {
  /** 目录树 */
  CATALOG = 'catalogue',
  /** 生产 */
  PRODUCTION = 'production',
  /** 检验 */
  INSPECTION = 'inspection',
  /** 放行 */
  RELEASE = 'release',
  /** 关联 */
  LINK = 'link',
  /** ESOP面板 */
  ESOP = 'esop',
}

/**
 * 二级分类枚举
 */
export enum ESubCategoryEnum {
  /** 检验表单  */
  INSPECTION_FORM = 'inspection',
  /** 放行表单 */
  RELEASE_FORM = 'release',
  /** 关联表单 */
  LINK_FORM = 'link',
  /** 返工表单 */
  REWORK_FORM = 'rework',
  /** 附录表单 */
  APPENDIX_FORM = 'appendix',
  /** 事务表单 */
  TXN_FORM = 'txn',
}
