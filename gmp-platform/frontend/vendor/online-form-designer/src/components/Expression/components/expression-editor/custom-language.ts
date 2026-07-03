import type * as Monaco from 'monaco-editor';
import { CUSTOM_LANGUAGE } from '../../constant/editor';
import {
  CustomLanguageMonarchTokensProvider,
  // DocumentSemanticTokensProvider,
  OperatorCompletionItemProvider,
  OperatorHoverProvider,
} from './providers';
import { ExpressionLanguageService } from '../../service';

/**
 * 安装自定义语言
 *
 * @export
 */
export function installCustomLanguage(monaco: typeof Monaco, service: ExpressionLanguageService): void {
  // 注册自定义语言
  monaco.languages.register({ id: CUSTOM_LANGUAGE });
  // 设置语言解析规则
  monaco.languages.setMonarchTokensProvider(
    CUSTOM_LANGUAGE,
    new CustomLanguageMonarchTokensProvider(),
  );
  // monaco.languages.registerDocumentSemanticTokensProvider(
  //   CUSTOM_LANGUAGE,
  //   new DocumentSemanticTokensProvider(service),
  // );
  // 设置语言配置
  monaco.languages.setLanguageConfiguration(CUSTOM_LANGUAGE, {
    autoClosingPairs: [
      {
        open: '(',
        close: ')',
      },
      {
        open: '"',
        close: '"',
      },
      {
        open: "'",
        close: "'",
      },
    ],
  });
  // 注册 hover
  monaco.languages.registerHoverProvider(CUSTOM_LANGUAGE, new OperatorHoverProvider(service));
  // 注册自动填充
  monaco.languages.registerCompletionItemProvider(
    CUSTOM_LANGUAGE,
    new OperatorCompletionItemProvider(service),
  );
}
