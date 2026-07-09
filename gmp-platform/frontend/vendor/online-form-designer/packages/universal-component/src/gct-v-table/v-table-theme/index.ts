import { themes } from '@visactor/vtable';
import { colord } from 'colord';

/**
 * 自定义主题
 *
 * @export
 * @param {HTMLDivElement} dom 表格容器元素
 * @returns {*}
 */
export function getCustomTableTheme(dom: HTMLDivElement) {
  const style = getComputedStyle(dom);
  const _primaryColor = style.getPropertyValue('--gct-color-primary');
  return themes.DEFAULT.extends({
    // 表格框架样式
    frameStyle: {
      // borderLineWidth: 0,
    },
    // 表身样式
    bodyStyle: {
      borderLineWidth: [1, 0],
      bgColor: '#FFFFFF',
    },
    // 列表头样式
    headerStyle: {
      fontSize: 16,
      fontWeight: 400,
      color: '#1A1D23',
      bgColor: '#F6F8FA',
      borderLineWidth: 0,
    },
    selectionStyle: {
      cellBorderLineWidth: 0,
      cellBgColor: colord(_primaryColor).alpha(0.1).toRgbString(),
    },
    dragHeaderSplitLine: {
      lineColor: _primaryColor, // 指示线的颜色
      lineWidth: 2, // 指示线的线宽（默认2）
    },
    // 画布空白区域颜色
    // underlayBackgroundColor: '#F6F8FA',
  });
}
