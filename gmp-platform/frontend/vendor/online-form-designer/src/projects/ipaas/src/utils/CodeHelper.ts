import * as esprima from 'esprima-next';
import estraverse from 'estraverse';

export default class CodeHelper {
  /**
   * 编辑器代码默认值
   */
  static DefaultContent: string =
    '/**\n' +
    ' * @param {IScriptArgs} args - 参数\n' +
    ' */\n' +
    'function main(args: IScriptArgs) {\n' +
    '  \n' +
    '  return {\n' +
    '    \n' +
    '  }\n' +
    '}';

  /**
   * 根据生成类型定义
   * @param args
   */
  static createTypeDef(args: Array<{ key: string }> = []): string {
    const commentLines: string[] = [];
    commentLines.push('interface IScriptArgs {');
    args.forEach((arg) => {
      if (!arg.key) return;
      commentLines.push(`${arg.key}: any;`);
    });
    commentLines.push('}');
    return commentLines.join('\n');
  }

  /**
   * ts编译
   * @param ts
   * @returns
   */
  static ts2js(ts: string): string {
    return Babel.transform(ts, {
      presets: [
        'typescript',
        [
          'env',
          {
            modules: false,
          },
        ],
      ],
      filename: '_script_.ts',
      comments: false,
    }).code;
  }

  /**
   * 解析函数的返回值
   * @param code
   * @returns
   */
  static getReturnKeys(code: string): Array<{ key: string }> {
    const result: Array<{
      key: string;
      id: string;
    }> = [];
    const ast = esprima.parse(code, { sourceType: 'module' });
    estraverse.traverse(ast, {
      enter: function (node: any) {
        console.log(node);
        if (node.type === esprima.Syntax.FunctionDeclaration && node.id.name === 'main') {
          node.body.body.forEach((item: any) => {
            if (item.type === esprima.Syntax.ReturnStatement) {
              if (item.argument.type === esprima.Syntax.ObjectExpression) {
                item.argument.properties.forEach((property: any) => {
                  result.push({
                    key: property.key.name,
                    id: property.key.name,
                  });
                });
              }
            }
          });
        }
        // if (node.type === esprima.Syntax.ExportNamedDeclaration) {
        //   // 函数声明
        //   if (node.declaration?.type === esprima.Syntax.FunctionDeclaration) {
        //     fns.push({
        //       local: node.declaration.id.name,
        //       exported: node.declaration.id.name,
        //     });
        //   }

        //   // 表达式
        //   // 箭头函数
        //   (node.declaration?.declarations ?? []).forEach((item) => {
        //     if (
        //       [esprima.Syntax.ArrowFunctionExpression, esprima.Syntax.FunctionExpression].includes(
        //         item.init.type,
        //       )
        //     ) {
        //       fns.push({
        //         local: item.id.name,
        //         exported: item.id.name,
        //       });
        //     }
        //   });

        //   // 导出重命名
        //   (node.specifiers ?? []).forEach((item) => {
        //     if (item.type === esprima.Syntax.ExportSpecifier) {
        //       fns.push({
        //         local: item.local.name,
        //         exported: item.exported.name,
        //       });
        //     }
        //   });
        // }
      },
    });

    return result;
  }
}
