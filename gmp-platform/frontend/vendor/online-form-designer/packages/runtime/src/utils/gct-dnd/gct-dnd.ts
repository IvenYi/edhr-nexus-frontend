import { XYCoord } from "vue3-dnd";

/**
 * 计算拖拽插入位置
 *
 * @export
 * @param {DOMRect} rect
 * @param {XYCoord} offset
 * @param {number} [dropOffset=0]
 * @param {('vertical' | 'horizontal')} [direction='horizontal']
 * @returns {*}  {(0 | 1 | -1)}
 */
export function calcDndInsertPos(rect: DOMRect, offset: XYCoord, dropOffset: number = 0, direction: 'vertical' | 'horizontal' = 'horizontal'): 0 | 1 | -1 {
  // 放置线计算偏移量
  let difference: number = 0;
  if (direction === 'vertical') {
    const { top, height } = rect;
    const { y } = offset;
    const half = height / 2;
    difference = y - top - half;
    // 小于偏移量，则不处理
    if (Math.abs(difference) < dropOffset) {
      return -1;
    }
    if (difference < 0) {
      return 1;
    }
  } else {
    const { left, width } = rect;
    const { x } = offset;
    const half = width / 2;
    difference = x - left - half;
    // 小于偏移量，则不处理
    if (Math.abs(difference) < dropOffset) {
      return -1;
    }
    if (difference < 0) {
      return 1;
    }
  }
  return 0;
}
