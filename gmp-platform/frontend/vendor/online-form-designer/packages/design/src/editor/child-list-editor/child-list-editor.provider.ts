import { IEditorProvider } from '@gct/runtime';

/**
 * 子项编辑器
 *
 * @author zhanghanrui
 * @date 2024-07-29 14:07:02
 * @export
 * @class ChildListEditorProvider
 * @implements {IEditorProvider}
 */
export class ChildListEditorProvider implements IEditorProvider {
  component = 'child-list-editor';
}
