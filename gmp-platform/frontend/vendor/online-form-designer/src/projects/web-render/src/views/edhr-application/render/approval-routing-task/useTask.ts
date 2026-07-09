import { ref, reactive } from 'vue';
import type { getProcessTaskTodoPageListQueryInterface } from '/@/apis/gct-apaas/ProcessTaskTodoController';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

const userStore = useUserStoreWithOut();
const userId = userStore.getUserInfo.userId as string;

const formState: getProcessTaskTodoPageListQueryInterface = reactive({
  name: undefined,
  code: undefined,
  assigneeId: userId,
  taskType: 'ROUTING',
  pageNo: undefined,
  pageSize: undefined,
});
const activeTabKey = ref<'1' | '2'>('1');

export function useTask() {
  async function loadApprovalProcess(businessId) {
    try {
      const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'getById',
          modelKey: 'em_edhr_summary_approve_his',
          modelCategory: 'entity',
        },
        {
          id: businessId,
        },
        {
          id: businessId,
        },
      );
      return res;
    } catch (err) {
      return { ok: false, data: {} };
    }
  }

  return {
    formState,
    activeTabKey,
    loadApprovalProcess,
  };
}
