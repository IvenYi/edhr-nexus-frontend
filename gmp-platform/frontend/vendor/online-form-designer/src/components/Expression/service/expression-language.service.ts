import { reactive } from 'vue';
import * as esprima from 'esprima-next';
import estraverse from 'estraverse';
import { Node } from 'estree';
import { ExpressionState } from '../state/expression.state';
import { ICustomMarkerData, IPostMsgData } from '../interface';
import { useExpression } from '../hooks/useExpression';
import { EntityFormulaReturnTypeEnum, IdentifierAddon, ReturnTypeEnum } from '../types';
import { BlockIdentifierReg } from '../utils/BlockIdentifier';
import { TypeVerification } from '../utils/TypeVerification';
import { NUMBER_TYPE, RETURN_TYPE_MAP, STRING_TYPE, WinMsgTypeEnum } from '../constant';
import { clone } from 'lodash-es';
import useExpression, { ExpressionModeEnum } from '/@/components/Expression';

const { globalIdentifiersMapByName, exprOptions } = useExpression(false);

/**
 * 公式编辑器语言服务
 *
 * @export
 * @class ExpressionController
 */
export class ExpressionLanguageService {
  /**
   * monaco 实例
   */
  monaco!: any;

  /**
   * 语言服务状态
   *
   * @type {ExpressionState}
   */
  readonly state: ExpressionState = reactive(new ExpressionState());

  /**
   * monaco 编辑器实例
   */
  editor!: any;

  /**
   * 描述符装饰实例
   */
  decorationsCollection: any = null;

  /**
   * 公式运算符两边类型校验工具类
   *
   * @protected
   * @type {TypeVerification}
   */
  protected typeVerification: TypeVerification = new TypeVerification(this);

  /**
   * 格式化代码，将有关键字的变量替换为占位符
   *
   * @protected
   * @param {string} codeStr
   * @returns {*}  {string}
   */
  protected transformCode(codeStr: string): string {
    this.state.nameMap.forEach((val, key) => {
      codeStr = codeStr.replaceAll(
        `${IdentifierAddon.ZeroWidth}${val}${IdentifierAddon.ZeroWidth}`,
        key,
      );
    });
    return codeStr;
  }

  /**
   * 代码值发生变化，重新生成代码的 ast
   *
   * @param {string} [codeStr='']
   * @param {boolean} [force=false] 强制更新
   */
  change(codeStr: string = '', force: boolean = false): void {
    if (force === true || this.state.code !== codeStr) {
      // 先计算变量位置，因替换界面中变量时会替换为 hash 值，避免关键字问题，所以需要先计算变量位置
      this.calcVariables();
      this.state.code = this.transformCode(codeStr);
      this.state.clearMarkers();
      try {
        this.state.ast = esprima.parse(this.state.code, { loc: true, tokens: true });
        this.traverse();
        this.calcOperatorType();
        this.calcReturnType();
      } catch (err) {
        console.error(err);
      }
      this.calcMarkers();
      this.modelChangeCalc();
      this.setDecorations();
      this.setMarkers();
      this.postMsg({ code: codeStr.replaceAll(IdentifierAddon.ZeroWidth, '') });
    }
  }

  /**
   * 设置描述
   *
   */
  setDecorations(): void {
    this.changeDecorations();
  }

  /**
   * 设置所有异常
   *
   * @protected
   */
  protected setMarkers(): void {
    const map: Map<string, ICustomMarkerData[]> = new Map();
    this.state.markers.forEach((item) => {
      const owner = item.owner || 'owner';
      if (!map.has(owner)) {
        map.set(owner, []);
      }
      map.get(owner)!.push(item);
    });
    map.forEach((markers, owner) => {
      this.monaco.editor.setModelMarkers(this.editor.getModel()!, owner, markers);
    });
  }

  /**
   * 值发生变化，重新根据文本进行相关计算
   *
   * @protected
   */
  protected modelChangeCalc(): void {
    const model = this.editor.getModel();
    if (model) {
      const lines = model.getLinesContent();
      lines;
      const reg = /[()]/g;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const Iterator = line.matchAll(reg);
        for (const item of Iterator) {
          const { index } = item;
          const startColumn = index + 1;
          const endColumn = startColumn + 1;
          this.state.operators.push({
            pos: {
              startLine: i + 1,
              startColumn,
              endLine: i + 1,
              endColumn,
            },
            operator: item[0],
          });
        }
      }
    }
  }

  /**
   * 计算所有变量
   *
   * @protected
   */
  protected calcVariables(): void {
    this.state.clearVariables();
    this.state.nameMap.clear();
    const model = this.editor.getModel()!;
    // 变量替代个数
    let num = 0;
    const keyMap: Map<string, string> = new Map();
    model
      .findMatches('\u200bs?[^\u200b]+s?\u200b', false, true, false, null, false)
      .forEach(({ range }, i) => {
        const text = model.getValueInRange(range);
        const name = text.replace(BlockIdentifierReg, '');
        if (!keyMap.has(name)) {
          // 替换名称规则，前缀 a 固定，中间为索引，后缀为占位字符，i >= 10 时，后边占位字符减去一个
          const placeholder_name = `a${num}${'_'.repeat(i < 10 ? name.length : name.length - 1)}`;
          keyMap.set(name, placeholder_name);
          this.state.nameMap.set(placeholder_name, name);
          num += 1;
        }
        const data = globalIdentifiersMapByName.value[name];
        if (data) {
          // startColumn 是元素的开始列，在光标文本的前方，endColumn 是元素的结束列需要+1，因为 monaco-editor 的选中结束光标在最后一个字符后，使用开始和结束列计算的文本长度会多一个字符
          this.state.variables.push({
            pos: {
              startLine: range.startLineNumber,
              startColumn: range.startColumn,
              endLine: range.endLineNumber,
              endColumn: range.endColumn,
            },
            name,
            placeholderName: keyMap.get(name)!,
            data,
          });
        }
      });
  }

  /**
   * 重新标记所有异常
   *
   * @protected
   */
  protected calcMarkers(): void {
    // 删除历史异常标记
    this.monaco.editor.removeAllMarkers('owner');
    const model = this.editor.getModel()!;
    //#region 计算括号是否闭合
    const stack: { text: string; range: any }[] = [];
    const startBracket = '(';
    const endBracket = ')';
    model.findMatches('[()]', false, true, false, null, false).find(({ range }) => {
      const text = model.getValueInRange(range);
      // 起始括号，放入栈
      if (text === startBracket) {
        stack.push({ text, range });
      }
      // 结束括号
      else if (text === endBracket) {
        // 栈为空，说明括号没有匹配到开始括号
        if (stack.length === 0) {
          stack.push({ text, range });
        } else {
          // 栈不为空，取出前一个括号
          const before = stack[stack.length - 1];
          // 前一个括号不是开始括号
          if (before.text !== startBracket) {
            stack.push({ text, range });
          } else {
            // 栈不为空，并且前置括号为开始，则匹配到删除前括号
            stack.pop();
          }
        }
      }
      return false;
    });
    // 所有在堆栈中的说明匹配异常的括号\
    stack.forEach(({ text, range }) => {
      this.state.addMarker({
        startLineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        endLineNumber: range.endLineNumber,
        endColumn: range.endColumn,
        severity: this.monaco.MarkerSeverity.Error,
        message: `${$t('sys.pageDesigner.bracketNotClosed', { sth: text })}`,
      });
    });
    //#endregion
  }

  /**
   * 计算公式返回值类型，不正确时补充异常
   *
   * @protected
   */
  protected calcReturnType(): void {
    // 公式无异常时才计算
    if (this.state.markers.length === 0) {
      if (!exprOptions.value?.returnType || !this.state.code) {
        return;
      }
      const types: string[] = [];
      this.state.ast.body.forEach((node) => {
        types.push(...this.typeVerification.deepCalcTypes(node as unknown as Node, true));
      });
      const set = new Set(types);
      if (set.size > 0) {
        this.state.returnType = Array.from(set);
      } else {
        this.state.returnType = ['unknown'];
      }
      const returnType = this.state.returnType[0];
      if (this.state.returnType.length === 1 && returnType === exprOptions.value.returnType) {
        return;
      }
      if (returnType === STRING_TYPE) {
        const type = exprOptions.value.returnType;
        switch (type) {
          case ReturnTypeEnum.String:
          case EntityFormulaReturnTypeEnum.Text:
          case EntityFormulaReturnTypeEnum.LongText:
            return;
          default:
        }
      }
      if (returnType === NUMBER_TYPE) {
        switch (exprOptions.value.returnType) {
          case ReturnTypeEnum.Number:
          case EntityFormulaReturnTypeEnum.Double:
          case EntityFormulaReturnTypeEnum.Int:
          case EntityFormulaReturnTypeEnum.Long:
            return;
          default:
        }
      }
      const model = this.editor.getModel()!;
      // 最后一行数
      const maxLine = model.getLineCount();
      // 最后一行的最大列
      const maxCol = model.getLineMaxColumn(maxLine);
      this.state.addMarker({
        message: `${$t('sys.pageDesigner.expReturnError')}：【${this.state.returnType
          .map((val) => {
            return RETURN_TYPE_MAP[val];
          })
          .join('|')}】；${$t('sys.pageDesigner.expExpectedType')}：【${
          RETURN_TYPE_MAP[exprOptions.value?.returnType ?? 'unknown']
        }】`,
        severity: this.monaco.MarkerSeverity.Error,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: maxLine,
        endColumn: maxCol,
      });
    }
  }

  /**
   * 计算操作符两边的类型是否正确
   *
   * @protected
   */
  protected calcOperatorType(): void {
    estraverse.traverse(this.state.ast as any, {
      enter: (node) => {
        switch (node.type) {
          case esprima.Syntax.BinaryExpression:
          case esprima.Syntax.LogicalExpression:
          case esprima.Syntax.UnaryExpression:
            exprOptions.value?.mode == ExpressionModeEnum.BI_FORMULA
              ? null
              : this.typeVerification.check(node as any);

            break;
          default:
        }
      },
    });
  }

  /**
   * 遍历语法树
   *
   * @protected
   */
  protected traverse(): void {
    // 重置变量
    this.state.operators = [];
    const model = this.editor.getModel()!;
    estraverse.traverse(this.state.ast as any, {
      enter: (node) => {
        switch (node.type) {
          case esprima.Syntax.BinaryExpression:
          case esprima.Syntax.LogicalExpression:
          case esprima.Syntax.UnaryExpression:
            this.state.addOperator(model, node as any, this.monaco);
            break;
          case esprima.Syntax.ConditionalExpression:
            if (node.loc) {
              const { start, end } = node.loc;
              const model = this.editor.getModel()!;
              // 开始结束在同一行
              if (start.line === end.line) {
                // 获取行文本
                const text = model
                  .getLineContent(start.line)
                  // -1 是需要转为下标
                  .substring(start.column - 1, end.column - 1);
                // 获取 ? 号操作符位置
                const index = text.indexOf('?');
                if (index > -1) {
                  const startColumn = start.column + index;
                  const endColumn = startColumn + 1;
                  this.state.operators.push({
                    pos: {
                      startLine: start.line,
                      startColumn,
                      endLine: start.line,
                      endColumn: endColumn,
                    },
                    operator: '?',
                  });
                }
              }
              // 跨行时处理
              else {
                const contents: string[] = [];
                // 过滤出从开始行到结束行内容
                for (let i = start.line; i <= end.line; i++) {
                  contents.push(model.getLineContent(i));
                }
                // 看操作符在哪一行
                const i = contents.findIndex((content) => content.includes('?'));
                const text = contents[i];
                // 获取 ? 号操作符位置
                const index = text.indexOf('?');
                if (index > -1) {
                  const startColumn = start.column + index;
                  const endColumn = startColumn + 1;
                  this.state.operators.push({
                    pos: {
                      startLine: start.line,
                      startColumn,
                      endLine: start.line,
                      endColumn: endColumn,
                    },
                    operator: '?',
                  });
                }
              }
            }
            break;
          default:
        }
      },
    });
  }

  /**
   * 计算描述符
   *
   * @protected
   */
  protected changeDecorations(): void {
    const decorations = this.state.variables.map<Monaco.editor.IModelDeltaDecoration>((item) => {
      return {
        range: new this.monaco.Range(
          item.pos.startLine,
          item.pos.startColumn,
          item.pos.endLine,
          item.pos.endColumn,
        ),
        options: {
          inlineClassName: 'expression-variable-block',
          // 边缘输入时不进行装饰
          // Customize the growing behavior of the decoration when typing at the edges of the decoration. Defaults to TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
          //自定义在装饰边缘打字时装饰的生长行为。 默认为 TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
          stickiness: this.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      };
    });
    if (this.decorationsCollection) {
      this.decorationsCollection.set(decorations);
    } else {
      this.decorationsCollection = this.editor.createDecorationsCollection(decorations);
    }
  }

  /**
   * 向父页面发送消息
   *
   * @param {*} data
   * @param {string} [event='change']
   */
  postMsg(data: any, event: string = 'change') {
    window.postMessage(
      JSON.stringify({
        type: WinMsgTypeEnum.EXPRESSION,
        event,
        errors: clone(this.state.markers),
        data,
      } as IPostMsgData),
      '*',
    );
  }
}
