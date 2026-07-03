import { createGroup, IGroup } from '@visactor/vtable/es/vrender';
import { colord } from 'colord';

/**
 * 绘制开关图形的配置项
 *
 * @export
 * @interface ISwitchRenderOptions
 */
export interface ISwitchRenderOptions {
  /**
   * 选中颜色
   *
   * @type {string}
   */
  checkColor?: string;
  /**
   * 未选中颜色
   *
   * @type {string}
   */
  uncheckColor?: string;
  /**
   * 开关圆圈颜色
   *
   * @type {string}
   */
  circleColor?: string;
}

/**
 * 开关图形渲染
 *
 * @export
 * @param {string} val true/false、1/0、yes/no 等表示开关状态的值
 * @return {*}  {IGroup} 图形组件
 */
export function renderSwitch(
  val: string | number | boolean,
  opts: ISwitchRenderOptions = {},
): IGroup {
  let isCheck: boolean = false;
  if (typeof val === 'string') {
    const lowerVal = val.toLowerCase();
    isCheck = lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes';
  } else if (typeof val === 'number') {
    isCheck = val === 1;
  } else if (typeof val === 'boolean') {
    isCheck = val;
  }
  const group: IGroup = createGroup({
    width: 44,
    height: 26,
    cornerRadius: 100,
    fill: isCheck
      ? opts.checkColor || '#4CAF50'
      : opts.uncheckColor || colord('#E0E3EB').alpha(0.5).toRgbString(),
  });
  const circle: IGroup = createGroup({
    width: 22,
    height: 22,
    x: isCheck ? 20 : 2,
    y: 2,
    cornerRadius: 100,
    fill: '#fff',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 2,
    shadowOffsetX: 0,
    shadowOffsetY: 1,
  });

  group.add(circle);

  return group;
}
