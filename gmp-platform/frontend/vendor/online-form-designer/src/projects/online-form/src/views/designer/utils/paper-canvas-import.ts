import { cloneDeep } from 'lodash-es';
import { CanvasMode, type ICellStyle, type IPaper } from '../types';
import { DefaultPaper } from '../constants';
import type { PaperWidget } from '/@online-form/views/types/paper-widget';

const DEFAULT_TEXT_WIDTH = 160;
const DEFAULT_TEXT_HEIGHT = 28;
const PaperWidgeType = {
  Text: 'text',
  Image: 'image',
} as const;
const PaperWidgeValueType = {
  Fixed: 'fixed',
} as const;
const WidgetImageSizeMode = {
  RESPONSIVE: 'responsive',
} as const;

export class PaperCanvasImport {
  static fromSheetPaper(source: IPaper): IPaper {
    const result: IPaper = {
      ...cloneDeep(DefaultPaper),
      ...cloneDeep(source),
      canvasMode: CanvasMode.Paper,
      paperWidgets: [
        ...PaperCanvasImport._cellsToTextWidgets(source),
        ...PaperCanvasImport._imagesToImageWidgets(source),
      ],
    };

    result.images = [];
    return result;
  }

  static _cellsToTextWidgets(source: IPaper): PaperWidget.Text[] {
    const colLefts = PaperCanvasImport._offsets(source.cols.map((col) => col.width));
    const rowTops = PaperCanvasImport._offsets(source.rows.map((row) => row.height));

    return source.cells.flatMap((row, rowIndex) =>
      row.flatMap((cell, colIndex) => {
        const value = String(cell?.value ?? '').trim();
        if (!value) return [];

        const mergedCell = source.mergedCells.find(
          (item) =>
            item.t <= rowIndex + 1 &&
            item.b >= rowIndex + 1 &&
            item.l <= colIndex + 1 &&
            item.r >= colIndex + 1,
        );
        if (mergedCell && (mergedCell.t !== rowIndex + 1 || mergedCell.l !== colIndex + 1)) {
          return [];
        }

        const left = colLefts[colIndex] ?? 0;
        const top = rowTops[rowIndex] ?? 0;
        const width = mergedCell
          ? PaperCanvasImport._sumRange(source.cols, mergedCell.l - 1, mergedCell.r, 'width')
          : (source.cols[colIndex]?.width ?? DEFAULT_TEXT_WIDTH);
        const height = mergedCell
          ? PaperCanvasImport._sumRange(source.rows, mergedCell.t - 1, mergedCell.b, 'height')
          : (source.rows[rowIndex]?.height ?? DEFAULT_TEXT_HEIGHT);

        return [
          PaperCanvasImport._textWidget({
            id: `word-text-${rowIndex + 1}-${colIndex + 1}`,
            value,
            layout: {
              left,
              top,
              width: Math.max(DEFAULT_TEXT_WIDTH, width),
              height: Math.max(DEFAULT_TEXT_HEIGHT, height),
            },
            style: cell.style,
          }),
        ];
      }),
    );
  }

  static _imagesToImageWidgets(source: IPaper): PaperWidget.Image[] {
    return (source.images ?? []).flatMap((image, index) => {
      const media = source.medias?.find((item) => item.id === image.mediaId);
      if (!media?.src) return [];
      return [
        {
          id: image.id || `word-image-widget-${index}`,
          icon: 'icon-tupian_wudaima',
          type: PaperWidgeType.Image,
          name: '图片',
          value: media.src,
          sort: 200,
          resizable: true,
          dragToPos: [],
          sizeMode: WidgetImageSizeMode.RESPONSIVE,
          layout: {
            left: image.layout.left,
            top: image.layout.top,
            width: image.layout.width,
            height: image.layout.height,
          },
        },
      ];
    });
  }

  static _textWidget(params: {
    id: string;
    value: string;
    layout: Required<PaperWidget.BasicSchema['layout']>;
    style?: ICellStyle;
  }): PaperWidget.Text {
    return {
      id: params.id,
      icon: 'icon-wenben1',
      type: PaperWidgeType.Text,
      name: '文本',
      value: params.value,
      sort: 100,
      resizable: true,
      dragToPos: [],
      valueType: PaperWidgeValueType.Fixed,
      layout: params.layout,
      styles: PaperCanvasImport._textStyles(params.style),
    };
  }

  static _textStyles(style: ICellStyle = {}): PaperWidget.Text['styles'] {
    return {
      fontFamily: String(style['font-family'] ?? ''),
      fontSize: PaperCanvasImport._parsePx(style['font-size'], 14),
      color: String(style.color ?? '#000000'),
      fontWeight: style['font-weight'] ? String(style['font-weight']) : undefined,
      fontStyle: style['font-style'] ? String(style['font-style']) : undefined,
      textDecoration: style['text-decoration'] ? String(style['text-decoration']) : undefined,
      alignItems: PaperCanvasImport._verticalAlignToFlex(style['vertical-align']),
      justifyContent: PaperCanvasImport._textAlignToFlex(style['text-align']),
    };
  }

  static _offsets(values: number[]) {
    const result: number[] = [];
    values.reduce((total, value, index) => {
      result[index] = total;
      return total + value;
    }, 0);
    return result;
  }

  static _sumRange<T extends Record<string, number>>(
    items: T[],
    start: number,
    end: number,
    key: keyof T,
  ) {
    return items.slice(start, end).reduce((total, item) => total + Number(item[key] ?? 0), 0);
  }

  static _parsePx(value: ICellStyle[string], fallback: number) {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value ?? ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  static _textAlignToFlex(value: ICellStyle[string]) {
    if (value === 'center') return 'center';
    if (value === 'right') return 'flex-end';
    return 'flex-start';
  }

  static _verticalAlignToFlex(value: ICellStyle[string]) {
    if (value === 'middle' || value === 'center') return 'center';
    if (value === 'bottom') return 'flex-end';
    return 'flex-start';
  }
}
