import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { createImage, IGroup } from '@visactor/vtable/es/vrender';
import { BaseColumnPlugin } from '../base-column/base-column';
import qrcode from 'qrcode';
import { openVTableImageList } from '../../components';
import { ReturnTypeEnum } from '@gct/runtime';
import { suppressNextEvent } from '../../utils';

/**
 * 公式显示字段列绘制
 *
 * @export
 * @class DefaultColumnPlugin
 * @implements {IVTableColumnPlugin}
 */
export class FormulaDisplayColumnPlugin extends BaseColumnPlugin {
  /**
   * 上一次的值
   *
   * @protected
   * @type {string}
   */
  protected oldVal: string = '';

  /**
   * 二维码图片地址
   *
   * @protected
   * @type {string}
   */
  protected imgUrl: string = '';

  protected override _renderContentIn(group: IGroup, args: CustomRenderFunctionArg): void {
    if (this.widget.props.showQrCode && args.dataValue != null && args.dataValue !== '') {
      const val = args.dataValue.toString();
      const img = createImage({
        image: val === this.oldVal ? this.imgUrl : '',
        width: 32,
        height: 32,
        cornerRadius: 4,
      });
      group.add(img);
      if (val !== this.oldVal) {
        qrcode.toDataURL(val).then((url: string) => {
          this.imgUrl = url;
          this.oldVal = val;
          img.setAttribute('image', url);
        });
      }
      this._stopSelectEvent(group);
      group.addEventListener('pointerup', (e) => {
        e.stopImmediatePropagation();
        suppressNextEvent();
        openVTableImageList(e as any, [this.imgUrl]);
      });
      return;
    }
    return super._renderContentIn(group, args);
  }

  protected override _formatValue(value: any): string {
    if (this.widget.props.returnType === ReturnTypeEnum.Boolean) {
      if (value != null && value !== '') {
        const boolVal = Boolean(value);
        if (boolVal) {
          return this.widget.props.truelabel || window.$t('sys.real');
        }
        return this.widget.props.falselabel || window.$t('sys.fake');
      }
    }
    return super._formatValue(value);
  }
}
