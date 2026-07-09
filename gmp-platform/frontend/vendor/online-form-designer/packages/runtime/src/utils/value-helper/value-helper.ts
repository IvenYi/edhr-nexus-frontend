import { computed, isRef, Ref, ToRefs, ComputedGetter, ComputedSetter, ref, watch } from 'vue';

export function afterValueSet<U>(value: Ref<U>, afterSet: (i: U) => void): Ref<U> {
  const newVal = computed<U>({
    get: () => value.value as U,
    set: (v) => {
      value.value = v;
      afterSet(v);
    },
  });
  return newVal as Ref<U>;
}

export function afterFieldSet<T extends object>(
  object: T | Ref<T>,
  afterSet: <F extends keyof T>(field: F, v: T[F]) => void,
): ToRefs<T> {
  const keys = Object.keys(isRef(object) ? object.value : object);
  const result = {} as ToRefs<T>;
  keys.forEach((key) => {
    result[key] = computed({
      get: () => {
        return (isRef(object) ? object.value : object)[key];
      },
      set(v) {
        (isRef(object) ? object.value : object)[key] = v;
        afterSet(key as keyof T, v);
      },
    });
  });
  return result;
}

/**
 * 属性修改的时候不修改并抛出事件
 * @author lingxiaoming
 * @date 2024-07-17 03:30:44
 * @export
 * @template T
 * @param {(T | Ref<T>)} object (对象必须有该属性,即使是undefined,否则无法监控)
 * @param {<F extends keyof T>(field: F, v: T[F], newObj: T) => void} emitSet newObj是将要修改成的完整数据
 * @return {*}  {ToRefs<T>}
 */
export function emitFieldSet<T extends object>(
  object: T | Ref<T>,
  emitSet: <F extends keyof T>(field: F, v: T[F], newObj: T) => void,
): ToRefs<T> {
  const keys = Object.keys(isRef(object) ? object.value : object);
  const result = {} as ToRefs<T>;
  let cacheData: any = {};
  keys.forEach((key) => {
    result[key] = computed({
      get: () => {
        // 触发get说明源数据已经修改,重新触发了绘制,置空缓存数据(如果有问题该实现时机)
        cacheData = {};
        return (isRef(object) ? object.value : object)[key];
      },
      set(v) {
        const objVal = isRef(object) ? object.value : object;
        // 缓存对应修改的数据,放置同时修改多个属性时数据不完整
        cacheData[key] = v;
        const newObj = { ...objVal, ...cacheData };
        emitSet(key as keyof T, v, newObj);
      },
    });
  });
  return result;
}

/**
 * 解析数值和单位
 * @author lingxiaoming
 * @date 2024-07-15 06:06:41
 * @param {string} str
 * @return {*}  {({ value: number; unit: string } | null)}
 */
export function parseValueUnit(str: string): { value: number; unit: string } {
  if (str === 'nullpx') {
    return {
      value: 0,
      unit: 'px',
    };
  }
  // 使用正则表达式解析数值和单位
  const regex = /^(\d+\.?\d*)([a-zA-Z%]+)$/;
  const match = str.match(regex);

  // 如果匹配成功，则返回解析后的结果
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2],
    };
  }

  // 如果匹配失败，则返回 null
  throw new Error('Invalid value');
}

/**
 * 增强computed，当属性变更时，自动调用set方法
 * @author lingxiaoming
 * @date 2024-08-26 10:19:01
 * @export
 * @param {{
 *   get: ComputedGetter<T>;
 *   set: ComputedSetter<T>;
 *   deep: boolean; //为true时，深层属性变更也会触发set
 * }} opts
 */
export function computedEx<T>(opts: {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
  deep?: boolean;
}) {
  const result = ref<T>() as Ref<T>;
  let clear: () => void;
  const watchDeep = () => {
    if (!opts.deep) {
      return;
    }
    clear = watch(
      () => result.value,
      (v) => {
        // console.log('computedEx:属性或者值修改', v);
        opts.set(v);
      },
      { deep: true },
    );
  };

  // 监听get函数返回值，当值发生改变时重新初始化深层监听
  watch(
    () => opts.get(),
    (v) => {
      // 清除上一个值的深层监听
      clear && clear();
      // console.log('computedEx:获取新值，重新监听', v);
      result.value = v;
      watchDeep();
    },
    { immediate: true },
  );

  return result;
}

/**
 * 缓存函数返回值，下次相同参数调用时直接返回缓存值
 * @export
 * @template T
 * @param cb
 * @return {*}
 */
export function cacheFnReturn<T extends Function>(cb: T): T {
  const cacheReturn = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cacheReturn.has(key)) {
      return cacheReturn.get(key);
    }
    const result = cb(...args);
    cacheReturn.set(key, result);
    return result;
  } as any as T;
}
