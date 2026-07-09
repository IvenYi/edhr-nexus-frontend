import { IBorder, IFont, IMargin, IPadding, IPosition } from '../interface';

/**
 * 计算配置样式
 *
 * @param data
 * @param ignoringStyle 忽略计算的样式
 * @returns
 */
export const calcStyle = (data: IData, ignoringStyle: string[] = []): any => {
  const style: any = {};
  // padding 配置
  const padding = data.padding as IPadding;
  if (padding) {
    if (padding.top != null && padding.top != '' && !ignoringStyle.includes('paddingTop'))
      style['padding-top'] = padding.top;
    if (padding.right != null && padding.right != '' && !ignoringStyle.includes('paddingRight'))
      style['padding-right'] = padding.right;
    if (padding.bottom != null && padding.bottom != '' && !ignoringStyle.includes('paddingBottom'))
      style['padding-bottom'] = padding.bottom;
    if (padding.left != null && padding.left != '' && !ignoringStyle.includes('paddingLeft'))
      style['padding-left'] = padding.left;
  }
  // margin 配置
  const margin = data.margin as IMargin;
  if (margin) {
    if (margin.top != null && margin.top != '' && !ignoringStyle.includes('marginTop'))
      style['margin-top'] = margin.top;
    if (margin.right != null && margin.right != '' && !ignoringStyle.includes('marginRight'))
      style['margin-right'] = margin.right;
    if (margin.bottom != null && margin.bottom != '' && !ignoringStyle.includes('marginBottom'))
      style['margin-bottom'] = margin.bottom;
    if (margin.left != null && margin.left != '' && !ignoringStyle.includes('marginLeft'))
      style['margin-left'] = margin.left;
  }
  // 背景颜色
  if (
    data.background != null &&
    data.background != '' &&
    !ignoringStyle.includes('backgroundColor')
  ) {
    style['background-color'] = data.background;
  }
  // 宽度
  if (data.width != null && data.width != '' && !ignoringStyle.includes('width')) {
    style.width = data.width;
  }
  // 高度
  if (data.height != null && data.height != '' && !ignoringStyle.includes('height')) {
    style.height = data.height;
    style.overflowX = 'hidden';
    style.overflowY = 'auto';
  }
  // 定位
  const position = data.position as IPosition;
  if (position) {
    if (position.position != null && position.position != '' && !ignoringStyle.includes('zIndex')) {
      style.position = position.position;
      style['z-index'] = 1;
    }
    if (position.top != null && position.top != '' && !ignoringStyle.includes('top'))
      style.top = `${position.top}px`;
    if (position.right != null && position.right != '' && !ignoringStyle.includes('right'))
      style.right = `${position.right}px`;
    if (position.bottom != null && position.bottom != '' && !ignoringStyle.includes('bottom'))
      style.bottom = `${position.bottom}px`;
    if (position.left != null && position.left != '' && !ignoringStyle.includes('left'))
      style.left = `${position.left}px`;
  }
  // 边
  const border = data.border as IBorder;
  if (border) {
    if (
      border.topLeftRadius != null &&
      border.topLeftRadius != '' &&
      !ignoringStyle.includes('borderTopLeftRadius')
    ) {
      style['border-top-left-radius'] = border.topLeftRadius;
    }
    if (
      border.topRightRadius != null &&
      border.topRightRadius != '' &&
      !ignoringStyle.includes('borderTopRightRadius')
    ) {
      style['border-top-right-radius'] = border.topRightRadius;
    }
    if (
      border.bottomLeftRadius != null &&
      border.bottomLeftRadius != '' &&
      !ignoringStyle.includes('borderBottomLeftRadius')
    ) {
      style['border-bottom-left-radius'] = border.bottomLeftRadius;
    }
    if (
      border.bottomRightRadius != null &&
      border.bottomRightRadius != '' &&
      !ignoringStyle.includes('borderBottomRightRadius')
    ) {
      style['border-bottom-right-radius'] = border.bottomRightRadius;
    }
    if (border.top) {
      if (
        border.top.color != null &&
        border.top.color != '' &&
        !ignoringStyle.includes('borderTopColor')
      ) {
        style['border-top-color'] = border.top.color;
      }
      if (
        border.top.width != null &&
        border.top.width != '' &&
        !ignoringStyle.includes('borderTopWidth')
      ) {
        style['border-top-width'] = border.top.width;
      }
      if (border.top.style && !ignoringStyle.includes('borderTopStyle')) {
        style['border-top-style'] = border.top.style;
      }
    }
    if (border.right) {
      if (
        border.right.color != null &&
        border.right.color != '' &&
        !ignoringStyle.includes('borderRightColor')
      ) {
        style['border-right-color'] = border.right.color;
      }
      if (
        border.right.width != null &&
        border.right.width != '' &&
        !ignoringStyle.includes('borderRightWidth')
      ) {
        style['border-right-width'] = border.right.width;
      }
      if (border.right.style && !ignoringStyle.includes('borderRightStyle')) {
        style['border-right-style'] = border.right.style;
      }
    }
    if (border.bottom) {
      if (
        border.bottom.color != null &&
        border.bottom.color != '' &&
        !ignoringStyle.includes('borderBottomColor')
      ) {
        style['border-bottom-color'] = border.bottom.color;
      }
      if (
        border.bottom.width != null &&
        border.bottom.width != '' &&
        !ignoringStyle.includes('borderBottomWidth')
      ) {
        style['border-bottom-width'] = border.bottom.width;
      }
      if (border.bottom.style && !ignoringStyle.includes('borderBottomStyle')) {
        style['border-bottom-style'] = border.bottom.style;
      }
    }
    if (border.left) {
      if (
        border.left.color != null &&
        border.left.color != '' &&
        !ignoringStyle.includes('borderLeftColor')
      ) {
        style['border-left-color'] = border.left.color;
      }
      if (
        border.left.width != null &&
        border.left.width != '' &&
        !ignoringStyle.includes('borderLeftWidth')
      ) {
        style['border-left-width'] = border.left.width;
      }
      if (border.left.style && !ignoringStyle.includes('borderLeftStyle')) {
        style['border-left-style'] = border.left.style;
      }
    }
  }
  if (data.border_radius) {
    style['border-radius'] = `${data.border_radius}px`;
  }
  return style;
};

/**
 * 计算字体样式
 *
 * @param data
 * @param ignoringStyle 忽略的样式
 * @returns
 */
export const calcFontStyle = (data: IData, ignoringStyle: string[] = []): any => {
  const style: any = {};
  // 字体
  const labelFont = data.labelFont as IFont;
  if (labelFont) {
    if (labelFont.color != null && labelFont.color != '' && !ignoringStyle.includes('color'))
      style.color = labelFont.color;
    if (
      labelFont.fontSize != null &&
      labelFont.fontSize != '' &&
      !ignoringStyle.includes('fontSize')
    ) {
      style['font-size'] = labelFont.fontSize;
    }
    if (labelFont.align && !ignoringStyle.includes('textAlign')) {
      style['text-align'] = labelFont.align;
      style['text-align-last'] = labelFont.align;
    }
    if (labelFont.bold === true && !ignoringStyle.includes('fontWeight')) {
      style['font-weight'] = 'bold';
    }
    if (labelFont.italic === true && !ignoringStyle.includes('fontStyle')) {
      style['font-style'] = 'italic';
    }
    if (labelFont.textDecoration && !ignoringStyle.includes('textDecoration')) {
      style['text-decoration'] = labelFont.textDecoration;
    }
  }
  return style;
};

export { LinkedList } from './linked-list/linked-list';
export { LinkedNode } from './linked-node/linked-node';
export { formatValueByTimeType } from './format-value-by-time-type/format-value-by-time-type';
export { formatFieldValue } from './format-field-value/format-field-value';
export type { FormatFieldValueOptions } from './format-field-value/format-field-value';
export { gctMemoizeAsync } from './cache-adapter/cache-adapter';
