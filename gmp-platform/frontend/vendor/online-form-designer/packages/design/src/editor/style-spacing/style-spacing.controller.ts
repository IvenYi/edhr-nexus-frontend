import { EditorController } from '@gct/runtime';
import { IStyleSpacing, IStyleSpacingController } from '../../interface';

/**
 * 边距编辑器
 * @author lingxiaoming
 * @date 2024-07-17 06:03:56
 * @export
 * @class StyleSpacingController
 * @extends {EditorController<IStyleSpacing>}
 * @implements {IStyleSpacingController}
 */
export class StyleSpacingController
  extends EditorController<IStyleSpacing>
  implements IStyleSpacingController
{
  protected override init(): void {
    super.init();
    // 写自定义的初始化逻辑
  }
}
