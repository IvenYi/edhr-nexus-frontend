import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import {
  createGroup,
  createText,
  IGraphic,
  IText,
  ITextGraphicAttribute,
} from '@visactor/vtable/es/vrender';
import { colord } from 'colord';
import { measureText } from '@gct/runtime';
import { BaseColumnPlugin, type IRenderTextConfig } from '../base-column/base-column';

export class RdoModelSelectColumnPlugin extends BaseColumnPlugin {
  protected override _formatValue(value: any): string {
    const cfg = this.row._DICT![this.column.name];
    if (!cfg) {
      return '';
    }
    return cfg[value] || value;
  }

  protected override _renderTextTipByWidth(
    args: CustomRenderFunctionArg,
    val?: string,
    opts?: Partial<ITextGraphicAttribute>,
    cfg: IRenderTextConfig = {},
  ): IText {
    // 有默认版的情况下，需要修正自动计算省略号宽度
    if (args.dataValue && args.dataValue !== '' && args.dataValue.indexOf(':') === -1) {
      const extraWidth =
        measureText('默认', {
          fontFamily: this._fontFamily,
          fontSize: this._fontSize,
        }) +
        12 +
        8; // 12 是默认版标签的内边距，8 是标签和文本的间距
      return super._renderTextTipByWidth(args, val, opts, {
        extraWidth: -extraWidth,
        ...cfg,
      });
    }
    return super._renderTextTipByWidth(args, val, opts, cfg);
  }

  protected override _renderSuffix(args: CustomRenderFunctionArg): IGraphic | null {
    // 有值并且没有选择版本，则显示默认版本样式
    if (args.dataValue && args.dataValue !== '' && args.dataValue.indexOf(':') === -1) {
      const group = createGroup({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cornerRadius: 4,
        fill: colord(this._primaryColor).alpha(0.1).toRgbString(),
        boundsPadding: [0, 0, 0, 8],
      });
      const text = createText({
        text: '默认',
        fontSize: this._fontSize,
        fill: this._primaryColor,
        lineHeight: this._lineHeight,
        boundsPadding: [3, 6],
      });
      group.add(text);
      return group;
    }
    return null;
  }
}
