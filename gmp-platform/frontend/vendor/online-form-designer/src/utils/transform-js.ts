import * as esprima from 'esprima-next';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import * as ts from 'typescript';

export function transformAst(code: string) {
  // return esprima.parse(code, { sourceType: 'module' });
  return esprima.parse(code, { sourceType: 'module' });
}

/**
 * get all methods from code-editor-toolkit
 */
export const getMethods = (ast) => {
  const methods = {};
  estraverse.traverse(ast, {
    enter: function (node) {
      if (!(node.type === 'ExportNamedDeclaration')) {
        return;
      }
      const { name } = node.declaration.id;
      const { params } = node.declaration;
      const codeStr = escodegen.generate(node);
      methods[name] = {
        type: 'EXPORT_Function',
        source: codeStr,
        params: params && params.map((d) => d.name).join(','),
      };
    },
  });
  return methods;
};

/**初始化可以执行的JS */
export const buildRunJs = (code, needExport = true) => {
  // 尝试解码，如果包含未编码的 % 号会抛异常，此时直接使用原字符串
  try {
    code = decodeURIComponent(code);
  } catch (error) {
    // 当 decodeURIComponent 因格式错误（如包含 %）而失败时，使用原字符串
    console.warn('decodeURIComponent failed, using original code:', error);
  }
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
    },
  });
  //在index.html中引入静态资源 直接用Babel
  const jsModule =
    Babel.transform(result.outputText, { presets: ['env'] }).code +
    (needExport ? '\n return exports' : '');
  // console.log('jsFn', fun(runJs.value));
  // return new Function('exports', jsModule);
  return jsModule;
};
/**初始化事件框中的EventMethod */
export function initMethodMap(code) {
  try {
    const ast = transformAst(code);
    const methods = getMethods(ast);
    console.log('methods已被解析!', methods);
    return methods;
  } catch (error) {
    console.error(error);
    return {};
  }
}
