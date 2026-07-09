/**
 * 计数插销工具类
 *
 * @author zhanghanrui
 * @date 2024-04-18 09:04:53
 * @export
 * @class CountLatch
 */
export class CountLatch {
  private promise: Promise<void> | null = null;

  private resolve: ((value: void) => void) | null = null;

  /**
   * 计数，当前等待的异步逻辑个数
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:58
   * @private
   * @type {number}
   */
  private count: number = 0;

  /**
   * 是否处于锁止状态
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:17
   * @readonly
   * @type {boolean}
   */
  get isLock(): boolean {
    return this.count > 0;
  }

  /**
   * 开启promise
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:06
   * @private
   */
  private startPromise(): void {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  /**
   * 结束promise
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:13
   * @private
   */
  private endPromise(): void {
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
      this.promise = null;
    }
  }

  /**
   * 上锁，计数加一
   * 第一次计数，开启异步
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:20
   */
  lock(): void {
    this.count += 1;
    if (!this.promise) {
      this.startPromise();
    }
  }

  /**
   * 解锁，计数减一
   * 归零时结束异步
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:27
   */
  unlock(): void {
    if (this.count < 1) {
      this.count = 0;
      console.warn('lock和unlock次数不匹配！');
      return;
    }
    this.count -= 1;
    if (this.count === 0) {
      this.endPromise();
    }
  }

  /**
   * 等待，计数归零异步结束
   *
   * @author zhanghanrui
   * @date 2024-04-18 09:04:33
   * @return {*}  {Promise<void>}
   */
  async await(): Promise<void> {
    if (this.promise) {
      return this.promise;
    }
  }
}
