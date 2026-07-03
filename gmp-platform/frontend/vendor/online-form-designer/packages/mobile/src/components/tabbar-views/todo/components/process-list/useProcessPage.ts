//获取待办任务节点拓展信息
import { getPmProcessEngineTaskExtension } from '/@/apis/gct-apaas/PmProcessEngineController';
//我发起的
import { getPmProcessEngineInitialTaskExtension } from '/@/apis/gct-apaas/PmProcessEngineController';
//我的已办
import { getPmProcessEngineHiTaskExtension } from '/@/apis/gct-apaas/PmProcessEngineController';
import { getAid } from '@mobile/stores/sessionHooks';
import { ExamineAndApproveStateEnum } from '@gct/runtime';
import { SqlitePage } from '@mobile/utils/sqlite_page';
import { showToast } from 'vant';
/**跳转代办页面 */
export function useProcessPage(rowData: any, router) {
  const { taskId = '', appTag, processInstanceId } = rowData;
  getAid.value = appTag;
  /**我的代办 */
  async function goTodoPage() {
    const { node, mobilePageKey } = await getPmProcessEngineTaskExtension({ taskId });
    return goPage(node.mobilePageKey || mobilePageKey, ExamineAndApproveStateEnum.MY_AGENT);
  }

  /**我发起的跳转 */
  async function goMyApplicationPage() {
    const { node, mobileViewPageKey } = await getPmProcessEngineInitialTaskExtension({
      processInstanceId,
    });
    return goPage(
      node.mobileViewPageKey || mobileViewPageKey,
      ExamineAndApproveStateEnum.MY_APPLICATION,
    );
  }
  /**我的已办理 */
  async function goDonePage() {
    const { node, mobileViewPageKey } = await getPmProcessEngineHiTaskExtension({ taskId });
    return goPage(node.mobileViewPageKey || mobileViewPageKey, ExamineAndApproveStateEnum.MY_DONE);
  }
  async function goPage(mobilePageKey: string, state: ExamineAndApproveStateEnum) {
    if (!mobilePageKey) {
      showToast($t('sys.app.mobilePageNotConfigured'));
      return;
    }
    await SqlitePage.updateAppDB(appTag);
    router.push({
      name: 'process',
      params: { linkPage: mobilePageKey },
      query: {
        taskId,
        processInstanceId,
        state,
      },
    });
  }
  return { goTodoPage, goMyApplicationPage, goDonePage };
}
