import { mmConvertPx, pxConvertMm } from '/@/utils/unitConversion';

export const sizeOpt = [
  {
    value: 1,
    width: 76,
    height: 50,
    label: '76mm * 50mm',
  },
  {
    value: 2,
    width: 220,
    height: 110,
    label: '220mm * 110mm',
  },
  {
    value: 3,
    width: 170,
    height: 125,
    label: '170mm * 125mm',
  },
  {
    value: 4,
    width: 130,
    height: 240,
    label: '130mm * 240mm',
  },
  {
    value: 5,
    width: 230,
    height: 240,
    label: '230mm * 240mm',
  },
  {
    value: 6,
    width: 324,
    height: 229,
    label: '324mm * 229mm',
  },
  {
    value: 7,
    width: undefined,
    height: undefined,
    label: '自定义',
  },
];

export function getSpecificationsForSize(value: ArrayType<typeof sizeOpt>['value'], dpi: number) {
  const { width, height } = sizeOpt.find((i) => i.value === value);
  if (!width || !height)
    return { width: undefined, height: undefined, strWidth: '', strHeight: '' };
  const strWidth = parseInt(mmConvertPx(width, dpi)) + 'px';
  const strHeight = parseInt(mmConvertPx(height, dpi)) + 'px';
  return { width, height, strWidth, strHeight };
}

export function transformsize(n: number, dpi: number) {
  return parseInt(mmConvertPx(n, dpi)) + 'px';
}

/**根据dip转化 */
export function transformCoordinateByDpi(n: number, olddpi: number, newdpi: number) {
  const mm = pxConvertMm(n, olddpi);
  return parseInt(mmConvertPx(mm, newdpi));
}
