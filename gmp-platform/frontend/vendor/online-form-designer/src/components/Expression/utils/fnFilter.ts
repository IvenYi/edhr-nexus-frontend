import { ExpressionModeEnum } from '../types';
import { ModeFnMap } from '../constant/modeCfg';
import { cloneDeep } from 'lodash-es';

export function fnFilter(fns, mode: ExpressionModeEnum) {
  if (!ModeFnMap[mode]) {
    return fns;
  } else {
    return cloneDeep(fns)
      .map((group) => {
        group.children = group.children.filter((item) => ModeFnMap[mode].includes(item.id));
        return group;
      })
      .filter((g) => g.children.length > 0);
  }
}
