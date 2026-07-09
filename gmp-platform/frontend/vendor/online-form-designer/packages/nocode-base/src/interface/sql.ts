import { Parser } from 'node-sql-parser';

// 临时替换模板变量为合法标识符
const replacePlaceholders = (sql) => {
  return sql.replace(/\${([\w.]+)}/g, (_, name) => `__TMP_PLACEHOLDER_${name}__`);
};

// 解析后还原占位符
const restorePlaceholders = (sql) => {
  return sql.replace(/__TMP_PLACEHOLDER_([\w.]+)__/g, '${$1}');
};

function extractSelectFields(ast) {
  if (ast.type !== 'select') return [];

  return ast.columns
    .map((column) => {
      // 处理字段别名（AS 语法）
      if (column.as) return column.as;

      // 处理直接字段名
      if (column.expr.column) return column.expr.column;

      // 处理函数表达式（如 COUNT(*)）
      if (column.expr.type === 'function') {
        return column.expr.name.toUpperCase();
      }

      return;
    })
    .filter(Boolean);
}

// 安全解析函数得到字段列表
const safeParseSQL2Fields = (templateSQL) => {
  try {
    const parser = new Parser();

    // 1. 预处理：替换 ${...} 为合法标识符
    const safeSQL = replacePlaceholders(templateSQL);

    // 2. 执行解析
    const info = parser.parse(safeSQL);

    const fields = extractSelectFields(info.ast);

    console.log('fields', fields);
    return fields;
  } catch (err) {
    console.error('SQL 解析失败:', err.message);
    return [];
  }
};

const safeReplaceValues = (sql, values) => {
  const parser = new Parser();

  let hasInvalid = false; // 标记是否存在无效参数

  // 1. 替换占位符并处理 null/undefined
  let finalSQL = sql.replace(/\${([\w.]+)}/g, (_, key) => {
    const value = values.get(key);

    // 处理未定义参数
    if (value === undefined) {
      hasInvalid = true; // 标记为无效
      return '__UNDEFINED__'; // 特殊标记
    }

    // 处理 null 值
    if (value === null) {
      return 'NULL';
    }

    // 类型安全处理
    switch (typeof value) {
      case 'string':
        return `'${value.replace(/'/g, "''")}'`;
      case 'number':
        return value.toString();
      case 'boolean':
        return value ? 'TRUE' : 'FALSE';
      case 'object':
        if (value instanceof Date) {
          return `'${value.toISOString()}'`;
        }
        hasInvalid = true; // 标记为无效
        return '__INVALID__'; // 标记不支持的类型
      default:
        hasInvalid = true; // 标记为无效
        return '__INVALID__';
    }
  });

  if (hasInvalid || /(__UNDEFINED__|__INVALID__)/.test(finalSQL)) {
    return '';
  }

  finalSQL = finalSQL.replace(/(=)\s*NULL/gi, 'IS NULL').replace(/(!=)\s*NULL/gi, 'IS NOT NULL');

  // 3. 修复 SQL 结构
  finalSQL = finalSQL
    // 处理连续逻辑运算符
    .replace(/(WHERE|AND|OR)\s+(AND|OR)/gi, '$1')
    // 清理空括号
    .replace(/\(\s*\)/g, '')
    // 移除空 WHERE
    .replace(/WHERE\s*$/i, '')
    // 移除末尾多余的 AND/OR
    .replace(/(AND|OR)\s*$/gi, '')
    .trim();

  try {
    // 4. 语法验证
    parser.parse(finalSQL);
    return finalSQL;
  } catch (err) {
    console.error(`[SQL 生成失败] ${err.message}\n生成语句: ${finalSQL}`);

    return '';
  }
};

export const sqlUtils = {
  safeParseSQL2Fields,
  safeReplaceValues,
};
