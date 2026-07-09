import type * as Monaco from 'monaco-editor';
import { ExpressionLanguageService } from '../../../service';
import { BuiltOperators } from '../../../constant/BuiltOperators';

/**
 * 运算符补全
 *
 * @export
 * @class OperatorCompletionItemProvider
 * @implements {Monaco.languages.CompletionItemProvider}
 */
export class OperatorCompletionItemProvider implements Monaco.languages.CompletionItemProvider {
  triggerCharacters: string[] = ['+', '-', '*', '/', '%', '>', '<', '=', '!', '&', '|', '!', '?'];

  constructor(protected service: ExpressionLanguageService) {}

  provideCompletionItems(
    model: Monaco.editor.ITextModel,
    position: Monaco.Position,
    _context: Monaco.languages.CompletionContext,
    _token: Monaco.CancellationToken,
  ): Monaco.languages.ProviderResult<Monaco.languages.CompletionList> {
    const text = model.getLineContent(position.lineNumber);
    const chart = text.charAt(position.column - 1);
    const keys = Object.keys(BuiltOperators).filter((key) => key.startsWith(chart));

    if (keys.length > 0) {
      const monaco = this.service.monaco;
      return {
        suggestions: keys.map((key) => {
          const val = BuiltOperators[key];
          return {
            label: key,
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: key,
            range: new monaco.Range(
              position.lineNumber,
              position.column - 1,
              position.lineNumber,
              position.column,
            ),
            detail: val.title,
          };
        }),
      };
    }
  }
}
