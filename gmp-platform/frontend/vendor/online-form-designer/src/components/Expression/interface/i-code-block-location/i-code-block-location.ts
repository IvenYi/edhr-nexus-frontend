/**
 * 代码块位置标记
 *
 * @export
 * @interface ICodeBlockLocation
 */
export interface ICodeBlockLocation {
  /**
   * 起始行
   *
   * @type {number}
   */
  startLine: number;
  /**
   * 结束行
   *
   * @type {number}
   */
  endLine: number;
  /**
   * 起始列
   *
   * @type {number}
   */
  startColumn: number;
  /**
   * 结束列
   *
   * @type {number}
   */
  endColumn: number;
}
