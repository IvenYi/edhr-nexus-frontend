import { ref, onBeforeUnmount } from 'vue';

type ExecFn<P, R> = (payload: P, signal: AbortSignal) => Promise<R>;

export function useAbortableRequest<P = any, R = any>(execFn: ExecFn<P, R>) {
  const controller = ref<AbortController | null>(null);
  const loading = ref(false);
  const error = ref<any>(null);
  // 用于防竞态：只接受最后一次 run 的结果
  let lastReqId = 0;

  async function run(payload: P): Promise<R | null> {
    // 取消上一个请求（如果存在）
    if (controller.value) {
      try {
        controller.value.abort();
      } catch (e) {}
    }

    const ctrl = new AbortController();
    controller.value = ctrl;
    lastReqId += 1;
    const myId = lastReqId;

    loading.value = true;
    error.value = null;

    try {
      const res = await execFn(payload, ctrl.signal);

      // 如果不是最新请求，丢弃结果
      if (myId !== lastReqId) {
        return null;
      }

      return res;
    } catch (err: any) {
      // 被 abort 的错误通常 name === 'AbortError'
      const isAbort =
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED' ||
        err?.message?.includes('aborted');

      if (!isAbort) {
        error.value = err;
        throw err;
      }
      // 如果是取消，静默返回 null
      return null;
    } finally {
      // 只有当前 controller 仍然是本次控制器时才清理
      if (controller.value === ctrl) controller.value = null;
      loading.value = false;
    }
  }

  function abort() {
    if (controller.value) {
      try {
        controller.value.abort();
      } catch (e) {}
      controller.value = null;
    }
    // increase lastReqId 使得正在进行的请求即便完成也不会被接收
    lastReqId++;
  }

  onBeforeUnmount(() => {
    abort();
  });

  return {
    run,
    abort,
    loading,
    error,
  } as const;
}
