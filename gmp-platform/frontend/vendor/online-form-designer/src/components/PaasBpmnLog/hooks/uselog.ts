import { ref } from 'vue';
import { getProcessApprovalLogApproveHistory } from '/@/apis/gct-apaas/ProcessApprovalLogController';
import { ProcessHistoryResult } from '/@/apis/gct-apaas/model';

export function useLog() {
  const logDetail = ref<ProcessHistoryResult>();

  function init(id) {
    getProcessLog(id);
  }

  async function getProcessLog(id_) {
    logDetail.value = (await getProcessApprovalLogApproveHistory({ id_ })) || {};
  }

  return {
    logDetail,

    init,
  };
}
