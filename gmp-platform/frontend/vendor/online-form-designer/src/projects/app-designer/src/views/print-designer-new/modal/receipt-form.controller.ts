import { EditFormController, IFormEditItemController } from '@gct/runtime';

/**
 * 单据表单
 *
 * @author zhanghanrui
 * @date 2024-04-02 13:04:44
 * @export
 * @class ReceiptFormController
 * @extends {EditFormController}
 */
export class ReceiptFormController extends EditFormController {
  protected override initEvent(): void {
    super.initEvent();
    this.evt.on('change', (key, _value) => {
      switch (key) {
        case 'paperSize':
          this.pageSizeChange();
          break;
        case 'name':
          if (_value == '1') {
            this.item.group_2.state.visible = false;
          } else {
            this.item.group_2.state.visible = true;
          }
          break;
        default:
          break;
      }
    });
  }

  protected override calcState(): void {
    super.calcState();
    this.pageSizeChange();
  }

  protected pageSizeChange(): void {
    const paperSize = this.item.paperSize as IFormEditItemController;
    const height = this.item.height as IFormEditItemController;
    const width = this.item.width as IFormEditItemController;
    let value: string = '';
    switch (paperSize.value) {
      case 'A3':
        value = '297_420';
        break;
      case 'A4':
        value = '210_297';
        break;
      case 'A5':
        value = '148_210';
        break;
      default:
        value = 'CUSTOM';
        break;
    }
    if (this.context.id) {
      height.state.disabled = true;
      width.state.disabled = true;
    } else {
      if (value === 'CUSTOM' || !value) {
        height.state.disabled = false;
        width.state.disabled = false;
        height.value = '';
        width.value = '';
      }
      if (value && value.indexOf('_') !== -1) {
        const [longValue, widthValue] = value.split('_');
        height.state.disabled = true;
        width.state.disabled = true;
        height.value = Number.parseInt(longValue, 10);
        width.value = Number.parseInt(widthValue, 10);
      }
    }
  }
}
