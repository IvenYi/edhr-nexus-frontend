import aliasManager from './aliasManager';
import { buildShortUUID } from '/@/utils/uuid';

/**
 * Assigns a new id to the element preceded by the parentId and a dot '.'
 *
 * @param {object} el : Element to register
 * @param {string} [parentId] : Id of the parent element
 * @param {string} notGenerateNewOwnId
 * @return {object} : New element (cloned from egglement) with newly assigned ids
 */
export function setElIdnAlias(el, parentId?, notGenerateNewOwnId?) {
  let elId = notGenerateNewOwnId ? el.ownId : buildShortUUID();
  const ownId = elId;
  //id不能包含敏感字符如.# 有坑
  if (parentId) elId = parentId.concat('.', elId);
  const alias = aliasManager.add({
    id: elId,
    ...el,
  });
  let newElement = { ...el, id: elId, ownId, alias, children: [] }; // 2019-08-29 增加ownId用于后端渲染
  if (el.children && el.children.length > 0) {
    for (let childEl of el.children) {
      newElement.children.push(setElIdnAlias(childEl, elId, notGenerateNewOwnId));
    }
  }
  return newElement;
}

/**
 * remove el and its children's alias from aliasManager recursively
 * @param {object} el
 */
export function removeElAlias(el) {
  aliasManager.remove(el);
  if (el.children && el.children.length > 0) {
    for (let childEl of el.children) {
      removeElAlias(childEl);
    }
  }
}

/**
 * Creates an array containing all the global/external components inside.
 *
 * @param {object} el : Current reviewing element
 * @param compList
 * @return {object} : An array with the global/external components found inside.
 */
export function getExtGlobComps(el, compList) {
  if (!compList) compList = [];
  if (el.global || el.external) compList.push(el);

  if (el.children && el.children.length > 0) {
    for (let childEl of el.children) {
      compList = getExtGlobComps(childEl, compList);
    }
  }
  return compList;
}

/**
 * Returns the element identified by targetId, which could be the
 * currentNode itself, one of its children... (and down to any depth)
 *
 * @param {object} currentNode : The element being inspected
 * @param {string} targetId : The id of the element expected
 *
 * @return {object} : The element identified by targetId
 */
export function getChildNode(currentNode, targetId) {
  if (currentNode.id === targetId) return currentNode;

  for (let child of currentNode.children) {
    if (targetId.indexOf(child.id) !== -1) {
      return getChildNode(child, targetId);
    }
  }
}

/**
 * Returns the element --identified by targetId-- relative position,
 * based on its parent (and full family depth) position
 * and the current mouse left/top position.
 *
 * This method gives positioning support for elements changing "family".
 *
 * @param {object} currentNode : The element being inspected
 * @param {string} targetId : The id of the element expected
 * @param {number} currentX : Current relative left position
 * @param {number} currentY : Current relative top position
 *
 * @return {object} : Relative point obtained from the currentX, currentY
 */
export function calcRelativePoint(currentNode, targetId, currentX, currentY) {
  if (currentNode.id === targetId) return { left: currentX, top: currentY };

  if (currentNode.left && currentNode.top) {
    currentX -= currentNode.left;
    currentY -= currentNode.top;
  }
  for (let child of currentNode.children) {
    if (targetId.indexOf(child.id) !== -1) {
      return calcRelativePoint(child, targetId, currentX, currentY);
    }
  }
}

/**
 * 递归法遍历树
 * @param jsonTree 树数据
 * @param callback 遍历到每个节点要执行的回调方法
 * @param deep 每个节点的深度值
 * @param key 子节点关键字
 */
export function eachPageTree(jsonTree, callback, deep = 0, key) {
  let array = [];
  if (typeof jsonTree == 'object' && jsonTree.constructor === Object.prototype.constructor) {
    array.push(jsonTree);
  } else array = jsonTree;
  let jn;
  for (let i = array.length - 1; i >= 0; i--) {
    jn = array[i];
    // 找到节点,执行相应代码
    if (callback) {
      /**
       * callback 遍历节点,执行相应代码
       * @param jn
       * @param array
       * @param i
       */
      const re = callback(jn, array, i);
      if (!re) {
        return false;
      } else {
        if (re !== -1 && jn[key] && jn[key].length > 0) {
          eachPageTree(jn[key], callback, deep + 1, key);
        }
      }
    }
  }
}
