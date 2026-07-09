import { ref, reactive } from 'vue';
import { PrintResourceEnum } from '../enum';
import { getPrintResourceGetPrintCount } from '/@/apis/gct-platform/PrintResourceController';

const printResourceTypedCount: Record<PrintResourceEnum, number> = reactive({
  [PrintResourceEnum.CLIENT_PRINT]: 0,
  [PrintResourceEnum.INTERNET_PRINT]: 0,
});
const activePrintResource = ref<PrintResourceEnum>(PrintResourceEnum.CLIENT_PRINT);

export function usePrintResource() {
  async function loadPrintResourceTypedCount() {
    getPrintResourceGetPrintCount().then((res) => {
      printResourceTypedCount.CLIENT_PRINT = res?.clientCount ?? 0;
      printResourceTypedCount.INTERNET_PRINT = res?.internetCount ?? 0;
    });
  }

  function updatePrintResourceCountByType(type: PrintResourceEnum, count: number) {
    printResourceTypedCount[type] = count;
  }

  return {
    activePrintResource,
    printResourceTypedCount,
    loadPrintResourceTypedCount,
    updatePrintResourceCountByType,
  };
}
