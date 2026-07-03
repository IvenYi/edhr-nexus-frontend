import { ref } from 'vue';
import { getAppStateDraft } from '/@/apis/gct-apaas/AppStateController';

const draft = ref<boolean>(false);
const draftTimer = ref<any>(null);

export function useAppDraftState() {
  /**
   * 手动获取状态 兼容有定时器的场景
   */
  async function getDraft() {
    const _timer = !!draftTimer.value;
    clearDraftTimer();
    const res = await getAppStateDraft();
    draft.value = res?.draft ?? false;
    _timer && getDraftTimer();
  }

  /**
   * 轮询
   */
  async function getDraftTimer() {
    clearDraftTimer();
    draftTimer.value = setInterval(() => {
      getDraft();
    }, 30 * 1000);
  }

  function clearDraftTimer() {
    draftTimer.value && clearInterval(draftTimer.value);
  }

  return {
    draft,
    getDraft,
    getDraftTimer,
    clearDraftTimer,
  };
}
