import { ref, reactive } from 'vue';
import type { getProcessTaskTodoPageListQueryInterface } from '/@/apis/gct-apaas/ProcessTaskTodoController';

const formState: getProcessTaskTodoPageListQueryInterface = reactive({
  edhrTmplId: undefined,
  materialNo: undefined,
  materialStatus: undefined,
  ofTmplName: undefined,
  ofCode: undefined,
  pageNo: undefined,
  pageSize: undefined,
  processInstanceStatus: undefined,
  productId: undefined,
  sortField: undefined,
  sortType: undefined,
});
const activeTabKey = ref<'1' | '2' | '3'>('1');

export function useDocumentTask() {
  return {
    formState,
    activeTabKey,
  };
}
