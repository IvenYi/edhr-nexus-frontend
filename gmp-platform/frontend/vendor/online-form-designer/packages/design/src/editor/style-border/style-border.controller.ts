import { EditorController } from '@gct/runtime';
import { IStyleBorder, IStyleBorderController } from '../../interface';

/**
 * 边框编辑器
 * @author lingxiaoming
 * @date 2024-07-17 06:03:56
 * @export
 * @class StyleBorderController
 * @extends {EditorController<IStyleBorder>}
 * @implements {IStyleBorderController}
 */
export class StyleBorderController
  extends EditorController<IStyleBorder>
  implements IStyleBorderController
{
  protected override init(): void {
    super.init();
    // 写自定义的初始化逻辑
  }
}
