import { isArray, isObject } from '/@/utils/is';
import { globalVarCaches } from '/@web-render/render/Event/utils/runGlobalByPage';

/** 数据类型 */
enum ValueTypeEnum {
  /** 固定值 */
  FIXED = 'FIXED',
  /** 系统变量 */
  SYS = 'SYS',
  /** 字段*/
  FIELD = 'FIELD',
  /** 变量*/
  VAR = 'VAR',
}
/**
 * 数据筛选生成查询条件
 * @param datafilter
 * @returns
 */
export const useQueryfilter = (datafilter) => {
  let queryfilter = {},
    exp = '';
  if (isArray(datafilter)) {
    /**老版本 */
    const query = datafilter.reduce((total, curr) => {
      const key = curr.key + '.' + curr.ope;
      total[key] = curr.value;
      return total;
    }, {});
    queryfilter = { ...query };
  } else {
    try {
      const dataRule = JSON.parse(datafilter?.dataRule);
      exp = dataRule?.exp;
      const typeMap = dataRule?.typeMap || {};
      const query = dataRule?.query || {};
      for (const k in query) {
        if (typeMap[k] === ValueTypeEnum.VAR) {
          queryfilter[k] = globalVarCaches.value?.[query[k]]?.value;
        } else {
          queryfilter[k] = query[k];
        }
      }
    } catch (error) {}
  }
  function getExp(...arg) {
    const explist = [exp, ...arg].filter((i) => i);
    const expkey = explist.join(',');
    if (explist.length > 1) {
      return `AND(${expkey})`;
    } else {
      return expkey;
    }
  }
  return { query: queryfilter, getExp };
};

/**
 * 生成排序查询条件
 * @param param0
 * @returns
 */
export const getQuerySort = ({ collation, collationSort, collationField }: any) => {
  if (collation) {
    return collation
      .filter((i) => i.collationField)
      .map((i) => {
        return { sortField: i.collationField, sortType: i.collationSort };
      });
  } else {
    return collationSort ? [{ sortField: collationField, sortType: collationSort }] : [];
  }
};

/**
 * 关键字段搜索
 * @param searchField 需要搜索的字段
 * @param keyword 搜索的关键字
 */
export const getQueryDateByKeyWord = ({ searchField, keyword }): object => {
  if (!keyword) return {};
  return (
    searchField?.reduce((total, filedKey: string) => {
      const expkey = filedKey.split('.').length > 1 ? filedKey : filedKey + '.like';
      total[expkey] = keyword;
      return total;
    }, {}) || {}
  );
};

/**获取父元素带滚动条的容器 */
export const getParentPopupContainer = (props) => {
  return props.getPopupContainer || ((t) => getScrollParent(t));
};
export function getScrollParent(element) {
  while (element) {
    if (element.id == 'gct-scrollbody') {
      return element;
    }
    if (element.role === 'document' && hasVerticalScrollbar(element)) {
      /**模态框内部特殊逻辑 */
      return element;
    }
    element = element.parentNode;
  }
  return document.body;
}
/**动态识别是否有滚动条 */
function hasVerticalScrollbar(element) {
  return element.scrollHeight > element.clientHeight;
}

export function getIKeywordFieldKeys(searchField: string[], ignoreOptions = []) {
  if (ignoreOptions?.[0] == 'ignoreCase') {
    return searchField?.map((i) => {
      const arr = i.split('.');
      return `${arr[0]}.i${arr[1]}`;
    });
  }
  return searchField;
}

export function getIExp(exp, ignoreOptions = []) {
  if (ignoreOptions?.[0] == 'ignoreCase') {
    return exp?.replace(/\./g, '.i');
  }
  return exp;
}
