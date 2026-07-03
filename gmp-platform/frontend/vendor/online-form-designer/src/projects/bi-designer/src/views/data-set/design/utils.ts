import * as esprima from 'esprima-next';
import { Parser } from 'node-sql-parser';

const parser = new Parser();
export interface FormulaJsonItem {
  type: 'FUNC' | 'COLUMN' | 'CONST';
  name?: string;
  alias?: string | null;
  value?: string | number | boolean;
  args?: FormulaJsonItem[];
}

const OperatorFuncMap = {
  '+': 'ADD',
  '-': 'SUB',
  '*': 'MUL',
  '/': 'DIV',
};

function transformAST(node, funcName): FormulaJsonItem {
  console.log('node', node);
  //判断todate函数,并识别第二个参数传入
  const regex = /TODATE\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(funcName)) !== null) {
    matches.push({
      full: match[0],
      firstParam: match[1].replace(/\s+/g, ''),
      secondParam: match[2].replace(/\s+/g, ''),
    });
  }

  if (node.type === 'CallExpression') {
    return {
      type: 'FUNC',
      name: node.callee.name,
      alias: null,
      args: node.arguments.map((arg) => transformAST(arg, funcName)),
    };
  } else if (node.type === 'Identifier') {
    return {
      type: 'COLUMN',
      value: node.name,
    };
  } else if (node.type === 'Literal') {
    return {
      type: 'COLUMN',
      value: node.value,
    };
  } else if (node.type === 'BinaryExpression') {
    if (matches.length > 0) {
      return {
        type: 'CONST',
        value: matches[0].secondParam.trim(),
      };
    }
    const name = OperatorFuncMap[node.operator];
    if (!name) {
      throw new Error('Unsupported AST node operator: ' + node.operator);
    }
    return {
      type: 'FUNC',
      name,
      args: [transformAST(node.left, funcName), transformAST(node.right, funcName)],
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
  return transformAST(ast.body[0].expression, formula);
};

export const jsonToFormula = (json: FormulaJsonItem): string => {
  return transformJSON(json);
};

export const getValidSql = (sql)=>{
   if (typeof sql !== 'string') return '';
    
    let result = '';
    let inSingleQuote = false;      // 是否在单引号字符串内
    let inMultiLineComment = false; // 是否在多行注释内
    let i = 0;
    const len = sql.length;
    
    while (i < len) {
        // 1. 不在注释中时，检测字符串开始/结束
        if (!inMultiLineComment) {
            const ch = sql[i];
            
            // 处理单引号字符串（注意连续两个单引号表示转义，不结束字符串）
            if (ch === "'" && !inSingleQuote) {
                inSingleQuote = true;
                result += ch;
                i++;
                continue;
            }
            if (ch === "'" && inSingleQuote) {
                // 检查下一个字符是否也是单引号（SQL 转义写法）
                if (i + 1 < len && sql[i + 1] === "'") {
                    // 转义的单引号，依旧在字符串内
                    result += ch + sql[i + 1];
                    i += 2;
                    continue;
                } else {
                    inSingleQuote = false;
                    result += ch;
                    i++;
                    continue;
                }
            }
            
            // 不在字符串内时，检测注释开始
            if (!inSingleQuote) {
                // 检测多行注释开始 /*
                if (ch === '/' && i + 1 < len && sql[i + 1] === '*') {
                    inMultiLineComment = true;
                    i += 2;          // 跳过 /*
                    continue;
                }
                // 检测单行注释开始 --（注意避免 -- 前是字母/数字，但通常 -- 即是注释）
                if (ch === '-' && i + 1 < len && sql[i + 1] === '-') {
                    // 跳过整行直到换行或结束
                    i += 2;
                    while (i < len && sql[i] !== '\n' && sql[i] !== '\r') {
                        i++;
                    }
                    // 跳过换行符（保留换行，保持行号不变，也可选择加一个空格）
                    if (i < len && (sql[i] === '\n' || sql[i] === '\r')) {
                        // 将换行符加入结果，保持 SQL 格式
                        result += sql[i];
                        i++;
                    }
                    continue;
                }
            }
            
            // 普通字符，直接加入结果
            result += ch;
            i++;
        } else {
            // 已经在多行注释内，寻找结束符 */
            if (sql[i] === '*' && i + 1 < len && sql[i + 1] === '/') {
                inMultiLineComment = false;
                i += 2;   // 跳过 */
                continue;
            }
            i++; // 仍在注释内，跳过字符
        }
    }
    
    return result;
}

const DbTYpeMap = {
  postgres: 'postgresql',
};
/**
 * 基于原始 sql 以及新增字段、创建新的嵌套sql
 * @param sql
 * @param fields
 * @param dbType
 * @returns
 */
export const createSql = (sql: string, fields: string[], dbType: string = 'postgresql'): string => {
  const opt = { database: (DbTYpeMap[dbType] ?? dbType).toLowerCase() };

  // 1. 解析原 SQL
  const innerAst = parser.astify(sql, opt);

  // 2. 外层 SELECT AST（columns 先放原列）
  const outerAst = {
    type: 'select',
    columns: JSON.parse(JSON.stringify(innerAst.columns)).map((item) => {
      if (['aggr_func'].includes(item.expr.type)) {
        item.expr.column = {
          expr: { type: 'default', value: item.as ?? (item.expr.name?.value || item.expr.name) },
        };
        delete item.expr.name;
        delete item.expr.args;
        item.expr.type = 'column_ref';
      } else {
        item.as && (item.expr.column = item.as);
      }
      item.as = null;
      item.expr.table = null;
      return item;
    }), // 深拷贝原列
    from: [
      {
        as: 't',
        expr: { ast: innerAst, parentheses: true, type: 'select' },
      },
    ],
  };

  const fieldColumns = [];
  fields.forEach((field) => {
    // 3. 解析新字段字符串
    try {
      const tempAst = parser.astify(`SELECT ${field}`, opt);
      const fieldAst = tempAst.columns[0];

      // 外部字段汇总groupby
      if (fieldAst.expr?.type !== 'aggr_func') {
        fieldColumns.push({ ...fieldAst.expr });
      }
      // 4. 追加到外层列
      outerAst.columns.push(fieldAst);
    } catch (err) {
      console.log('err', err);
    }
  });

  // groupby
  if (fieldColumns.length !== fields.length) {
    const columns = JSON.parse(JSON.stringify(innerAst.columns)).map((item) => item.expr);
    const groupby = { columns: [...columns, ...fieldColumns] };
    outerAst['groupby'] = groupby;
  }

  // 5. 转回 SQL
  const newSQL = parser.sqlify(outerAst, opt);
  return newSQL;
};

export const getFieldString = (value: string): string => {
  const match = value.match(/^(['"`])(.*?)\1$/);
  if (match) {
    return match[2];
  }
  return value;
};
