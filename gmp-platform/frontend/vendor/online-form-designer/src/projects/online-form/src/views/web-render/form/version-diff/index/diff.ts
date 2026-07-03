import { hasIn, isEqual, pick } from 'lodash-es';
import { DiffedAttrCompsEnum, DiffedAttrMaps } from './types';
import { RangeValidateMode } from '@gct/nocode-base';

export function returnDiffArr({ newAttrs, oldAttrs }) {
  return Object.keys(DiffedAttrMaps).reduce((list: any[], k) => {
    const attrkeys = DiffedAttrMaps[k];
    const emptyObj = attrkeys.reduce((obj, k) => {
      obj[k] = null;
      return obj;
    }, {});
    const nAttrVals = pick({ ...emptyObj, ...newAttrs }, attrkeys);
    const oAttrVals = pick({ ...emptyObj, ...oldAttrs }, attrkeys);
    if (
      (k === DiffedAttrCompsEnum.upperLimits || k === DiffedAttrCompsEnum.lowerLimits) &&
      (hasIn(newAttrs, 'enableRangeValidate') || hasIn(oldAttrs, 'enableRangeValidate'))
    ) {
      if (!newAttrs && !oldAttrs) {
        return list;
      }
      const obj = diffUpperAndLowerLimit(
        newAttrs ? nAttrVals : undefined,
        oldAttrs ? oAttrVals : undefined,
        k === DiffedAttrCompsEnum.upperLimits,
      );
      if (obj) {
        list.push(obj);
      }
    } else if (!isEqual(nAttrVals, oAttrVals)) {
      list.push({
        compType: k,
        value: {
          old: oldAttrs ? oAttrVals : undefined,
          new: newAttrs ? nAttrVals : undefined,
        },
      });
      // console.log('diff--------', { newAttrs, nAttrVals, oldAttrs, oAttrVals });
    }
    return list;
  }, []);
}

function diffUpperAndLowerLimit(nAttrVals, oAttrVals, isMax = true) {
  // 1 新增
  //  1-1 oldAttrs为空，push{maxValidateMode/minValidateMode, max/min,maxExpr/minExpr,maxExprEcho/minExprEcho}
  // 2 删除
  //  2-1 newAttrs为空，push{maxValidateMode/minValidateMode, max/min,maxExpr/minExpr,maxExprEcho/minExprEcho}
  // 3 修改
  //  3-1 newmaxValidateMode=oldmaxValidateMode=No_Validate, 没有变更；
  //  3-2 [maxValidateMode/minValidateMode, max/min,maxExpr/minExpr]
  if (nAttrVals && !nAttrVals.enableRangeValidate) {
    nAttrVals[isMax ? 'maxValidateMode' : 'minValidateMode'] = RangeValidateMode.No_Validate;
  }
  if (oAttrVals && !oAttrVals.enableRangeValidate) {
    oAttrVals[isMax ? 'maxValidateMode' : 'minValidateMode'] = RangeValidateMode.No_Validate;
  }
  const nMode = nAttrVals ? nAttrVals[isMax ? 'maxValidateMode' : 'minValidateMode'] : '';
  const oMode = oAttrVals ? oAttrVals[isMax ? 'maxValidateMode' : 'minValidateMode'] : '';
  if (nMode === oMode && nMode === RangeValidateMode.No_Validate) {
    return;
  }
  const compType = isMax ? DiffedAttrCompsEnum.upperLimits : DiffedAttrCompsEnum.lowerLimits;
  if (!oAttrVals || !nAttrVals) {
    return {
      compType,
      value: {
        old: oAttrVals,
        new: nAttrVals,
      },
    };
  } else {
    const diffAttrs = isMax
      ? ['maxValidateMode', 'max', 'maxExpr', 'maxExprEcho']
      : ['minValidateMode', 'min', 'minExpr', 'minExprEcho'];
    // const nMode = nAttrVals[isMax ? 'maxValidateMode' : 'minValidateMode'];
    // const oMode = oAttrVals[isMax ? 'maxValidateMode' : 'minValidateMode'];
    const oMax = pick(oAttrVals, diffAttrs);
    const nMax = pick(nAttrVals, diffAttrs);
    if (!isEqual(nMax, oMax)) {
      return {
        compType,
        value: {
          old: oMax,
          new: nMax,
        },
      };
    }
  }
  return;
}
