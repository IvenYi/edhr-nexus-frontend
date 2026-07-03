import type * as Monaco from 'monaco-editor';
import { ExpressionLanguageService } from '../../../service';

/**
 * 文档语义标记提供者
 *
 * @export
 * @class DocumentSemanticTokensProvider
 * @implements {monaco.languages.DocumentSemanticTokensProvider}
 */
export class DocumentSemanticTokensProvider
  implements monaco.languages.DocumentSemanticTokensProvider
{
  constructor(protected service: ExpressionLanguageService) {}

  getLegend(): Monaco.languages.SemanticTokensLegend {
    return {
      tokenTypes: ['variable'],
      tokenModifiers: ['declaration'],
    };
  }

  releaseDocumentSemanticTokens(_resultId?: string): void {
    // console.log('关闭语义标记');
  }

  provideDocumentSemanticTokens(
    _model: Monaco.editor.ITextModel,
    _lastResultId: string | null,
    _token: Monaco.CancellationToken,
  ): Monaco.languages.ProviderResult<
    monaco.languages.SemanticTokens | monaco.languages.SemanticTokensEdits
  > {
    // 当前在标记至第几行
    let prevLine = 1;
    // 当前在标记至第几列
    let prevColumn = 0;
    const arr: number[] = [];
    // 遍历所有变量
    this.service.state.variables.forEach(({ pos }) => {
      const { startLine, startColumn, endColumn } = pos;
      const line = startLine - prevLine;
      const startChar = prevLine === startLine ? startColumn - prevColumn : startColumn;
      const length = endColumn - startColumn;
      // line: 当前需要前进的行数，例如当前在第一行，需要标记第一行的内容，传递为 0，需要标记第二行内容则标记为 1，前进一行
      // startChar: 当前行需要标记的起始位置，需要基于上一个标记的起始点进行计算
      // length: 当前行需要标记的长度
      arr.push(line, startChar, length, 0, 0);
      prevLine = startLine;
      prevColumn = startColumn;
    });
    return {
      data: Uint32Array.from(arr),
    };
  }
}
