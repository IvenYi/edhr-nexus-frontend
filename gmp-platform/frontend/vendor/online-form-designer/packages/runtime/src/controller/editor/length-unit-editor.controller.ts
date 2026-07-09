import { EditorController } from '../../controller';
import { ILengthUnitEditor, ILengthUnitEditorController } from '../../interface';

/**
 * 带单位长度字符串编辑器
 * @author lingxiaoming
 * @date 2024-07-17 06:03:56
 * @export
 * @class LengthUnitController
 * @extends {EditorController<ILengthUnitEditor>}
 * @implements {ILengthUnitEditorController}
 */
export class LengthUnitEditorController
  extends EditorController<ILengthUnitEditor>
  implements ILengthUnitEditorController
{
  protected override init(): void {
    super.init();
    // 写自定义的初始化逻辑
  }
}
