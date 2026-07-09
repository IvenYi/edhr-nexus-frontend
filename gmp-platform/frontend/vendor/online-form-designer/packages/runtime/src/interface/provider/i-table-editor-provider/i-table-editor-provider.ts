import { IProviderBasic } from '../i-provider-basic/i-provider-basic';
import { ITableItem } from '../../table';

/**
 * 编辑器提供者
 *
 * @author zhanghanrui
 * @date 2024-03-27 10:03:54
 * @export
 * @interface ITableEditorProvider
 * @extends {IProviderBasic}
 */
export interface ITableEditorProvider extends IProviderBasic {
  /**
   * 直接特殊绘制
   *
   * @author zhanghanrui
   * @date 2024-03-27 09:03:08
   * @param {*} value 当前项的值
   * @param {IData} data 当前表格行数据
   * @param {ITableItem} item 当前表格项模型
   * @return {*}  {*}
   */
  render?(value: any, data: IData, item: ITableItem): any;
}
