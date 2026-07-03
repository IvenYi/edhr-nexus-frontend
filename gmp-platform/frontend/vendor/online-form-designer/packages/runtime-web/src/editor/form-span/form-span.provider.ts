import { IEditorProvider } from '@gct/runtime';

/**
 * 纯预览编辑器
 *
 * @author zhanghanrui
 * @date 2024-03-27 10:03:03
 * @export
 * @class FormSpanProvider
 * @implements {IEditorProvider}
 */
export class FormSpanProvider implements IEditorProvider {
  component = 'form-text';
}
