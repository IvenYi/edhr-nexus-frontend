import { clone } from 'lodash-es';

/**
 * 上下文处理类
 *
 * @author zhanghanrui
 * @date 2024-05-06 09:05:38
 * @export
 * @class GctContext
 * @implements {IGctContext}
 */
export class GctContext implements IGctContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;

  /**
   * 实例唯一标识
   *
   * @author zhanghanrui
   * @date 2024-05-06 10:05:51
   * @type {string}
   */
  readonly _id: number;

  /**
   * clone 后引用的上下文实例，需要在实例销毁时，同时销毁
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:30
   * @protected
   * @type {GctContext[]}
   */
  protected declare _associationContext: GctContext[];

  /**
   * 修改的父上下文
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:43
   * @protected
   * @type {IData}
   */
  protected declare _context: IData;

  /**
   * 父的上下文源对象
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:48
   * @type {IGctContext}
   */
  declare _parent?: IGctContext;

  /**
   * Creates an instance of GctContext.
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:54
   * @param {IData} [context={}] 自身的上下文
   * @param {IGctContext} [parent]
   */
  private constructor(context: IData = {}, parent?: IGctContext) {
    if (parent) {
      this._id = parent._id + 1;
    } else {
      this._id = 0;
    }
    Object.defineProperty(this, '_associationContext', {
      enumerable: false,
      configurable: true,
      value: [],
    });

    if (parent) {
      this.initWithParent(parent);
    }

    // 合并给入上下文
    Object.assign(this, context);
  }

  private initWithParent(parent: IContext): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // 定义私有变量，存放父上下文源对象
    Object.defineProperty(this, '_parent', {
      enumerable: false,
      writable: true,
      value: parent,
    });

    // 定义私有变量，用于存储对父已有上下文的修改。
    Object.defineProperty(this, '_context', {
      enumerable: false,
      writable: true,
      value: {},
    });
    // 监控父上下文参数，自身不存在时从父取
    const properties: { [key: string]: PropertyDescriptor } = {};
    const keys = Object.keys(parent);
    keys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        // !已经定义的不重复定义，会报错
        return;
      }
      properties[key] = {
        enumerable: true,
        configurable: true,
        set(val: unknown): void {
          if (val == null) {
            self._context[key] = null;
          } else {
            self._context[key] = val;
          }
        },
        get(): IContext {
          if (self._context[key] !== undefined) {
            return self._context[key];
          }
          return self._parent![key];
        },
      };
    });
    Object.defineProperties(this, properties);
  }

  /**
   * 返回自身的上下文，独有的和与父有差异的
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:14
   * @return {*}  {IData}
   */
  getOwnContext(): IData {
    const result: IData = {};
    Object.keys(this).forEach((key) => {
      // 父没有的，或者修改了父的上下文
      // 父不存在则返回所有自身的属性
      if (
        !this._parent ||
        !Object.prototype.hasOwnProperty.call(this._parent, key) ||
        Object.prototype.hasOwnProperty.call(this._context, key)
      ) {
        result[key] = this[key];
      }
    });
    return result;
  }

  /**
   * 销毁当前上下文对象
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:22
   */
  destroy(): void {
    this._parent = undefined;
    this._context = {};
    this._associationContext.forEach((item) => {
      item.destroy();
    });
  }

  /**
   * 在非视图中，需要断开视图上下文联系时。只能使用 clone 创建新的局部上下文
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:28
   * @return {*}  {GctContext}
   */
  clone(): GctContext {
    const newContext = new GctContext(clone(this.getOwnContext()), this._parent);
    this._associationContext.push(newContext);
    return newContext;
  }

  /**
   * 在不改变对象引用的情况下，重置上下文
   * 等效于重新实例化，但是引用不变
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:39
   * @param {IData} [context={}]
   * @param {IContext} [parent]
   */
  reset(context: IData = {}, parent?: IContext): void {
    // 清空_associationContext
    this._associationContext.forEach((item) => {
      item.destroy();
    });
    // 置空parent相关属性
    if (this._parent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._parent = {} as any;
      this._context = {};
    }
    // 删除自身的属性，define的删不掉，上面置空了就不管了
    Object.keys(this).forEach((key) => {
      try {
        delete this[key];
      } catch (error) {
        // 删不掉的不管了，上面已经变成uneducated了
      }
    });
    if (parent) {
      this.initWithParent(parent);
    }
    // 合并默认值
    Object.assign(this, context);
  }

  /**
   * 创建一个上下文
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:46
   * @static
   * @param {IData} [context]
   * @param {IGctContext} [parent]
   * @return {*}  {GctContext}
   */
  static create(context?: IData, parent?: IGctContext): GctContext {
    return new GctContext(context, parent);
  }
}
