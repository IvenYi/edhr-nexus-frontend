import { merge } from 'lodash-es';

/** 每一项回调函数 */
interface ItemCallBackParams<T, P> {
  /** 当前项 */
  item: T;
  /** 当前项索引 */
  index: number;
  /** 当前项的父项 */
  parent?: P;
}
type ItemCallBack<T, P> = (args: ItemCallBackParams<T, P>) => boolean | void;

/** 默认配置参数 */
const IterateOpts = {
  /** 子集合属性数组 */
  childrenFields: ['children'],
};

const BreakError = new Error('中断操作');

/**
 * 获取子属性集合
 * @author lxm
 * @date 2023-04-20 08:54:32
 * @param {T} parent
 * @param {string[]} fields 子集合可能的属性名称
 * @return {*}  {(IData[] | undefined)}
 */
function getChildField<T, P>(parent: P, fields: string[]): T[] | undefined {
  for (const field of fields) {
    if (parent[field]?.length) {
      return parent[field];
    }
  }
}

/**
 * 递归遍历
 * @author lingxiaoming
 * @date 2024-07-24 06:15:27
 * @param {(IData | undefined)} parent 遍历数组的父对象,可能没有
 * @param {IData[]} children 当前这轮的遍历数组
 * @param {ItemCallBack} callback 遍历执行的回调函数,返回true则中断遍历
 * @param {Partial<typeof IterateOpts>} [opts] 遍历额外选项
 */
function _recursiveIterate<T, P>(
  parent: P | undefined,
  children: T[],
  callback: ItemCallBack<T, P>,
  opts?: Partial<typeof IterateOpts>,
): void {
  const { childrenFields } = merge({}, IterateOpts, opts || {});
  if (children?.length) {
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      // 递归自身的子成员
      const isBreak = callback({ item: child, index, parent });
      // 如果回调返回true则退出
      if (isBreak) {
        throw BreakError;
      }

      const subChildren = getChildField<T, P>(child as any, childrenFields);
      if (subChildren?.length) {
        // 递归孙的成员
        _recursiveIterate(child as any, subChildren, callback, opts);
      }
    }
  }
}

/**
 * 递归遍历子元素
 * 遍历顺序先遍历同级元素,再按顺序递归遍历子元素
 * @author lingxiaoming
 * @date 2024-07-24 06:28:12
 * @export
 * @param {(T | T[])} parentOrArr 父元素或者数组
 * @param {ItemCallBack} callback 每一项的执行回调
 * @param {Partial<typeof IterateOpts>} [opts] 遍历额外选项
 */
export function recursiveIterate<T extends IData, P = T>(
  parentOrArr: P | T[],
  callback: ItemCallBack<T, P>,
  opts?: Partial<typeof IterateOpts>,
): void {
  const { childrenFields } = merge({}, IterateOpts, opts || {});
  try {
    const parent = Array.isArray(parentOrArr) ? undefined : parentOrArr;
    const children = Array.isArray(parentOrArr)
      ? parentOrArr
      : getChildField<T, P>(parentOrArr, childrenFields);
    if (children?.length) {
      _recursiveIterate<T, P>(parent, children, callback, opts);
    } else {
      console.warn('没有可遍历的数组', parentOrArr, opts);
    }
  } catch (error) {
    if (error !== BreakError) {
      throw error;
    }
  }
}

//! 递归比较查找对应元素

/** 每一项回调函数 */
interface ItemCompareCallBackParams<T, P> extends ItemCallBackParams<T, P> {
  /** 要比较的值 */
  key: string;
  /** 要比较的字段属性标识 */
  compareField: string;
}
type ItemCompareCallBack<T, P> = (args: ItemCompareCallBackParams<T, P>) => boolean | void;

interface ICompareOpts<T = IData, P = IData> extends Partial<typeof IterateOpts> {
  compareField?: string;
  compareCallback?: ItemCompareCallBack<T, P>;
}

/** 默认配置参数 */
const CompareOpts = {
  ...IterateOpts,
  /** 比较的属性 */
  compareField: 'id',
  /** 默认的比较函数 */
  compareCallback: (({ item, key, compareField }) => {
    return item[compareField] === key;
  }) as ItemCompareCallBack<IData, IData>,
};

/**
 * 递归找到对应的子元素和其对应的父元素
 * @author lingxiaoming
 * @date 2024-07-24 06:49:05
 * @export
 * @param {(IData | IData[])} parentOrArr
 * @param {string} key
 * @param {ICompareOpts} [opts]
 * @return {*}
 */
export function findRecursiveChild<T extends IData, P = T>(
  parentOrArr: P | T[],
  key: string,
  opts?: ICompareOpts<T, P>,
) {
  const { compareField, compareCallback } = merge({}, CompareOpts, opts || {});

  // 递归遍历，找到后中断遍历，返回找到项
  let findChild: T | undefined;
  let findParent: P | undefined;
  recursiveIterate<T, P>(
    parentOrArr,
    (arg) => {
      if (compareCallback({ ...arg, key, compareField })) {
        findChild = arg.item;
        findParent = arg.parent;
        return true;
      }
    },
    opts,
  );
  return findChild ? { child: findChild, parent: findParent } : undefined;
}

/**
 * 递归转换树形对象
 * @template T
 * @template R
 * @param data
 * @param cb
 * @return {*}
 */
export function recursiveTransfer<R = any, T = any>(
  data: T[],
  cb: (item: T, resolveChild: (data: T[]) => R[]) => R,
): R[] {
  const resolveChild = (data: T[]) => recursiveTransfer(data, cb);
  return data.map((item) => {
    return cb(item, resolveChild);
  });
}

/**
 * 过滤树结构的数据
 *
 * @export
 * @param arr 树形的数组
 * @param cb 过滤函数
 * @param [opts]
 * @return {*}
 */
export function filterTreeData<T extends IData>(
  arr: T[],
  cb: (item: T, parent?: T) => boolean,
  opts?: Partial<typeof IterateOpts>,
): T[] {
  const { childrenFields } = merge({}, IterateOpts, opts || {});
  function recursiveFilter(children: T[], parent?: T): T[] {
    return children.filter((item) => {
      console.log('item', item.title);
      // 有子元素先过滤子元素
      const subArr = getChildField<T, T>(item, childrenFields);
      let filterSubArr: T[] = [];
      if (subArr?.length) {
        filterSubArr = recursiveFilter(subArr, item);
      }
      //! 子属性存在多个到时候有问题
      (item as any)[childrenFields[0]] = filterSubArr;
      // 子元素存在的时候父元素就需要存在
      if (filterSubArr.length) {
        return true;
      } else {
        return cb(item, parent);
      }
    });
  }

  return recursiveFilter(arr);
}
