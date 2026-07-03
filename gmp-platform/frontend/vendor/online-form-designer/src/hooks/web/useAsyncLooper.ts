import { ref, onUnmounted } from 'vue';
import { uuid2 } from '@/utils/uuid';

export type ClearLoop = () => any;

/** 回调方法返回结果 */
export type Result = void | ClearLoop;

/** 回调方法 */
export type Func = (...params: any[]) => Result | Promise<Result>;

export type LoopOpts = {
  /** 轮询时间 */
  time?: number;
  /** 是否立即执行 */
  immediate?: boolean;
};

/**
 * 轮询hook
 * @param func 回调方法
 * @param opts
 * @param opts.time 轮询时间
 * @param opts.immediate 是否立即执行
 */
export function useAsyncLooper(func: Func, { time = 1000, immediate = true }: LoopOpts) {
  /** 轮询定时器句柄 */
  const timerRef = ref<number | null>(null);
  /** 轮询状态 */
  const loopStateRef = ref<boolean>(false);
  /** 清理轮询句柄 */
  const clearLoopRef = ref<ClearLoop | void>();

  function clear() {
    if (typeof clearLoopRef.value === 'function') {
      clearLoopRef.value?.();
    }
  }

  async function asyncLoop() {
    if (loopStateRef.value) {
      return;
    }
    clear();
    const key = uuid2(8); // 生成新的 key
    clearLoopRef.value = await Promise.resolve(func(key));
    timerRef.value = window.setTimeout(asyncLoop, time);
  }

  if (immediate) {
    asyncLoop();
  }

  /** 重新刷新轮询 */
  function refreshLoop() {
    if (timerRef.value) {
      window.clearTimeout(timerRef.value);
    }
    asyncLoop();
  }

  /** 暂停轮询 */
  function stopLoop() {
    if (timerRef.value) {
      window.clearTimeout(timerRef.value);
    }
    loopStateRef.value = true;
    clear();
  }

  /** 开始轮询 */
  function startLoop() {
    loopStateRef.value = false;
    refreshLoop();
  }

  /** 延迟开始轮询 */
  function delayedStartLoop() {
    loopStateRef.value = false;
    if (timerRef.value) {
      window.clearTimeout(timerRef.value);
    }
    // 设定time后启动轮询，每次调用时重置计时
    timerRef.value = window.setTimeout(() => {
      if (!loopStateRef.value) {
        asyncLoop();
      }
    }, time);
  }

  onUnmounted(stopLoop);

  return {
    startLoop,
    delayedStartLoop,
    stopLoop,
  };
}
