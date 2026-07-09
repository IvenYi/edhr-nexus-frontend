import { ref, onBeforeUnmount } from 'vue';

type Nullable<T> = T | null;

/** 原始提交函数签名 */
export type SubmitFn<T> = () => Promise<T>;

/**
 * 防抖 + Promise 聚合 + 唯一请求锁 Hook
 * @param submitFn   回调方法
 * @param wait       防抖等待毫秒，默认 500
 */
export function useDebouncePromise<T>(submitFn: SubmitFn<Nullable<T>>, wait = 500) {
  const isSubmitting = ref(false);

  // 防抖定时器
  let timer: ReturnType<typeof setTimeout> | null = null;
  // 请求锁标志
  let inFlight = false;
  // 上次请求的 Promise
  let lastPromise: Promise<Nullable<T>> | null = null;
  // 收集防抖窗口内所有的 resolve
  let pendingResolvers: Array<(val: Nullable<T>) => void> = [];

  function run(): Promise<Nullable<T>> {
    return new Promise((resolve) => {
      pendingResolvers.push(resolve);
      // 重置防抖
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        timer = null;
        // 如果上一次请求还在执行，先等待它结束
        if (inFlight && lastPromise) {
          try {
            await lastPromise;
          } catch { }
        }
        // 调用真正的提交逻辑
        inFlight = true;
        lastPromise = submitFn().finally(() => {
          inFlight = false;
        });
        try {
          isSubmitting.value = true;
          const res = await lastPromise!;
          pendingResolvers.forEach((r) => r(res));
        } catch {
          pendingResolvers.forEach((r) => r(null));
        } finally {
          pendingResolvers = [];
          isSubmitting.value = false;
        }
      }, wait);
    });
  }

  function cancel() {
    if (timer) clearTimeout(timer);
    // 如果有挂起的 resolve，全部返回 null
    pendingResolvers.forEach((r) => r(null));
    pendingResolvers = [];
    timer = null;
  }

  onBeforeUnmount(cancel);

  return { isSubmitting, run, cancel };
}
