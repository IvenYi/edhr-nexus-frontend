export interface IEditableTab {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  name: string;
  /** 图标字符串 */
  icon?: string;
  /** 图标颜色 */
  color?: string;
  /** 标签右侧计数的数字 */
  count?: number;
  /** i18n */
  i18n?: string;
}
