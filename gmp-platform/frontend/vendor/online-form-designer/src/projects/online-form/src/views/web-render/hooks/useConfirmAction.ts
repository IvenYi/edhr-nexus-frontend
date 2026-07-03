import { ref } from 'vue';
import { Modal, message } from 'ant-design-vue';

type TAction<Payload = any> = (payload?: Payload) => Promise<any>;

export function useConfirmAction(options?: { modalDebounceMs?: number; modalWidth?: number }) {
  const MODAL_DEBOUNCE_MS = options?.modalDebounceMs ?? 800;
  const DEFAULT_MODAL_WIDTH = options?.modalWidth ?? 615;

  // 保持 in-flight id 集合
  const inFlightIds = ref(new Set<string>());
  const lastModalOpenedAt = ref(0);

  function isLocked(id: string) {
    return inFlightIds.value.has(id);
  }

  function generateId(idOrFn: string | (() => string)) {
    if (!idOrFn) return '__NO_ID__';
    if (typeof idOrFn === 'function') return idOrFn();
    return String(idOrFn);
  }

  /**
   * run 参数：
   * - id: 资源 id 或返回 id 的函数
   * - payload: 传给 action 的 payload
   * - title/content: modal 文案
   * - action: 必填，返回 Promise 的异步函数
   * - skipConfirm: 跳过确认弹窗（仍会加锁）
   */
  async function run<Payload = any>(opts: {
    id?: string | (() => string);
    payload?: Payload;
    title?: string;
    content?: string;
    width?: number;
    skipConfirm?: boolean;
    action: TAction<Payload>;
    onSuccess?: (res: any) => void;
    onError?: (err: any) => void;
    onFinally?: () => void;
    warnOnLocked?: boolean;
  }) {
    const idStr = generateId(opts.id ?? '__NO_ID__');

    // 已有请求进行中
    if (inFlightIds.value.has(idStr)) {
      if (opts.warnOnLocked ?? true) {
        message.warn($t('sys.onlineForm.operationInProgressPleaseWait'));
      }
      return { skipped: true, reason: 'locked' };
    }

    // modal 防抖
    const now = Date.now();
    if (!opts.skipConfirm && now - lastModalOpenedAt.value < MODAL_DEBOUNCE_MS) {
      return { skipped: true, reason: 'modal-debounce' };
    }
    lastModalOpenedAt.value = now;

    // 如果跳过确认，直接执行 action
    if (opts.skipConfirm) {
      inFlightIds.value.add(idStr);
      try {
        const res = await opts.action(opts.payload);
        message.success($t('sys.doSuccess') || $t('sys.operatingTitle'));
        opts.onSuccess?.(res);
        return { ok: true, res };
      } catch (err: any) {
        console.error('useConfirmAction error:', err);
        message.error(err?.message || $t('sys.operationFailed'));
        opts.onError?.(err);
        throw err;
      } finally {
        inFlightIds.value.delete(idStr);
        opts.onFinally?.();
      }
    }

    // 否则显示确认弹窗。关键点：把执行逻辑放入 onOk，并直接返回 Promise 给 Modal
    const proceed = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: opts.title,
        content: opts.content,
        width: opts.width ?? DEFAULT_MODAL_WIDTH,
        async onOk() {
          if (inFlightIds.value.has(idStr)) {
            if (opts.warnOnLocked ?? true) {
              message.warn($t('sys.onlineForm.operationInProgressPleaseWait'));
            }

            return Promise.resolve(false);
          }

          // 加锁，开始执行 action。把 action 的 Promise 直接返回给 Modal.confirm，以便它把 OK 置为 loading
          inFlightIds.value.add(idStr);
          try {
            const res = await opts.action(opts.payload);
            message.success($t('sys.doSuccess') || $t('sys.operatingTitle'));
            opts.onSuccess?.(res);
            return Promise.resolve(true);
          } catch (err: any) {
            console.error('useConfirmAction error:', err);
            message.error(err?.message || $t('sys.operationFailed'));
            opts.onError?.(err);
            throw err;
          } finally {
            inFlightIds.value.delete(idStr);
            opts.onFinally?.();
          }
        },
        onCancel() {
          resolve(false);
        },
      });
    });

    return { ok: proceed };
  }

  function debounce<F extends (...args: any[]) => any>(fn: F, wait = 300) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (...args: Parameters<F>) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    } as unknown as F;
  }

  return {
    run,
    inFlightIds,
    isLocked,
    debounce,
  };
}
