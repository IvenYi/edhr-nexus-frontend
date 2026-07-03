import type * as Monaco from 'monaco-editor';
import { CUSTOM_THEME } from '../../constant/editor';

/**
 * 自定义主题
 *
 * @export
 */
export function installCustomTheme(monaco: typeof Monaco): void {
  monaco.editor.defineTheme(CUSTOM_THEME, {
    base: 'vs',
    inherit: false,
    rules: [
      { token: 'function', foreground: '#006699', fontStyle: 'bold' },
      { token: 'symbol', foreground: '#006699', fontStyle: 'bold' },
      { token: 'operator', foreground: '#0431fa', fontStyle: 'bold' },
      { token: 'bracket', foreground: '#0431fa', fontStyle: 'bold' },
      { token: 'string', foreground: '#a31515', fontStyle: 'bold' },
    ],
    colors: {},
  });
}
