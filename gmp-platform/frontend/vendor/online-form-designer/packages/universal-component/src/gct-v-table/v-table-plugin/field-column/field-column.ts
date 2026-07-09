import { createGroup, createImage, IGroup } from '@visactor/vtable/es/vrender';
import { BaseColumnPlugin } from '../base-column/base-column';
import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { openVTableFileList } from '../../components';
import { suppressNextEvent } from '../../utils';

/**
 * 文件类型的列绘制插件
 *
 * @export
 * @class FieldColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class FieldColumnPlugin extends BaseColumnPlugin {
  private get _minioPath(): string {
    return gct.env.MINIO_PATH;
  }

  /**
   * 绘制单元格实际内容
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {*}  {IGroup}
   */
  protected override _renderContent(args: CustomRenderFunctionArg): IGroup {
    const value: string = args.dataValue ?? '';
    const list = value.split(',').filter((item) => item);
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      height: this._rowHeight,
      cursor: 'pointer',
    });
    if (list.length === 0) {
      group.add(this._renderText(args, ''));
    } else if (list.length > 0) {
      const iconImg = createImage({
        image: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="${this._primaryColor}" d="M648.476444 340.707556l-253.155555 253.155555a44.714667 44.714667 0 1 0 63.317333 63.203556l253.155556-253.098667a134.257778 134.257778 0 0 0-189.895111-189.838222l-253.155556 253.155555a223.744 223.744 0 0 0 316.472889 316.359111l253.098667-253.155555 63.260444 63.317333-253.155555 253.155556A313.230222 313.230222 0 0 1 205.596444 403.911111l253.098667-253.155555a223.744 223.744 0 1 1 316.416 316.416l-253.155555 253.155555a134.257778 134.257778 0 0 1-189.838223-189.838222l253.155556-253.155556 63.260444 63.317334z"></path></svg>`,
        width: 16,
        height: 16,
        boundsPadding: [0, 8, 0, 8],
        cursor: 'pointer',
      });
      group.add(iconImg);
      const text = this._renderTextTipByWidth(args, `${list.length} 个文件`, undefined, {
        ellipsis: false,
      });
      text.setAttributes({
        cursor: 'pointer',
      });
      group.add(text);
      this._stopSelectEvent(text);
      text.addEventListener('pointerup', (e) => {
        e.stopImmediatePropagation();
        suppressNextEvent();
        openVTableFileList(
          e as any,
          list.map((url) => `${this._minioPath}${url}`),
        );
      });
    }
    return group;
  }
}
