import * as Methods from '/@/utils/regularExpression/methods';
import * as esprima from 'esprima-next';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import { functionMap } from '../constant/function';
import { innerVarIds, SYSTEM_VAR_PREFIX } from '../constant/variable';
import { getSystemVarGetVarByKeys } from '/@/apis/gct-apaas/SystemVarController';
import { UseMemoizeReturn, useMemoize } from '@vueuse/core';
import * as ESTree from 'estree';
import { operator2FuncMap } from '../constant';

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

interface KeyValue {
  key: string;
  value: string;
}

// @ts-ignore
window._METHOD_DEBUG_ = Methods;

/**
 * 获取系统变量值
 * @param ids 系统变量标识
 * @returns
 */
async function _getSystemVarValue(ids: string[]): Promise<KeyValue[]> {
  let res: KeyValue[] = [];
  if (ids.length > 0) {
    res = (await getSystemVarGetVarByKeys({
      keys: ids.join(','),
    })) as KeyValue[];
  }
  return res;
}
const getSystemVarValue: UseMemoizeReturn<Promise<KeyValue[]>, [ids: string[]]> = useMemoize(
  _getSystemVarValue,
);

/**
 * 表达式计算
 * @param expr
 * @param values
 * @returns
 */
async function _calc(expr: string, values: Record<string, any>) {
  const ids = identify(expr, true);

  const innerIds = ids.filter((id) => innerVarIds.includes(id)).sort();
  const systemIds = ids.filter((id) => id.startsWith(SYSTEM_VAR_PREFIX)).sort();

  const systemValues = await getSystemVarValue([...innerIds, ...systemIds]);

  const ast = esprima.parse(expr);
  // 运算符改用 func，避免 js 执行丢精度问题
  estraverse.replace(ast as any, {
    enter(node: ESTree.Node) {
      if (node.type === esprima.Syntax.BinaryExpression) {
        const { operator } = node;
        const fnName = operator2FuncMap[operator];
        if (!fnName) {
          return node;
        }
        return {
          type: esprima.Syntax.CallExpression,
          arguments: [node.left as ESTree.Expression, node.right],
          callee: {
            type: esprima.Syntax.Identifier,
            name: fnName,
          },
          optional: false,
        } satisfies ESTree.CallExpression;
      }
      return node;
    },
  });
  estraverse.traverse(ast as any, {
    enter: function (node: any) {
      if (
        node.type === esprima.Syntax.CallExpression &&
        node.callee.type === esprima.Syntax.Identifier
      ) {
        node.callee.name = `await Methods.${node.callee.name}`;
      }
    },
  });

  const runjs = escodegen.generate(ast, {
    format: {
      semicolons: false,
    },
  });
  const objNames = {};
  const defs: string[] = [];
  // 系统变量
  systemValues.forEach((item) => {
    defs.push(`const ${item.key} = ${JSON.stringify(item.value)};`);
  });
  // 其他
  Object.keys(values).map((key) => {
    if (key.includes('.')) {
      const [obj, property] = key.split('.');
      if (!objNames[obj]) {
        defs.push(`const ${obj} = {};`);
        objNames[obj] = true;
      }
      defs.push(`${obj}.${property} = ${JSON.stringify(values[key])};`);
    } else {
      defs.push(`const ${key} = ${JSON.stringify(values[key])};`);
    }
  });

  const calcFunc = new AsyncFunction(
    'Methods',
    [
      ...defs,
      `return new Promise(async(resolve)=>{`,
      `const res = ${runjs};`,
      'resolve(res);',
      '})',
    ].join('\n'),
  );
  const result = await calcFunc(Methods);
  console.log('【表达式】', expr);
  console.log('【参数】', values);
  console.log('【执行语句】', calcFunc.toString());
  console.log('【执行结果】', result);
  return result;
}

export const calc: UseMemoizeReturn<
  Promise<any>,
  [expr: string, values: Record<string, any>]
> = useMemoize(_calc);

function _deepCalcName(node: any) {
  if (node.type === esprima.Syntax.MemberExpression) {
    return `${node.object.type === esprima.Syntax.MemberExpression
      ? _deepCalcName(node.object)
      : node.object.name
      }.${node.property.name}`;
  } else if (node.type === esprima.Syntax.Identifier) {
    return node.name;
  }
}

export const deepCalcName: UseMemoizeReturn<string, any> = useMemoize(_deepCalcName);

export const checkExpr = async (expr: string): Promise<{ ok: boolean; result: any }> => {
  return new Promise((resolve) => {
    try {
      const ast = esprima.parse(expr);
      resolve({
        ok: true,
        result: ast,
      });
    } catch (err) {
      resolve({
        ok: false,
        result: err,
      });
    }
  });
};

/**
 * 变量识别
 * @param expr
 * @returns
 */
export function _identify(expr: string, isAll = false): string[] {
  const ast = esprima.parse(expr);

  let identifiers: string[] = [];
  estraverse.traverse(ast, {
    enter: function (node) {
      if (node.type === esprima.Syntax.MemberExpression) {
        const name = _deepCalcName(node);
        identifiers.push(name);
        // 以下操作是为了跳过子节点的遍历，不需要 ast 遍历器去遍历子
        Object.assign(node, {
          name,
          type: esprima.Syntax.Identifier,
        });
      } else if (node.type === esprima.Syntax.Identifier) {
        identifiers.push(node.name);
      }
      if (isAll) {
        identifiers = identifiers.filter((item) => !functionMap[item] && item !== 'undefined');
      } else {
        identifiers = identifiers.filter(
          (item) =>
            !functionMap[item] &&
            item !== 'undefined' &&
            !innerVarIds.includes(item) &&
            !item.startsWith(SYSTEM_VAR_PREFIX) &&
            !item.startsWith('undefined.'),
        );
      }
    },
  });
  return [...new Set(identifiers)];
}

export const identify = useMemoize(_identify);

window.gct_expression = {
  execute: calc,
  identify: identify,
}
