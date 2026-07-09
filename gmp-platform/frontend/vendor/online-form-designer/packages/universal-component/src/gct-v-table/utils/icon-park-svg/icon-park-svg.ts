import { iconParkSvg } from './icon-park-svg-map';

let iconsDom: HTMLElement | null = null;

/**
 * 根据名称获取 icon park svg 或者平台图标内容
 */
export function getIconParkSvg(name: string, color?: string): string {
  if (!name) {
    return '';
  }
  if (name.startsWith('icon-park:')) {
    name = name.replace('icon-park:', '');
  }
  if (name.startsWith('icon-platform:')) {
    name = name.replace('icon-platform:', '');
    if (!iconsDom) {
      iconsDom = document.getElementById('__svg__icons__dom__');
    }
    const iconDom = iconsDom?.querySelector(`#icon-${name}`);
    if (iconDom) {
      // 平台图标的颜色都是写死的，color 参数不生效
      const svg = `<svg fill="${iconDom.getAttribute('fill')}" viewBox="${iconDom.getAttribute(
        'viewBox',
      )}" xmlns="http://www.w3.org/2000/svg" xmlns:link="http://www.w3.org/1999/xlink">${
        iconDom.innerHTML
      }</svg>`;
      return svg;
    }
    return '';
  }
  const svg = iconParkSvg[name] || '';
  if (svg && color) {
    // svg 标签补充 color 参数
    return svg.replace(/<svg /, `<svg color="${color}" `);
  }
  return svg;
}
