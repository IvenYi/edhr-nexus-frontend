import type { Monaco } from '@gct/runtime-web';

/**
 * 自定义异常标记
 *
 * @export
 * @interface ICustomMarkerData
 * @extends {Monaco.editor.IMarkerData}
 */
export interface ICustomMarkerData extends Monaco.editor.IMarkerData {
  /**
   * 标记所属者
   *
   * @type {string}
   */
  owner?: string;

  /**
   * 异常提示行
   *
   * @type {number}
   */
  tipLine?: number;

  /**
   * 异常提示列
   *
   * @type {number}
   */
  tipColumn?: number;
}
