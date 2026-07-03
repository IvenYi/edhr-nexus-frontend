import { getElemCenterCoor } from './positionDimension';
export let snapElems = [];

/**
 * 当点击一个组件之后，获取该组件所有的兄弟组件的snaps，包括上下左右边界和中心点的位置
 */
export const updateSnaps = function(elems) {
  snapElems = [];
  for (let el of elems) {
    const rotate = el.rotate;
    if (!rotate || (!!rotate && rotate % 360 === 0)) {
      // 旋转了的元素不参与捕捉
      const id = el.ownId;
      const l = el.left;
      const r = el.width + l;
      const t = el.top;
      const b = el.height + t;
      const centerCoor = getElemCenterCoor(el);
      snapElems.push({
        id,
        l,
        r,
        t,
        b,
        x: centerCoor[0],
        y: centerCoor[1]
      });
    }
  }
};
