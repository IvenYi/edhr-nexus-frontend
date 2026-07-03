import { isEmpty } from 'lodash-es';
import { IBorder, IBorderItem } from '@gct/base';
import { BorderStyle } from '@gct/runtime';

export type PosType = 'borderAll' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
export type RadiusPosType = 'all' | 'upLeft' | 'upRight' | 'downRight' | 'downLeft';

export type BoxValue = Pick<IBorder, 'top' | 'bottom' | 'left' | 'right'>;
export type BorderRadiusValue = Pick<
  IBorder,
  'topRightRadius' | 'topLeftRadius' | 'bottomRightRadius' | 'bottomLeftRadius'
>;

/**
 * 解析数值和单位
 * @author lingxiaoming
 * @date 2024-07-15 06:06:41
 * @param {string} str
 * @return {*}  {({ value: number; unit: string } | null)}
 */
export function parseValueUnit(str: string): { value: number; unit: string } {
  if (str === 'nullpx') {
    return {
      value: 0,
      unit: 'px',
    };
  }
  // 使用正则表达式解析数值和单位
  const regex = /^(\d+\.?\d*)([a-zA-Z%]+)$/;
  const match = str.match(regex);

  // 如果匹配成功，则返回解析后的结果
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2],
    };
  }

  // 如果匹配失败，则返回 null
  throw new Error('Invalid value');
}

export function parsePos(border?: IBorder): PosType {
  if (isEmpty(border)) {
    return 'borderAll';
  }
  if (border.bottom && border.left && border.right && border.top) {
    return 'borderAll';
  } else if (border.top) {
    return 'borderTop';
  } else if (border.right) {
    return 'borderRight';
  } else if (border.bottom) {
    return 'borderBottom';
  } else {
    return 'borderLeft';
  }
}

export function parseBorderItem(pos: PosType, border?: IBorder): IBorderItem | undefined {
  if (isEmpty(border) || border == null) {
    return {
      style: BorderStyle.NONE,
      color: '#F0F0F0',
      width: '1px',
    };
  }
  switch (pos) {
    case 'borderAll':
      return border.top;
    case 'borderTop':
      return border.top;
    case 'borderRight':
      return border.right;
    case 'borderBottom':
      return border.bottom;
    case 'borderLeft':
      return border.left;
    default:
      return undefined;
  }
}

export function parseRadiusType(border?: IBorder): RadiusPosType {
  if (isEmpty(border)) {
    return 'all';
  }
  if (
    border.topRightRadius &&
    border.topLeftRadius &&
    border.bottomLeftRadius &&
    border.bottomRightRadius
  ) {
    return 'all';
  } else if (border.topLeftRadius) {
    return 'upLeft';
  } else if (border.topRightRadius) {
    return 'upRight';
  } else if (border.bottomLeftRadius) {
    return 'downLeft';
  } else {
    return 'downRight';
  }
}
