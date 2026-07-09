import { ref, reactive } from 'vue';
import type { getProcessTaskTodoPageListQueryInterface } from '/@/apis/gct-apaas/ProcessTaskTodoController';

const formState: getProcessTaskTodoPageListQueryInterface = reactive({
  edhrTmplId: undefined,
  materialNo: undefined,
  materialStatus: undefined,
  ofTmplName: undefined,
  pageNo: undefined,
  pageSize: undefined,
  processInstanceStatus: undefined,
  productId: undefined,
  sortField: undefined,
  sortType: undefined,
});

export function useDocumentTask() {
  return {
    formState,
  };
}
