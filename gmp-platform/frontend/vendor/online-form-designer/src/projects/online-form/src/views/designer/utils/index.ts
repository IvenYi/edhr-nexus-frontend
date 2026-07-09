import type { IRange } from '../types';

/**
 *
 * @param col
 * @returns
 */
export function col2Num(col: string): number {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + col.charCodeAt(i) - 64;
  }
  return num;
}

/**
 *
 * @param num
 * @returns
 */
export function num2Col(num: number): string {
  let result = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

/**
 *
 * @param data
 * @returns
 */
export function getBorder(data): string {
  const { style, color } = data;
  let border = '1px solid black';
  if (style === 'double') {
    border = `4px double ${color?.argb?.substring(2).padStart(7, '#') ?? 'black'}`;
  } else {
    border = `1px solid ${color?.argb?.substring(2).padStart(7, '#') ?? 'black'}`;
  }
  // console.log('border', border, data)
  return border;
}

// console.log(colToNum('A11'))

/**
 * 判断两个区域是否有重叠
 * @param range1
 * @param range2
 * @returns
 */
export function isOverlap(range1: IRange, range2: IRange): boolean {
  if (range1.r < range2.l || range2.r < range1.l || range1.b < range2.t || range2.b < range1.t) {
    return false;
  }
  return true;
}

/**
 * 判断两个区域是否包含关系
 * range1是否在range2里面
 * @param range1
 * @param range2
 * @returns
 */
export function isIn(range1: IRange, range2: IRange): boolean {
  return (
    range1.r <= range2.r && range1.l >= range2.l && range1.t >= range2.t && range1.b <= range2.b
  );
}
