/* eslint-disable no-useless-escape */

import { FUNC_KEYS } from '../../../constant/FunctionKeys';

/**
 * 公式自定义语言定义
 *
 * @export
 * @class CustomLanguageMonarchTokensProvider
 * @implements {monaco.languages.IMonarchLanguage}
 */
export class CustomLanguageMonarchTokensProvider implements monaco.languages.IMonarchLanguage {
  keywords = FUNC_KEYS;

  symbols = /[=><!~?:&|+\-*\/\^%]+/;

  operators = ['+', '-', '*', '/', '%', '>', '>=', '<', '<=', '==', '!=', '&&', '||', '!', '?'];

  tokenizer: any = {
    root: [
      // 标识符
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@keywords': 'function',
            '@default': 'variable',
          },
        },
      ],
      [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
      [/[()]/, 'bracket'],
      [/[+\-*/%<>!=&|!?]+/, 'symbol'],
      [/\u200b/, 'variable'],
    ],
  };
}
