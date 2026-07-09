import { EditorController } from '../../controller';
import { IColorEditor, IColorEditorController } from '../../interface';

/**
 * 颜色选择编辑器
 * @author lingxiaoming
 * @date 2024-07-17 06:03:56
 * @export
 * @class ColorController
 * @extends {EditorController<IColorEditor>}
 * @implements {IColorEditorController}
 */
export class ColorEditorController
  extends EditorController<IColorEditor>
  implements IColorEditorController
{
  protected override init(): void {
    super.init();
    // 写自定义的初始化逻辑
  }
}
