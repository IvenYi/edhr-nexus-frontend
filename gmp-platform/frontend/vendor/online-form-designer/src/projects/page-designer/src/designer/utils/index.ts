import { intersection } from 'lodash-es';
import { FormComponents, LowCodeWidget } from '@gct/runtime';
import { IDragDataItem, IVue3DndItemOptions } from '../interface';
import { DESIGN_TYPE } from '../../constant';

/**
 * 是否允许放置
 *
 * @export
 * @param {IVue3DndItemOptions} config
 * @param {LowCodeWidget.BasicSchema[]} parentWidgets
 * @param {IDragDataItem<LowCodeWidget.BasicSchema>} item
 * @param {any[]} whiteList
 * @param {any[]} blackList
 * @returns {*}  {boolean}
 */
export function canDrop(
  config: IVue3DndItemOptions,
  parentWidgets: LowCodeWidget.BasicSchema[],
  item: IDragDataItem<LowCodeWidget.BasicSchema>,
  whiteList: any[],
  blackList: any[],
): boolean {
  const dragType = config.type ?? DESIGN_TYPE;

  if (dragType !== item.dragType) {
    return false;
  }

  const i = parentWidgets.findIndex((i) => i.id === item.id);
  if (i !== -1) {
    return false;
  }

  let isDrop: boolean = true;

  const { types, data } = item;
  const strWhiteList = whiteList.filter((val) => typeof val === 'string');
  const regWhiteList = whiteList.filter((val) => val instanceof RegExp);
  if (whiteList.length > 0) {
    // 过滤不在白名单中的类型
    const arr = types.filter((_) => {
      return regWhiteList.some((reg) => !reg.test(_)) && !strWhiteList.includes(_);
    });
    // 只要有差异，则超过白名单范围不可放入
    if (arr.length > 0) {
      isDrop = false;
    }
  }
  if (isDrop === true && blackList.length > 0) {
    let items: string[] = [];
    // 如果存在白名单中，则先过滤出白名单内容，再和黑名单进行对比
    if (whiteList.length > 0) {
      // 在白名单中的可放置类型
      items = types.filter((_) => {
        return regWhiteList.some((reg) => reg.test(_)) || strWhiteList.includes(_);
      });
    } else {
      // 未指定白名单，所有类型均可放置
      items = types;
    }
    const strBlackList = blackList.filter((val) => typeof val === 'string');
    const regBlackList = blackList.filter((val) => val instanceof RegExp);
    // 在黑名单正则中的类型
    const blacks = items.filter((_) => {
      return regBlackList.some((reg) => reg.test(_));
    });
    // 计算黑名单和可放置子组件类型的交集
    const arr = intersection(strBlackList, items);
    // 只要有交集，则在黑名单范围不可放入
    if (arr.length > 0 || blacks.length > 0) {
      isDrop = false;
    }
  }
  if (data.formItem) {
    const formWidget = parentWidgets.findLast((_) => {
      return (
        _.type === FormComponents.Form ||
        _.type === FormComponents.RdoForm ||
        _.type === FormComponents.MedProRdoForm ||
        _.type === FormComponents.CardList ||
        _.type === FormComponents.Descriptions ||
        _.type === FormComponents.FormProcess
      );
    });
    if (!formWidget) {
      return false;
    }
    if (item.data.preLocation && item.data.preLocation !== formWidget.id) {
      return false;
    }
  }
  return isDrop;
}
