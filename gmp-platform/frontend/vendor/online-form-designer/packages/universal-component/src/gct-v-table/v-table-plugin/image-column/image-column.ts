import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { BaseColumnPlugin } from '../base-column/base-column';
import { createGroup, createImage, IGroup, IImage } from '@visactor/vtable/es/vrender';
import { openVTableImageList } from '../../components';
import { suppressNextEvent } from '../../utils';

/**
 * 图片类型的列绘制插件
 *
 * @export
 * @class ImageColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class ImageColumnPlugin extends BaseColumnPlugin {
  private get _minioPath(): string {
    return gct.env.MINIO_PATH;
  }

  protected _renderImage(args: CustomRenderFunctionArg, url: string): IImage {
    const image = createImage({
      image: `${this._minioPath}${url}`,
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
    const { displayMaxNum = 5 } = this.widget.props;
    const value: string = args.dataValue ?? '';
    const list = value.split(',').filter((item) => item);
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
          openVTableImageList(
            e as any,
            list.map((url) => `${this._minioPath}${url}`),
          );
        });
      }
      const displayList = list.slice(0, displayMaxNum);
      displayList.forEach((url: string) => {
        const img = this._renderImage(args, url);
        group.add(img);
      });
      if (list.length > displayMaxNum) {
        const text = this._renderTextTipByWidth(
          args,
          '更多',
          { fill: this._primaryColor },
          { ellipsis: false },
        );
        text.setAttributes({
          cursor: this._isDisabled ? 'default' : 'pointer',
        });
        group.add(text);
      }
    }
    return group;
  }
}
