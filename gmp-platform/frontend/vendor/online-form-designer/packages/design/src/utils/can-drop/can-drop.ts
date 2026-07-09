import { IDesignNode, IDragDataItem } from '@gct/base';
import { Store } from 'pinia';
import { intersection, union } from 'lodash-es';
import { IDesignViewActions, IDesignViewState } from '../../interface';
import { NodeRegister } from '../../register';

/**
 * 是否可以放置
 *
 * @export
 * @param {IDesignNode} node 当前节点
 * @param {Store<string, IDesignViewState, {}, IDesignViewActions>} store 设计视图 store
 * @param {IDragDataItem} item 拖拽数据
 * @returns {*}  {boolean}
 */
export function isCanCrop(
  node: IDesignNode,
  store: Store<string, IDesignViewState, {}, IDesignViewActions>,
  item: IDragDataItem,
): boolean {
  let isDrop = true;
  if (node) {
    const nodes = store.getPaths(node.id);
    // 不能放置到自己的子节点
    const i = nodes.findIndex((_) => _.id === item.id);
    if (i !== -1) {
      return false;
    }
    const providers = nodes.map((node) => {
      return NodeRegister.get(node.type, store.prefix)!;
    });
    // 取所有层级的白名单交集
    const whiteList = intersection(...providers.map((_) => _.whiteList).filter((_) => !!_));
    // 取所有层级的黑名单并集
    const blackList = union(...providers.map((_) => _.blackList).filter((_) => !!_));
    // 字符串白名单
    const strWhiteList = whiteList.filter((val) => typeof val === 'string');
    // 正则白名单
    const regWhiteList = whiteList.filter((val) => val instanceof RegExp);
    if (whiteList.length > 0) {
      // 过滤不在白名单中的类型
      const arr = item.types.filter((_) => {
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
        items = item.types.filter((_) => {
          return regWhiteList.some((reg) => reg.test(_)) || strWhiteList.includes(_);
        });
      } else {
        // 未指定白名单，所有类型均可放置
        items = item.types;
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
  }
  return isDrop;
}
