import {
  createGroup,
  createImage,
  createRect,
  createText,
  IGroup,
} from '@visactor/vtable/es/vrender';

/**
 * 绘制复选框图形的配置项
 *
 * @export
 * @interface ICheckboxListRenderOptions
 */
export interface ICheckboxListRenderOptions {
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
   * 复选框背景颜色
   *
   * @type {string}
   */
  boxColor?: string;
}

/**
 * 复选框列表项
 *
 * @export
 * @interface ICheckboxListItem
 */
export interface ICheckboxListItem {
  /**
   * 复选框标签
   *
   * @type {string}
   */
  label: string;
  /**
   * 复选框值
   *
   * @type {(string | number | boolean)}
   */
  value: string | number | boolean;
}

/**
 * 渲染单个复选框项图形
 *
 * @export
 * @param {ICheckboxListItem} item - 复选框项
 * @returns {*}  {IGroup}
 */
export function renderCheckboxItem(item: ICheckboxListItem): IGroup {
  const group = createGroup({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    cornerRadius: 4,
    lineWidth: 1.5,
    stroke: '#ccc',
    fill: '#eee',
  });
  if (
    item.value != null &&
    item.value !== '' &&
    (item.value == true || item.value == 1 || item.value == 'yes')
  ) {
    group.add(
      createImage({
        image:
          '<svg fill="#A6A6A6" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M418.56 822.869333a42.666667 42.666667 0 0 1-60.501333 0L115.2 578.816a42.666667 42.666667 0 0 1 0-60.074667l66.816-67.584a42.666667 42.666667 0 0 1 60.672 0L388.352 598.186667l392.96-396.970667a42.666667 42.666667 0 0 1 60.586667 0l66.986666 67.669333a42.666667 42.666667 0 0 1 0 60.074667L418.56 822.869333z"></path></svg>',
        width: 12,
        height: 12,
        fill: '#A6A6A6',
      }),
    );
  }
  return group;
}

/**
 * 渲染复选框列表图形
 *
 * @export
 * @param {ICheckboxListItem[]} items - 复选框项列表
 * @returns {*}  {IGroup}
 */
export function renderCheckboxList(items: ICheckboxListItem[]): IGroup {
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
    const checkboxItem = renderCheckboxItem(item);
    group.add(checkboxItem);
    group.add(createRect({ width: 8, stroke: 'transparent' }));
    const checkboxText = createText({
      text: item.label,
      fontSize: 16,
      lineHeight: 22,
      fill: '#1a1d23',
    });
    group.add(checkboxText);
  });
  return group;
}
