import * as esprima from 'esprima-next';
import { UnaryExpression, BinaryExpression, LogicalExpression } from 'esprima-next';
import { Node } from 'estree';
import { IVariableItem, IOperatorItem, ICustomMarkerData, ITokenEntry } from '../interface';

/**
 * 公式编辑器状态
 *
 * @export
 * @class ExpressionState
 */
export class ExpressionState {
  /**
   * 字段名映射，为了支持在代码中显示中文字段名并且包含关键字，转换为指定长度的字符串来规避关键字
   *
   * @type {Map<string, string>}
   */
  nameMap: Map<string, string> = new Map();

  /**
   * 当前输入的公式文本
   *
   * @type {string}
   */
  code: string = '';

  /**
   * js ast
   *
   * @type {(esprima.Program & {
   *     tokens?: ITokenEntry[];
   *   })}
   */
  ast: esprima.Program & {
    tokens?: ITokenEntry[];
  } = esprima.parse('');

  /**
   * 编辑器所有异常信息
   *
   * @type {ICustomMarkerData[]}
   */
  markers: ICustomMarkerData[] = [];

  /**
   * ast 解析出的所有变量
   *
   * @type {IVariableItem[]}
   */
  variables: IVariableItem[] = [];

  /**
   * ast 解析出的所有运算符
   *
   * @type {IOperatorItem[]}
   */
  operators: IOperatorItem[] = [];

  /**
   * 公式返回值类型
   *
   * @type {string[]}
   */
  returnType: string[] = [];

  /**
   * 清空变量
   *
   */
  clearVariables(): void {
    this.variables = [];
  }

  /**
   * 新增操作符位置
   *
   * @param {Monaco.editor.ITextModel} model
   * @param {(UnaryExpression | BinaryExpression | LogicalExpression)} node
   * @param {typeof Monaco} monaco - Monaco 实例
   */
  addOperator(
    model: any,
    node: UnaryExpression | BinaryExpression | LogicalExpression,
    monaco: any,
  ): void {
    if ((node as Node).loc) {
      let { start, end } = (node as Node).loc!;
      const { left, right } = node as { left: Node; right: Node };
      if (left && left.loc) {
        start = left.loc.end;
      }
      if (right && right.loc) {
        end = right.loc.start;
      }
      let startColumn = start.column + 1;
      const text = model.getValueInRange(
        new monaco.Range(start.line, startColumn, end.line, end.column + 1),
      );
      const i = text.indexOf(node.operator);
      startColumn = startColumn + i;
      this.operators.push({
        pos: {
          startLine: start.line,
          startColumn,
          endLine: start.line,
          endColumn: startColumn + node.operator.length,
        },
        operator: node.operator,
      });
    }
  }

  /**
   * 清空错误信息
   *
   */
  clearMarkers(): void {
    this.markers = [];
  }

  /**
   * 添加错误信息
   *
   * @param {ICustomMarkerData} marker
   */
  addMarker(marker: ICustomMarkerData): void {
    // 异常之前有的块级变量
    const blocks = this.variables.filter((item) => {
      const { endLine, endColumn } = item.pos;
      return (
        (endLine == marker.startLineNumber && endColumn < marker.startColumn) ||
        endLine < marker.startLineNumber
      );
    });
    // 异常之内的块级变量
    const inBlocks = this.variables.filter((item) => {
      const { startLine, startColumn, endLine, endColumn } = item.pos;
      return (
        ((startLine == marker.startLineNumber && startColumn + 2 >= marker.startColumn) ||
          startLine > marker.startLineNumber) &&
        ((endLine == marker.endLineNumber && endColumn <= marker.endColumn) ||
          endLine < marker.endLineNumber)
      );
    });
    marker.tipLine = marker.endLineNumber;
    marker.tipColumn = marker.endColumn;
    if (blocks.length > 0 || inBlocks.length > 0) {
      console.log('addMarker', blocks.length, inBlocks.length);
      marker.tipColumn = marker.endColumn - blocks.length * 2 - inBlocks.length * 2;
    }
    this.markers.push(marker);
  }
}
