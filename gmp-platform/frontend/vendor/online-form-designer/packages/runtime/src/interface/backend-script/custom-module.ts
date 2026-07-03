declare module 'lodash' {
  /**
   * 深拷贝
   *
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   * @example
   *
   * const objects = [{ 'a': 1 }, { 'b': 2 }]
   *
   * const deep = cloneDeep(objects)
   * console.log(deep[0] === objects[0])
   * // => false
   */
  function cloneDeep(value: object): object;

  /**
   * 创建一个对象，key 是 iteratee 遍历 collection(集合) 中的每个元素返回的结果。 分组值的顺序是由他们出现在 collection(集合) 中的顺序确定的。每个键对应的值负责生成 key 的元素组成的数组。iteratee 调用 1 个参数： (value)。
   *
   * @param {Array|Object} collection 一个用来迭代的集合
   * @param {Function} iteratee 这个迭代函数用来转换key
   * @returns {Object} 返回一个组成聚合的对象
   * @example
   *
   * groupBy([6.1, 4.2, 6.3], Math.floor)
   * // => { '4': [4.2], '6': [6.1, 6.3] }
   */
  function groupBy(collection: object | [], iteratee?: [] | Function | Object | string): object;

  /**
   * 过滤
   *
   * @param{Array|Object} collection 一个用来迭代的集合
   * @param {Array|Function|Object|string} predicate 每次迭代调用的函数
   * @example
   *
   * filter(users, function(o) { return !o.active; });
   * // => objects for ['fred']
   */
  function filter(collection: [] | Object, predicate: Function | Object | [] | string): object;

  /**
   * 排序
   *
   * @param {Array|Object} collection 一个用来迭代的集合
   * @param {Function} iteratee 这个迭代函数用来转换key
   * @param {String[]} orders  迭代函数的排序顺序
   * @example
   *
   * orderBy(users, ['user', 'age'], ['asc', 'desc']);
   * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
   */
  function orderBy(
    collection: [] | object,
    iteratee: [][] | Function[] | Object[] | string[],
    orders: string[],
  ): [][];

  /**
   * 唯一
   *
   * @param {Array} array  要检查的数组
   * @param {[]|Function|Object|string} iteratee 迭代函数，调用每个元素
   * @example
   *
   * uniqBy([2.1, 1.2, 2.3], Math.floor);
   * // => [2.1, 1.2]
   */
  function uniqBy(array: [], iteratee: [] | Function | Object | string): [];

  /**
   * 检查元素唯一
   *
   * @param {Array} array 要检查的数组
   * @example
   *
   * uniq([2, 1, 2]);
   * // => [2, 1]
   */
  function uniq(array: []): [];

  /**
   * 判断为空
   *
   * @param {any} value 要检查的值
   * @example
   *
   * isNil(null);
   * // => true
   */
  function isNil(value: any): boolean;

  /**
   * 判断为空
   *
   * @param {any} value 要检查的值
   * @example
   *
   * isEmpty(null);
   * // => true
   */
  function isEmpty(value: any): boolean;

  /**
   * 匹配
   *
   * @param{any} value 用来比较的值。
   * @param{any} other 另一个用来比较的值。
   * @example
   *
   * isEqual(object, other);
   * // => true
   */
  function isEqual(value: any, other: any): boolean;
  export default { cloneDeep, groupBy, filter, orderBy, uniqBy, uniq, isNil, isEmpty, isEqual };
}

declare module 'uuid' {
  class _uuid {
    constructor(num: number);

    /**
     * 输出uuid字符串
     * @return {string} uuid字符串
     */
    format: () => string;
  }
  export default _uuid;
}

declare module 'dayjs' {
  const _dayjs: (time: string) => {
    /**
     * 格式化字符串
     * @param {string} format 格式化字符串:YYYY-MM-DD HH:mm:ss
     * @return {string} 格式化后的字符串
     */
    format: (format: string) => string;
  };

  export default _dayjs;
}
