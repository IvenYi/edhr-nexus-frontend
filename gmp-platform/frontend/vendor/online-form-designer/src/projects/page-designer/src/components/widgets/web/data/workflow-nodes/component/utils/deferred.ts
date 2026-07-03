export interface IDeferred<T = any> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}
export function createDeferred<T = any>() {
  const deferred: IDeferred<T> = Object.create({});

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

let renderMapInstance: Nullable<RenderDeferMap> = null;

export class RenderDeferMap {
  constructor() {}
  renderDefer = {};
  deferKey = '';

  setDeferred(key: string) {
    this.deferKey = key;
    this.renderDefer[key] = createDeferred();
  }

  resetDefer() {
    this.renderDefer = Object.create({});
  }
}

export const getRenderDeferMap = () => {
  if (!renderMapInstance) {
    renderMapInstance = new RenderDeferMap();
  }
  return renderMapInstance;
};
