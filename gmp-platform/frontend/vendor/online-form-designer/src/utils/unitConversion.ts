/**
 * 获取DPI
 * @returns {Array}
 */
export function getDPI() {
  const arrDPI = [];
  if (window.screen.deviceXDPI) {
    arrDPI[0] = window.screen.deviceXDPI;
    arrDPI[1] = window.screen.deviceYDPI;
  } else {
    const tmpNode = document.createElement('DIV');
    tmpNode.style.cssText =
      'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
    document.body.appendChild(tmpNode);
    arrDPI[0] = parseInt(tmpNode.offsetWidth);
    arrDPI[1] = parseInt(tmpNode.offsetHeight);
    tmpNode.parentNode.removeChild(tmpNode);
  }
  return arrDPI;
  // return [203, 203];
}

/**
 * px转换为mm
 * @param value
 * @param dpi
 * @returns {number}
 */
export function pxConvertMm(value, dpi) {
  // const inch = value / getDPI()[0];
  const inch = value / dpi;
  const c_value = inch * 25.4;
  return c_value;
}

/**
 * mm转换为px
 * @param value
 * @param dpi
 * @returns {number}
 */
export function mmConvertPx(value, dpi) {
  const inch = value / 25.4;
  // const c_value = inch * getDPI()[0];
  const c_value = inch * dpi;
  return c_value;
}
