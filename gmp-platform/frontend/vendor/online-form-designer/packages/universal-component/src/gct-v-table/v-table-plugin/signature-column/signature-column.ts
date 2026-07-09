import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { createGroup, createImage, IGroup, IImage } from '@visactor/vtable/es/vrender';
import { BaseColumnPlugin } from '../base-column/base-column';
import { openVTableSignatureList } from '../../components';
import { createSignatureImage, suppressNextEvent } from '../../utils';

/**
 * 签名字段绘制支持
 *
 * @export
 * @class SignatureColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class SignatureColumnPlugin extends BaseColumnPlugin {
  protected _renderImage(args: CustomRenderFunctionArg, data: IObject): IImage {
    const image = createImage({
      image: createSignatureImage(data),
      width: 32,
      height: 32,
      cornerRadius: 4,
      cursor: 'pointer',
      boundsPadding: [0, 4, 0, 4],
    });
    return image;
  }

  /**
   * 绘制单元格实际内容
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {*}  {IGroup}
   */
  protected override _renderContent(args: CustomRenderFunctionArg): IGroup {
    let list: IObject[] = [];
    if (args.dataValue) {
      try {
        list = JSON.parse(args.dataValue);
      } catch (error) {
        console.error('signature column render error', error);
      }
    }
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      height: this._rowHeight,
      cursor: this._isDisabled ? 'default' : 'pointer',
    });
    if (list.length === 0) {
      group.add(this._renderText(args, ''));
    } else {
      if (!this._isDisabled) {
        this._stopSelectEvent(group);
        group.addEventListener('pointerup', (e) => {
          e.stopImmediatePropagation();
          suppressNextEvent();
          openVTableSignatureList(e as any, this.column, list);
        });
      }

      // 根据列宽计算可以显示的签名图片数量
      // 每个签名图片宽度 32 + 左右 padding 各 4 = 40
      // 如果有"更多"文字，预留约 48 的宽度
      const imageWidth = 40;
      const moreTextWidth = 12;
      const availableWidth = this._rowContentWidth;

      // 计算最多可以显示多少个签名图片
      let displayMaxNum = Math.floor(availableWidth / imageWidth);

      // 如果数据量超过可显示数量，需要预留"..."文字的空间
      if (list.length > displayMaxNum) {
        displayMaxNum = Math.floor((availableWidth - moreTextWidth) / imageWidth);
      }

      const displayList = list.slice(0, displayMaxNum);
      displayList.forEach((data: IObject) => {
        const img = this._renderImage(args, data);
        group.add(img);
      });
      if (list.length > displayMaxNum) {
        const text = this._renderTextTipByWidth(args, '...', undefined, { ellipsis: false });
        group.add(text);
      }
    }
    return group;
  }
}
