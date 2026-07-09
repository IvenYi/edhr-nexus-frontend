import type * as Monaco from 'monaco-editor';
import { ExpressionLanguageService } from '../../../service';
import { BuiltOperators } from '../../../constant/BuiltOperators';

/**
 * 自定义语言操作符提示适配器
 *
 * @export
 * @class OperatorHoverProvider
 * @implements {monaco.languages.HoverProvider}
 */
export class OperatorHoverProvider implements monaco.languages.HoverProvider {
  constructor(protected service: ExpressionLanguageService) {}

  provideHover(
    model: Monaco.editor.ITextModel,
    position: Monaco.Position,
    _token: Monaco.CancellationToken,
    _context?: Monaco.languages.HoverContext<monaco.languages.Hover>,
  ): Monaco.languages.ProviderResult<monaco.languages.Hover> {
    const val = this.service.state.operators.find((item) => {
      if (
        item.pos.startLine === position.lineNumber &&
        (item.pos.startColumn <= position.column || item.pos.endColumn >= position.column)
      ) {
        return item;
      }
    });
    if (val) {
      const { pos, operator } = val;
      const tip = BuiltOperators[operator];
      return {
        range: new monaco.Range(pos.startLine, pos.startColumn, pos.endLine, pos.endColumn),
        contents: [
          {
            value: tip.title,
          },
          {
            value: tip.description,
          },
        ],
      };
    }
    return null;
  }
}
