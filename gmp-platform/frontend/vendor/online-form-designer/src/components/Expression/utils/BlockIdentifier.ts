import * as esprima from 'esprima-next';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import { useExpression } from '../hooks/useExpression';
// import { ExpressionTabEnum, IdentifierAddon } from '../types/index';
import type { Monaco } from '@gct/runtime-web';
import { deepCalcName } from './expression';
import { ExpressionLanguageService } from '../service';
import { last } from 'lodash-es';
import { stopDefaultEvent } from '@gct/runtime';
import { ExpressionTabEnum, IdentifierAddon } from '../types';
// import * as ESTree from 'estree';
// import { operator2FuncMap } from '../constant';

const { globalIdentifiersMapByName, globalIdentifiersMapById } = useExpression(false);

export const BlockIdentifierReg = /\u200b/g;

export const MatchReg = /'\u200b\s?[^\u200b]+\s?\u200b'/;

export default class BlockIdentifier {
  editor!: Monaco.editor.IStandaloneCodeEditor;

  constructor(protected service: ExpressionLanguageService) {
    this.editor = service.editor;
    this.register();
  }

  // 停用转换回显，采用保存时存两份，可以避免多种因转换导致的界面呈现换行空格等问题(2025-01-14)
  idToName(code: string) {
    if (!code) return;
    const ast = esprima.parse(code);
    estraverse.traverse(ast as any, {
      enter: function (node: any) {
        if (node.type === esprima.Syntax.MemberExpression) {
          const id = deepCalcName(node);
          if (globalIdentifiersMapById.value[id]) {
            Object.assign(node, {
              name: `${IdentifierAddon.Prefix}${globalIdentifiersMapById.value[id]._name_}${IdentifierAddon.Suffix}`,
              type: esprima.Syntax.Identifier,
            });
          }
        } else if (node.type === esprima.Syntax.Identifier) {
          const data = globalIdentifiersMapById.value[node.name];
          if (data && data._type_ !== ExpressionTabEnum.FUNCTION) {
            Object.assign(node, {
              name: `${IdentifierAddon.Prefix}${data._name_}${IdentifierAddon.Suffix}`,
            });
          }
        }
      },
    });
    const result = escodegen.generate(ast, {
      format: {
        semicolons: false,
        reprint: true, // 尝试保留原始格式
        compact: false, // 不使用紧凑模式
        newline: '\n', // 指定换行符
      },
    });
    return result;
  }

  nameToId(code: string) {
    // 根据语法树解析
    const ast = esprima.parse(code);
    estraverse.traverse(ast as any, {
      enter: (node: any) => {
        const _name = deepCalcName(node);
        const name = this.service.state.nameMap.get(_name)!;
        if (node.type === esprima.Syntax.MemberExpression) {
          if (globalIdentifiersMapByName.value[name]) {
            Object.assign(node, {
              name: globalIdentifiersMapByName.value[name]._id_,
              type: esprima.Syntax.Identifier,
            });
          }
        } else if (node.type === esprima.Syntax.Identifier) {
          if (globalIdentifiersMapByName.value[name]) {
            Object.assign(node, {
              name: globalIdentifiersMapByName.value[name]._id_,
            });
          }
        }
      },
    });
    // estraverse.replace(ast as any, {
    //   enter(node: ESTree.Node) {
    //     if (node.type === esprima.Syntax.BinaryExpression) {
    //       const { operator } = node;
    //       const fnName = operator2FuncMap[operator];
    //       if (!fnName) {
    //         return node;
    //       }
    //       return {
    //         type: esprima.Syntax.CallExpression,
    //         arguments: [node.left as ESTree.Expression, node.right],
    //         callee: {
    //           type: esprima.Syntax.Identifier,
    //           name: fnName,
    //         },
    //         optional: false,
    //       } satisfies ESTree.CallExpression;
    //     }
    //     return node;
    //   },
    // });
    return escodegen.generate(ast, {
      format: {
        semicolons: false,
        reprint: true, // 尝试保留原始格式
        compact: false, // 不使用紧凑模式
        newline: '\n', // 指定换行符
      },
    });
    // 根据零宽字符匹配
    // let result = code;
    // const identifiers = this.editor
    //   .getModel()!
    //   .findMatches(MatchReg as unknown as string, false, true, false, null, false)
    //   .map((item) => {
    //     const data = this.editor.getModel()!.getValueInRange(item.range);
    //     return data;
    //   });
    // identifiers.forEach((name) => {
    //   const id =
    //     globalIdentifiersMapByName.value[name.replaceAll(IdentifierAddon.ZeroWidth, '').trim()]
    //       ._id_;
    //   id && (result = result.replaceAll(name, id));
    // });
    // return result;
  }

  /**
   * 查找光标左侧的block
   * @param {*} param0
   * @returns
   */
  findDecorationRangeOnLeft({ lineNumber, column }) {
    if (this.service.state.variables.length > 0) {
      return this.service.state.variables.find((variable) => {
        const { pos } = variable;
        if (pos.endLine === lineNumber && pos.endColumn + 1 === column) {
          return variable;
        }
      });
    }
    return undefined;
  }

  /**
   * 查找光标右侧的 block
   * @param {*} param0
   * @returns
   */
  findDecorationRangeOnRight({ lineNumber, column }) {
    if (this.service.state.variables.length > 0) {
      return this.service.state.variables.find((variable) => {
        const { pos } = variable;
        if (pos.startLine === lineNumber && pos.startColumn + 1 === column) {
          return variable;
        }
      });
    }
    return undefined;
  }

  register() {
    /**
     * 选中发生改变
     */
    this.editor.onDidChangeCursorSelection(({ selection, oldSelections }) => {
      const selections = this.editor.getSelections();
      if (!selections) {
        return;
      }
      // 禁止多光标选择，如果选择了多个光标，只保留最后一个
      if (selections.length > 1) {
        this.editor.setSelection(last(selections)!);
        return;
      }
      // 旧的选择
      const old = oldSelections?.[0];
      const {
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
        selectionStartLineNumber,
        selectionStartColumn,
        positionLineNumber,
        positionColumn,
      } = selection;
      // 只要开始和节数不在同行同列，认为是选中了内容
      const isSelected =
        selectionStartLineNumber !== positionLineNumber || selectionStartColumn !== positionColumn;
      // 是从前往后移动 or 从后往前移动
      let isForward = false;
      // 是从前往后选中 or 从后往前选中
      // const front2back = selectionStartColumn < positionColumn;
      if (old) {
        // 判断起始点和结束点的位置来判断光标的移动方向
        // 光标起始结束在同一行时
        if (old.positionLineNumber === positionLineNumber) {
          // 根据起始小于结束则向后移动，否则向前移动
          isForward = old.positionColumn < positionColumn;
        } else {
          // 根据起始行小于结束则向后移动，否则向前移动
          isForward = old.positionLineNumber < positionLineNumber;
        }
      } else {
        // 判断起始点和结束点的位置来判断光标的移动方向
        // 光标起始结束在同一行时
        if (selectionStartLineNumber === positionLineNumber) {
          // 根据起始小于结束则向后移动，否则向前移动
          isForward = selectionStartColumn < positionColumn;
        } else {
          // 根据起始行小于结束则向后移动，否则向前移动
          isForward = selectionStartLineNumber < positionLineNumber;
        }
      }
      // 光标在匹配项
      const variable = this.service.state.variables.find((variable) => {
        const { pos } = variable;
        const { startLine, endLine } = pos;
        if (
          positionLineNumber >= startLine &&
          positionLineNumber <= endLine &&
          positionColumn > pos.startColumn &&
          positionColumn < pos.endColumn
        ) {
          return true;
        }
        return false;
      });
      // 无匹配的变量块跳过
      if (!variable) {
        return;
      }
      if (isSelected) {
        const { pos } = variable;
        // 如果计算出的变量在选中的范围内，不做任何操作
        if (pos.startLine >= startLineNumber && pos.endLine <= endLineNumber) {
          // 不在同一行无需判断起始和结束列
          if (startLineNumber !== endLineNumber) {
            return;
          }
          // 在同一行时需判断是否在列范围内
          if (pos.startColumn >= startColumn && pos.endColumn <= endColumn) {
            return;
          }
        }
        /*
         * 有选中数据逻辑，把块包含进去
         */
        if (isForward) {
          // 向后移动，起始点不变
          this.editor.setSelection(
            new this.service.monaco.Selection(
              selectionStartLineNumber,
              selectionStartColumn,
              variable.pos.endLine,
              variable.pos.endColumn,
            ),
          );
        } else {
          // 向前移动，结束点不变
          this.editor.setSelection(
            new this.service.monaco.Selection(
              selectionStartLineNumber,
              selectionStartColumn,
              variable.pos.startLine,
              variable.pos.startColumn,
            ),
          );
        }
      } else {
        /*
         * 无选中数据逻辑，单纯移动光标
         */
        if (isForward) {
          this.editor.setPosition({
            lineNumber: variable.pos.endLine,
            column: variable.pos.endColumn,
          });
        } else if (variable.pos.startColumn < positionColumn) {
          this.editor.setPosition({
            lineNumber: variable.pos.startLine,
            column: variable.pos.startColumn,
          });
        }
      }
    });

    this.editor.onKeyDown((e) => {
      if (e.keyCode === this.service.monaco.KeyCode.Backspace || e.keyCode === this.service.monaco.KeyCode.Delete) {
        // 获取当前光标位置
        const selection = this.service.editor.getSelection();
        if (selection) {
          const {
            startLineNumber,
            startColumn,
            endLineNumber,
            endColumn,
            positionColumn,
            positionLineNumber,
          } = selection;
          // 有选中的内容，则使用原本的默认处理
          if (startLineNumber !== endLineNumber || startColumn !== endColumn) {
            return;
          }
          // 光标在匹配项
          const variable = this.service.state.variables.find((variable) => {
            const { pos } = variable;
            const { startLine, endLine } = pos;
            const startColumn = pos.startColumn;
            const endColumn = pos.endColumn;
            if (positionLineNumber >= startLine && positionLineNumber <= endLine) {
              if (e.keyCode === this.service.monaco.KeyCode.Backspace) {
                if (positionColumn > startColumn && positionColumn <= endColumn) {
                  return true;
                }
              }
              if (e.keyCode === this.service.monaco.KeyCode.Delete) {
                if (positionColumn >= startColumn && positionColumn < endColumn) {
                  return true;
                }
              }
            }
          });
          if (variable) {
            // 阻止默认事件
            stopDefaultEvent(e as any);
            const startColumn = variable.pos.startColumn;
            this.service.editor.executeEdits(null, [
              {
                range: new this.service.monaco.Range(
                  variable.pos.startLine,
                  startColumn,
                  variable.pos.endLine,
                  variable.pos.endColumn,
                ),
                text: '',
              },
            ]);
            // 如果是退格需要调整光标位置
            if (e.keyCode === this.service.monaco.KeyCode.Backspace) {
              this.service.editor.setPosition({
                lineNumber: variable.pos.startLine,
                column: startColumn,
              });
            }
          }
        }
      }
    });
  }
}
