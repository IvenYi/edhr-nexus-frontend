import { IVTableColumn } from '../../i-v-table-column/i-v-table-column';

/**
 * 展示图片清单
 *
 * @export
 * @interface GctVTableSignatureListProps
 */
export interface GctVTableSignatureListProps {
  /**
   * 列配置
   *
   * @type {IVTableColumn}
   */
  column: IVTableColumn;
  /**
   * 签名数据列表
   *
   * @type {IObject[]}
   */
  items: IObject[];
}
