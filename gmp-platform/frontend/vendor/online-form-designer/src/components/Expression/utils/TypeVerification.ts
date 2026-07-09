import { UnaryExpression, BinaryExpression, LogicalExpression, Syntax } from 'esprima-next';
import { Node } from 'estree';
import { ExpressionLanguageService } from '../service';
import {
  allOperator,
  booleanOperator,
  numberOperator,
  returnBolOperator,
} from '../constant/BuiltOperators';
import { deepCalcName } from './expression';
import { useExpression } from '../hooks/useExpression';
import { booleanTypes, numberTypes } from '../constant/variable';
import {
  BOOLEAN_TYPE,
  FUN_BOL_TYPE,
  FUN_NUM_TYPE,
  FUN_OBJ_OR_ARR_TYPE,
  NUMBER_TYPE,
  OBJECT_TYPE,
  STRING_TYPE,
} from '../constant';
import { difference } from 'lodash-es';

const { globalIdentifiersMapByName } = useExpression(false);

/**
 * 代码类型效验
 *
 * @export
 * @class TypeVerification
 */
export class TypeVerification {
  /**
   * Creates an instance of TypeVerification.
   *
   * @param {ExpressionLanguageService} service
   */
  constructor(protected service: ExpressionLanguageService) {}

  /**
   * 检测操作符两边的类型是否符合要求
   *
   * @param {(UnaryExpression | BinaryExpression | LogicalExpression)} node
   */
  check(node: UnaryExpression | BinaryExpression | LogicalExpression): void {
    const { operator } = node;
    const left = (node as any).left as unknown as Node;
    const right = (node as any).right as unknown as Node;
    const leftTypes = this.deepCalcTypes(left, true);
    const rightTypes = this.deepCalcTypes(right, true);
    let leftSize = 0;
    let rightSize = 0;
    if (node?.left?.callee?.name == 'NULLIF' || node?.right?.callee?.name == 'NULLIF') return;
    if (numberOperator.includes(operator)) {
      // 要求两边都是数字
      // 不是数字类型
      leftSize = leftTypes.filter((item) => item !== NUMBER_TYPE).length;
      rightSize = rightTypes.filter((item) => item !== NUMBER_TYPE).length;
    }
    // 要求两边都是布尔
    if (booleanOperator.includes(operator)) {
      // 不是数字类型
      leftSize = leftTypes.filter((item) => item !== BOOLEAN_TYPE).length;
      rightSize = rightTypes.filter((item) => item !== BOOLEAN_TYPE).length;
    }
    // 允许数字、布尔、字符串
    if (allOperator.includes(operator)) {
      const types = [NUMBER_TYPE, BOOLEAN_TYPE, STRING_TYPE];
      leftSize = difference(leftTypes, types).length;
      rightSize = difference(rightTypes, types).length;
    }
    const model = this.service.editor.getModel()!;
    if (leftSize > 0) {
      const { start, end } = left.loc!;
      const text = model.getValueInRange(
        new this.service.monaco.Range(start.line, start.column + 1, end.line, end.column + 1),
      );
      this.service.state.addMarker({
        startLineNumber: start.line,
        startColumn: start.column + 1,
        endLineNumber: end.line,
        endColumn: end.column + 1,
        severity: this.service.monaco.MarkerSeverity.Error,
        message: `公式运算内容与运算类型不匹配 【${text}】`,
      });
    }
    if (rightSize > 0) {
      const { start, end } = right.loc!;
      const text = model.getValueInRange(
        new this.service.monaco.Range(start.line, start.column + 1, end.line, end.column + 1),
      );
      this.service.state.addMarker({
        startLineNumber: start.line,
        startColumn: start.column + 1,
        endLineNumber: end.line,
        endColumn: end.column + 1,
        severity: this.service.monaco.MarkerSeverity.Error,
        message: `公式运算内容与运算类型不匹配 【${text}】`,
      });
    }
  }

  /**
   * 递归计算节点的类型
   *
   * @param {Node} node
   * @param {boolean} [isReturn=false]
   * @returns {*}  {string[]}
   */
  deepCalcTypes(node: Node, isReturn: boolean = false): string[] {
    if (node.type === Syntax.ExpressionStatement) {
      return this.deepCalcTypes(node.expression, isReturn);
    }
    if (node.type === Syntax.ConditionalExpression) {
      const { consequent, alternate } = node as any;
      const consequentType = this.deepCalcTypes(consequent, isReturn);
      const alternateType = this.deepCalcTypes(alternate, isReturn);
      return [...consequentType, ...alternateType];
    }
    if (node.type === Syntax.CallExpression) {
      // 是计算方法的情况下，根据计算方法确认返回值类型
      const { name } = node.callee as any;
      if (name === 'IF') {
        const [_, left, right] = node.arguments;
        if (!left || !right) {
          return [];
        }
        const leftType = this.deepCalcTypes(left, isReturn);
        const rightType = this.deepCalcTypes(right, isReturn);
        return [...leftType, ...rightType];
      }
      if (FUN_NUM_TYPE.includes(name)) {
        return [NUMBER_TYPE];
      }
      if (FUN_BOL_TYPE.includes(name)) {
        return [BOOLEAN_TYPE];
      }
      if (FUN_OBJ_OR_ARR_TYPE.includes(name)) {
        return [OBJECT_TYPE];
      }
      return [STRING_TYPE];
    }
    if (
      node.type === Syntax.BinaryExpression ||
      node.type === Syntax.UnaryExpression ||
      node.type === Syntax.LogicalExpression
    ) {
      if (isReturn && returnBolOperator.includes(node.operator)) {
        return [BOOLEAN_TYPE];
      }
      const leftType = this.deepCalcTypes((node as any).left as unknown as Node, isReturn);
      const rightType = this.deepCalcTypes((node as any).right as unknown as Node, isReturn);
      return [...leftType, ...rightType];
    }
    if (node.type === Syntax.Literal) {
      const tokens = this.service.state.ast.tokens;
      if (tokens?.length) {
        const text = node.raw!;
        const item = tokens.find((item) => item.value === text);
        switch (item?.type) {
          case 'Numeric':
            return [NUMBER_TYPE];
          case 'Boolean':
            return [BOOLEAN_TYPE];
          case 'String':
            return [STRING_TYPE];
          default:
        }
      }
    }
    // 自定义变量对象
    if (node.type === Syntax.MemberExpression || node.type === Syntax.Identifier) {
      const _name = deepCalcName(node);
      const name = this.service.state.nameMap.get(_name)!;
      const data = globalIdentifiersMapByName.value[name];
      if (!data) {
        return ['unknown'];
      }
      const type = data.valueType! ?? data.type!;
      if (numberTypes.includes(type)) {
        return [NUMBER_TYPE];
      }
      if (booleanTypes.includes(type)) {
        return [BOOLEAN_TYPE];
      }
      return [STRING_TYPE];
    }
    return ['unknown'];
  }
}
