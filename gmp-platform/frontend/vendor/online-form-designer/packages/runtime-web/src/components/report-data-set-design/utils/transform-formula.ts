import * as esprima from 'esprima-next';

export interface FormulaJsonItem {
  type: 'FUNC' | 'COLUMN' | 'CONST';
  name?: string;
  alias?: string;
  value?: string | number | boolean;
  args?: FormulaJsonItem[];
}

const OperatorFuncMap = {
  '+': 'ADD',
  '-': 'SUB',
  '*': 'MUL',
  '/': 'DIV',
  '%': 'MOD',
};

function transformAST(node): FormulaJsonItem {
  if (node.type === 'CallExpression') {
    return {
      type: 'FUNC',
      name: node.callee.name,
      alias: null,
      args: node.arguments.map((arg) => transformAST(arg)),
    };
  } else if (node.type === 'Identifier') {
    return {
      type: 'COLUMN',
      value: node.name,
    };
  } else if (node.type === 'Literal') {
    return {
      type: 'CONST',
      value: node.value,
    };
  } else if (node.type === 'BinaryExpression') {
    const name = OperatorFuncMap[node.operator];
    if (!name) {
      throw new Error('Unsupported AST node operator: ' + node.operator);
    }
    return {
      type: 'FUNC',
      name,
      args: [transformAST(node.left), transformAST(node.right)],
    };
  } else if (node.type === 'MemberExpression') {
    return {
      type: 'COLUMN',
      value: `${transformAST(node.object).value}.${transformAST(node.property).value}`,
    };
  } else {
    throw new Error('Unsupported AST node type: ' + node.type);
  }
}

function transformJSON(node: FormulaJsonItem) {
  if (node.type === 'FUNC') {
    const argsExpr = node.args!.map(transformJSON).join(',');
    return `${node.name}(${argsExpr})`;
  } else if (node.type === 'COLUMN') {
    return node.value;
  } else if (node.type === 'CONST') {
    return typeof node.value === 'string' ? `"${node.value}"` : String(node.value);
  } else {
    throw new Error('Unknown node type: ' + node.type);
  }
}
export const formulaToJson = (formula: string): FormulaJsonItem => {
  const ast = esprima.parse(formula);
  return transformAST(ast.body[0].expression);
};

export const jsonToFormula = (json: FormulaJsonItem): string => {
  return transformJSON(json);
};

export const getFieldString = (value: string): string => {
  const match = value.match(/^(['"`])(.*?)\1$/);
  if (match) {
    return match[2];
  }
  return value;
};
