//获取待办任务节点拓展信息
import {
  getPmProcessEngineTaskExtension,
  getPmProcessEngineInitialTaskExtension,
  getPmProcessEngineHiTaskExtension,
} from '/@/apis/gct-apaas/PmProcessEngineController';
import { message } from 'ant-design-vue';
import { openWindow } from '/@/utils';
import { ExamineAndApproveStateEnum } from '@gct/runtime';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
/**跳转代办页面 */
export function useProcessPage(rowData) {
  const usePathQuery = usePathQueryStore();
  const appTag = rowData.appTag || usePathQuery.getAid();
  const { taskId = '', envTag, processInstanceId } = rowData;
  const config = {
    transferToConfig: {
      headers: {
        'App-Tag': appTag,
        Env: envTag,
      },
    },
  };

  /**我的代办 */
  async function goTodoPage() {
    const { node, webPageKey } = await getPmProcessEngineTaskExtension({ taskId }, config);
    goPage(node.webPageKey || webPageKey, ExamineAndApproveStateEnum.MY_AGENT);
  }

  /**我发起的跳转 */
  async function goMyApplicationPage() {
    const { node, webViewPageKey } = await getPmProcessEngineInitialTaskExtension(
      { processInstanceId },
      config,
    );
    goPage(node.webViewPageKey || webViewPageKey, ExamineAndApproveStateEnum.MY_APPLICATION);
  }
  /**我的已办理 */
  async function goDonePage() {
    const { node, webViewPageKey } = await getPmProcessEngineHiTaskExtension({ taskId }, config);
    goPage(node.webViewPageKey || webViewPageKey, ExamineAndApproveStateEnum.MY_DONE);
  }

  async function goPage(webPageKey: string, state: ExamineAndApproveStateEnum) {
    if (!webPageKey) {
      message.info($t('sys.app.pcPageNotConfigured'));
      return;
    }
    /**存在分支id就说明在开发环境 */
    const bid = location.pathname
      .replace('/src/projects', '')
      .replace('/index.html', '')
      .split('/')[3];
    let path = bid ? import.meta.env.VITE_PATHNAME_WEB_PREVIEW_PROCESS_PAGE : import.meta.env.VITE_PATHNAME_WEB_PROCESS_PAGE;
    openWindow(
      `${location.origin}${path}?taskId=${taskId || ''
      }&processInstanceId=${processInstanceId}&state=${state}`,
      {
        genUrlData: {
          aid: appTag,
          pid: webPageKey,
          bid
        },
      },
    );
  }
  return { goTodoPage, goMyApplicationPage, goDonePage, goPage };
}
