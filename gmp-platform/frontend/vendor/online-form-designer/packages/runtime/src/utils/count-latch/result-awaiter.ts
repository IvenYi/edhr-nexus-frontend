/**
 * 拆分处理异步结果
 *
 * @export
 * @class ResultAwaiter
 * @template T
 */
export class ResultAwaiter<T> {
  private promise: Promise<T>;

  private _resolve: (value: T) => void;

  private _reject: (reason?: any) => void;

  constructor() {
    this.init();
  }
  private init() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  await(): Promise<T> {
    return this.promise;
  }

  resolve(result: T) {
    this._resolve(result);
    this.init();
  }

  reject(reason?: any) {
    this._reject(reason);
    this.init();
  }
}
