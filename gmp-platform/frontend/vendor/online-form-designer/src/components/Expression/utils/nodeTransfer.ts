import { cloneDeep } from 'lodash-es';
import {
  ExpressionTabEnum,
  IdentifierGroupInterface,
  IdentifierItemInterface,
} from '../types/index';

function getIdToChildren(level0, tab) {
  if (!level0) {
    return false;
  }
  return [undefined, true].includes(level0.idToChildren) && [ExpressionTabEnum.FIELD].includes(tab);
}

function deepFillChildren(
  groups: IdentifierGroupInterface[],
  tab: ExpressionTabEnum,
  level = 0,
  parent?: IdentifierGroupInterface,
): any[] {
  groups.forEach((item) => {
    const idToChildren = getIdToChildren(parent, tab);
    Object.assign(item, {
      _id_: idToChildren ? `${parent!._id_}.${item.id}` : item.id,
      _name_: idToChildren ? `${parent!._name_}.${item.name}` : item.name,
      _leaf_level_: level,
      _type_: tab,
    });
    if (item.children && item.children.length > 0) {
      item.children = deepFillChildren(
        item.children as IdentifierGroupInterface[],
        tab,
        level + 1,
        item,
      );
    }
  });
  return groups.filter((g) => {
    if ('children' in g) {
      // 过滤没有子节点的group
      return g.children.length > 0;
    } else {
      return true;
    }
  });
}

export function nodeTransfer(
  groups: IdentifierGroupInterface[] | IdentifierItemInterface[],
  tab: ExpressionTabEnum,
) {
  const groupsClone = cloneDeep(groups);
  const items = deepFillChildren(groupsClone as IdentifierGroupInterface[], tab);
  return items;
}
