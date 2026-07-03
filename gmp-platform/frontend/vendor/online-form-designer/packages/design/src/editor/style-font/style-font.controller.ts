import { EditorController } from '@gct/runtime';
import { IStyleFont, IStyleFontController } from '../../interface';

/**
 * 文本样式编辑器
 * @author lingxiaoming
 * @date 2024-07-17 06:03:56
 * @export
 * @class StyleFontController
 * @extends {EditorController<IStyleFont>}
 * @implements {IStyleFontController}
 */
export class StyleFontController
  extends EditorController<IStyleFont>
  implements IStyleFontController
{
  protected override init(): void {
    super.init();
    // 写自定义的初始化逻辑
  }
}
