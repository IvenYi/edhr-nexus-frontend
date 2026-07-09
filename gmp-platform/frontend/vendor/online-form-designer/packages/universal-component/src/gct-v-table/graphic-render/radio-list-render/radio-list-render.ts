import { createGroup, createRect, createText, IGroup } from '@visactor/vtable/es/vrender';

/**
 * 单选框列表项
 *
 * @export
 * @interface IRadioListItem
 */
export interface IRadioListItem {
  /**
   * 单选框标签
   *
   * @type {string}
   */
  label: string;
  /**
   * 单选框值
   *
   * @type {(string | number | boolean)}
   */
  value: string | number | boolean;
  /**
   * 是否禁用
   *
   * @type {boolean}
   */
  disabled?: boolean;
}

/**
 * 绘制单个单选框项图形
 *
 * @export
 * @param {IRadioListItem} item
 * @returns {*}  {IGroup}
 */
export function renderRadioItem(item: IRadioListItem): IGroup {
  const group = createGroup({
    width: 20,
    height: 20,
    cornerRadius: 100,
    lineWidth: 1.5,
    stroke: '#ccc',
    fill: '#eee',
  });
  if (item.value != null && item.value != '') {
    group.add(
      createGroup({
        width: 8,
        height: 8,
        cornerRadius: 100,
        fill: '#A6A6A6',
        x: 6.5,
        y: 6.5,
      }),
    );
  }
  return group;
}

/**
 * 渲染单选框列表图形
 *
 * @export
 * @returns {*}  {IGroup}
 */
export function renderRadioList(items: IRadioListItem[]): IGroup {
  const group = createGroup({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    stroke: 'transparent',
  });
  items.forEach((item, index) => {
    if (index > 0) {
      group.add(createRect({ width: 12, stroke: 'transparent' }));
    }
    const radioItem = renderRadioItem(item);
    group.add(radioItem);
    group.add(createRect({ width: 8, stroke: 'transparent' }));
    const radioText = createText({
      text: item.label,
      fontSize: 16,
      lineHeight: 22,
      fill: '#1a1d23',
    });
    group.add(radioText);
  });
  return group;
}
