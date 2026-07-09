import type { WorkbenchComponentRelationResponse } from '/@/apis/gct-platform/model';

export interface IGridLayoutCompItem
  extends Pick<WorkbenchComponentRelationResponse, 'userId' | 'workbenchComponentName' | 'id'> {
  name: string;
  /** 栅格中元素的id */
  i: string;
  /** 标识栅格元素位于第几列 */
  x: number;
  /** 标识栅格元素位于第几行 */
  y: number;
  /** 标识栅格元素的初始宽度 */
  w: number;
  /** 标识栅格元素的初始高度 */
  h: number;
  /** 栅格元素的最小高度 */
  minH: number;
  /** 栅格元素的最小宽度 */
  minW: number;
}
