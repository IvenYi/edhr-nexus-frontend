import { ICodeBlockLocation } from '../i-code-block-location/i-code-block-location';

/**
 * 操作符位置
 *
 * @export
 * @interface IOperatorItem
 */
export interface IOperatorItem {
  /**
   * 需要标记的范围位置，因为平台特殊变量规则，源码中又是可以修改的，可能 ast 出来的变量和平台定义的不一致
   *
   * @type {ICodeBlockLocation}
   */
  pos: ICodeBlockLocation;
  /**
   * 具体操作符
   *
   * @type {string}
   */
  operator: string;
}
