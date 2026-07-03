import { intersection } from 'lodash-es';
import { notSingleArr } from '../../enums';

/**
 * 是否完全为多选算子
 *
 * @description 只有全部是多选算子时，下拉才可以算是多选
 * @author zhanghanrui
 * @date 2024-09-20 11:09:47
 * @export
 * @param {string[]} arr
 * @return {*}  {boolean}
 */
export function isMultipleOperator(arr: string[]): boolean {
  // 计算多选算子交集
  const items = intersection(arr, notSingleArr) as string[];
  // 给入算子全是多选算子，返回 true
  if (items.length > 0 && items.length === arr.length) {
    return true;
  }
  return false;
}
