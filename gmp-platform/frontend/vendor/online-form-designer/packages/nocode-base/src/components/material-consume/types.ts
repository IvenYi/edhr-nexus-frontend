/**
 * 类型
 * @export
 * @enum {number}
 */
export enum MaterialConsumeActionType {
  /** 确认 */
  CONFIRM = 'CONFIRM',
  /** 条码扫描 */
  SCAN = 'SCAN',
  /** 查看BOM信息 */
  VIEW_BOM = 'VIEW_BOM',
  /** 变更解析规则 */
  CHANGE_PARSE_RULE = 'CHANGE_PARSE_RULE',
}
