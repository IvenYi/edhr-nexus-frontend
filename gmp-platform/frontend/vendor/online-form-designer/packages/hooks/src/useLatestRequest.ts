import { ref } from 'vue';

export function useLatestRequest<P = any, R = any>(execFn: (payload: P) => Promise<R>) {
  let lastReqId = 0;
  const loading = ref(false);
  const error = ref<any>(null);

  async function run(payload: P): Promise<R | null> {
    lastReqId += 1;
    const myId = lastReqId;

    loading.value = true;
    error.value = null;

    try {
      const res = await execFn(payload);
      // 仅在仍然是最新请求时返回结果
      if (myId !== lastReqId) return null;
      return res;
    } catch (err: any) {
      // 不是取消逻辑：记录错误并抛出
      error.value = err;
      throw err;
    } finally {
      // 仅当本次仍是最后一次请求时把 loading 设为 false
      if (myId === lastReqId) loading.value = false;
    }
  }

  function invalidate() {
    lastReqId += 1; // 令当前和之前的请求都失效
  }

  return { run, invalidate, loading, error };
}
