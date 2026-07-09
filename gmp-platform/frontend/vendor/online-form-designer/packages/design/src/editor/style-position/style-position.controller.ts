import { EditorController } from '@gct/runtime';
import { IStylePosition, IStylePositionController } from '../../interface';

/**
 * 定位编辑器
 * @author lingxiaoming
 * @date 2024-07-17 06:03:56
 * @export
 * @class StylePositionController
 * @extends {EditorController<IStylePosition>}
 * @implements {IStylePositionController}
 */
export class StylePositionController
  extends EditorController<IStylePosition>
  implements IStylePositionController
{
  protected override init(): void {
    super.init();
    // 写自定义的初始化逻辑
  }
}
