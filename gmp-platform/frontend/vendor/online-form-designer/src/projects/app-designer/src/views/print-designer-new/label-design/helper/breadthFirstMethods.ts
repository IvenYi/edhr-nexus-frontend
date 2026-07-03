/**
 * 非递归广度优先搜索树
 * @param {*} jsonTree
 * @param {*} callback
 * @param {*} deep
 * @param {*} key
 */
export function breadFirstTree(jsonTree, callback, key) {
  if (!jsonTree) return;
  let array = [];
  if (
    typeof jsonTree == 'object' &&
    jsonTree.constructor === Object.prototype.constructor
  ) {
    array.push(jsonTree);
  } else if (Array.isArray(jsonTree)) {
    array = jsonTree;
  } else return;

  let stack = [];

  //先将第一层节点放入栈
  for (let i = 0, len = array.length; i < len; i++) {
    stack.push(array[i]);
  }

  let jn;

  while (stack.length) {
    jn = stack.shift();

    const re = callback(jn, array);
    if (!re) {
      return false;
    } else {
      if (re !== -1 && (jn[key] && jn[key].length > 0)) {
        stack = stack.concat(jn[key]);
      }
    }
  }
}
