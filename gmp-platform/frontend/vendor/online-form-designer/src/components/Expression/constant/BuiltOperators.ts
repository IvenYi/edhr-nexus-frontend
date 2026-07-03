import { OperatorTypeEnum } from '../types/index';
/**
 * 运算符提示清单
 */
export const BuiltOperators = {
  '+': {
    title: 'sys.pageDesigner.oper.plus',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.ARITHMETIC,
  },
  '-': {
    title: 'sys.pageDesigner.oper.minus',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.ARITHMETIC,
  },
  '*': {
    title: 'sys.pageDesigner.oper.multiply',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.ARITHMETIC,
  },
  '/': {
    title: 'sys.pageDesigner.oper.divide',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.ARITHMETIC,
  },
  '%': {
    title: 'sys.pageDesigner.oper.modulo',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.ARITHMETIC,
  },
  '>': {
    title: 'sys.pageDesigner.oper.greaterThan',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.RELATIONSHIP,
  },
  '>=': {
    title: 'sys.pageDesigner.oper.greaterThanOrEqual',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.RELATIONSHIP,
  },
  '<': {
    title: 'sys.pageDesigner.oper.lessThan',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.RELATIONSHIP,
  },
  '<=': {
    title: 'sys.pageDesigner.oper.lessThanOrEqual',
    description: 'sys.pageDesigner.oper.tip01',
    group: OperatorTypeEnum.RELATIONSHIP,
  },
  '==': {
    title: 'sys.pageDesigner.oper.equal',
    description: 'sys.pageDesigner.oper.tip02',
    group: OperatorTypeEnum.RELATIONSHIP,
  },
  '!=': {
    title: 'sys.pageDesigner.oper.notEqual',
    description: 'sys.pageDesigner.oper.tip02',
    group: OperatorTypeEnum.RELATIONSHIP,
  },
  '&&': {
    title: 'sys.pageDesigner.oper.and',
    description: 'sys.pageDesigner.oper.tip03',
    group: OperatorTypeEnum.LOGIC,
  },
  '||': {
    title: 'sys.pageDesigner.oper.or',
    description: 'sys.pageDesigner.oper.tip03',
    group: OperatorTypeEnum.LOGIC,
  },
  '!': {
    title: 'sys.pageDesigner.oper.not',
    description: 'sys.pageDesigner.oper.tip03',
    group: OperatorTypeEnum.LOGIC,
  },
  '?': {
    title: 'sys.pageDesigner.oper.if',
    description: 'sys.pageDesigner.oper.tip04',
    group: OperatorTypeEnum.OTHER,
    label: '?:',
    output: '?:',
  },
  '(': {
    title: 'sys.pageDesigner.oper.leftParenthesis',
    description: 'sys.pageDesigner.oper.tip05',
    group: OperatorTypeEnum.OTHER,
  },
  ')': {
    title: 'sys.pageDesigner.oper.rightParenthesis',
    description: 'sys.pageDesigner.oper.tip05',
    group: OperatorTypeEnum.OTHER,
  },
};

// 两边均为数字类型的操作符
export const numberOperator = ['+', '-', '*', '/', '%', '>', '>=', '<', '<='];

// 两边为布尔类型的操作符
export const booleanOperator = ['&&', '||', '!'];

// 两边为数字、布尔、字符串类型的操作符
export const allOperator = ['==', '!=', '?', ':'];

// 返回值是布尔的操作符类型
export const returnBolOperator = ['&&', '||', '!', '==', '!=', '>', '>=', '<', '<='];

export const getOperatorList = () => {
  const children = Object.keys(BuiltOperators).map((i) => {
    const { title, description, group, label, output } = BuiltOperators[i];
    return { name: label ?? i, group, desc: `${$t(title)}\n${$t(description)}`, id: output ?? i };
  });
  return [
    OperatorTypeEnum.ARITHMETIC,
    OperatorTypeEnum.RELATIONSHIP,
    OperatorTypeEnum.LOGIC,
    OperatorTypeEnum.OTHER,
  ].map((i) => {
    return {
      id: i,
      name: $t(`sys.expression.${i}`),
      children: children.filter((g) => g.group === i),
      idToChildren: false,
    };
  });
};
