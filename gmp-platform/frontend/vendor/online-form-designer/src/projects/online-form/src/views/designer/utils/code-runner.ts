import * as esprima from 'esprima-next';
import estraverse from 'estraverse';

export class CodeRunner {
  /**
   * 导出方法
   */
  exports: any;

  /**
   * constructor
   * @param runtimeJs 运行时 js
   * @param globalData 全局数据
   */
  constructor(runtimeJs: string, globalData: any, ctx: any) {
    this.exports = new Function('exports', 'GlobalData', 'CTX', runtimeJs)({}, globalData, ctx);
  }

  /**
   * 实例方法调用
   * @param method 方法
   * @param args 参数列表
   * @returns
   */
  invoke(method: string, ...args: any[]) {
    if (!method) {
      console.warn('【运行时】方法未指定');
      return;
    }
    if (!this.exports[method]) {
      console.warn(`【运行时】${method}方法不存在`);
      return;
    }
    return this.exports[method](...args);
  }

  /**
   * 解析可用函数
   * @param code
   * @returns
   */
  static identifyFns(code: string) {
    const ast = esprima.parse(code, { sourceType: 'module' });
    const fns: Array<{
      local: string;
      exported: string;
    }> = [];

    estraverse.traverse(ast, {
      enter: function (node: any) {
        if (node.type === esprima.Syntax.ExportNamedDeclaration) {
          // 函数声明
          if (node.declaration?.type === esprima.Syntax.FunctionDeclaration) {
            fns.push({
              local: node.declaration.id.name,
              exported: node.declaration.id.name,
            });
          }

          // 表达式
          // 箭头函数
          (node.declaration?.declarations ?? []).forEach((item) => {
            if (
              [esprima.Syntax.ArrowFunctionExpression, esprima.Syntax.FunctionExpression].includes(
                item.init.type,
              )
            ) {
              fns.push({
                local: item.id.name,
                exported: item.id.name,
              });
            }
          });

          // 导出重命名
          (node.specifiers ?? []).forEach((item) => {
            if (item.type === esprima.Syntax.ExportSpecifier) {
              fns.push({
                local: item.local.name,
                exported: item.exported.name,
              });
            }
          });
        }
      },
    });
    return fns;
  }

  /**
   * 构造运行时
   * @param code
   */
  static buildRuntimeJs(code: string) {
    const js =
      Babel.transform(code, { presets: ['env'], comments: false }).code + '\n;\nreturn exports;';
    return js;
  }
}
