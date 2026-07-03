import { calc, identify as exprIdentify } from '../utils/expression';

export function useExpression() {
  /**
   * 计算
   * @param {string} expr 表达式
   * @param {object} values 参数
   * @returns
   */
  async function calculate(expr: string, values: Record<string, any>) {
    return await calc(expr, values);
  }

  /**
   * 变量识别
   * @param expr
   * @returns {Array}
   */
  function identify(expr: string) {
    return exprIdentify(expr);
  }

  return {
    calculate,
    identify,
  };
}
