import BigNumber from 'bignumber.js';

/**
 * 加法（不丢精度）
 * @author lingxiaoming
 * @date 2024-06-27 05:31:43
 * @export
 * @param {BigNumber.Value} a
 * @param {BigNumber.Value} b
 * @return {*}  {number}
 */
export function plus(a: BigNumber.Value, b: BigNumber.Value): number {
  const _a = new BigNumber(a);
  const _b = new BigNumber(b);
  return _a.plus(_b).toNumber();
}

/**
 * 减法（不丢精度）
 * @author lingxiaoming
 * @date 2024-06-27 05:31:55
 * @export
 * @param {BigNumber.Value} a
 * @param {BigNumber.Value} b
 * @return {*}  {number}
 */
export function minus(a: BigNumber.Value, b: BigNumber.Value): number {
  const _a = new BigNumber(a);
  const _b = new BigNumber(b);
  return _a.minus(_b).toNumber();
}
