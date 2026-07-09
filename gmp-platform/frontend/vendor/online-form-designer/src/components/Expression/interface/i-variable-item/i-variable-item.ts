import { ICodeBlockLocation } from '../i-code-block-location/i-code-block-location';
import { IdentifierItemInterface } from '../../types';

/**
 * 表达式变量项
 *
 * @export
 * @interface IVariableItem
 */
export interface IVariableItem {
  /**
   * 需要标记的范围位置，因为平台特殊变量规则，源码中又是可以修改的，可能 ast 出来的变量和平台定义的不一致
   *
   * @type {ICodeBlockLocation}
   */
  pos: ICodeBlockLocation;
  /**
   * 变量全名
   *
   * @type {string}
   */
  name: string;
  /**
   * 占位名称
   *
   * @type {string}
   */
  placeholderName: string;
  /**
   * 对应模型字段信息
   *
   * @type {IdentifierItemInterface}
   */
  data: IdentifierItemInterface;
}
