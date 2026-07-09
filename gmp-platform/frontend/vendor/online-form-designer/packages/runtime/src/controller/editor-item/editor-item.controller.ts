import { IEditorBasic, IEditorController, ICodeItem } from '../../interface';

/**
 * 编辑器控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 13:04:55
 * @export
 * @class EditorController
 * @implements {IEditorController}
 */
export class EditorController<M extends IEditorBasic = IEditorBasic>
  implements IEditorController<M>
{
  options: ICodeItem[] = [];

  constructor(public readonly model: M) {
    this.init();
  }

  protected init(): void {
    if (this.model.codeList) {
      if (this.model.codeList.mode === 'static' && this.model.codeList.items) {
        this.options = this.model.codeList.items;
      }
    } else if (this.model.codeTag) {
      const cfg = gct.codeList.getConfig(this.model.codeTag);
      if (cfg) {
        if (cfg.mode === 'static') {
          this.options = gct.codeList.get(this.model.codeTag);
        }
      }
    }
  }
}
