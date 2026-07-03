import { overlay } from '@gct/runtime-web';
import { message } from 'ant-design-vue';
import { TimedTaskAction } from '../constant';
import { ITimedTaskItem } from '../interface';
import { TimedTaskState } from '../state/timed-task.state';
import { TimedTaskEdit } from '../timed-task-edit';
import {
  deleteJob,
  getJobPageList,
  postJobExec,
  putJobStatusById,
} from '/@/apis/gct-apaas/JobController';
import { TimedTaskItem } from '../entity';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';

/**
 * 定时任务控制器
 *
 * @author chitanda
 * @date 2024-03-19 11:03:31
 * @export
 * @class TimedTaskController
 */
export class TimedTaskController {
  /**
   * 界面状态，唯一和界面相关的状态
   *
   * @author chitanda
   * @date 2024-03-19 11:03:47
   */
  state = new TimedTaskState();

  /**
   * 多语言翻译，由组件注入
   *
   * @author zhanghanrui
   * @date 2024-03-25 15:03:28
   */
  declare t: (key: string) => string;

  /**
   * 执行操作
   *
   * @author chitanda
   * @date 2024-03-19 15:03:35
   * @param {string} type
   * @param {ITimedTaskItem} [item]
   * @return {*}  {Promise<void>}
   */
  async action(type: string, item?: ITimedTaskItem): Promise<void> {
    switch (type) {
      case TimedTaskAction.ADD:
        await this.add();
        break;
      case TimedTaskAction.EDIT:
        await this.edit(item!);
        break;
      case TimedTaskAction.DELETE:
        await this.delete(item!);
        break;
      case TimedTaskAction.ENABLE:
        await this.enable(item!);
        break;
      case TimedTaskAction.DISABLE:
        await this.disable(item!);
        break;
      case TimedTaskAction.MANUAL_EXECUTION:
        await this.manualExecution(item!);
        break;
      default:
        break;
    }
  }

  initCodeList(): void {
    this.state.triggerTypeMap = {
      ONCE: this.t('sys.appDesigner.timedTask.codeList.oneShot'),
      REPEAT: this.t('sys.appDesigner.timedTask.codeList.repeatedTrigger'),
      CRON: this.t('sys.appDesigner.timedTask.codeList.customCronExpression'),
    };
    this.state.triggerModeMap = {
      SCRIPT_SERVICE: this.t('sys.appDesigner.timedTask.codeList.serviceScript'),
      SO_SERVICE: this.t('sys.appDesigner.timedTask.codeList.serviceOrchestration'),
    };
  }

  async loadTriggerServiceList() {
    this.initCodeList();
    const items = await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT });
    if (items) {
      items.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            this.state.triggerScriptServiceMap[child.id!] = child.name!;
          });
        }
      });
    }
    const items2 = await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION });
    if (items2) {
      items2.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            this.state.triggerArrangeServiceMap[child.id!] = child.name!;
          });
        }
      });
    }
  }

  /**
   * 加载定时任务数据集
   *
   * @author zhanghanrui
   * @date 2024-03-22 13:03:06
   * @return {*}  {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.state.isLoading = true;
    const res = await getJobPageList({
      pageNo: this.state.pageNo,
      pageSize: this.state.pageSize,
      keyword: this.state.searchValue,
    });
    await this.loadTriggerServiceList();
    if (res) {
      this.state.items = res.data?.map((item) => new TimedTaskItem(item)) || [];
      this.state.totalCount = res.totalCount || 0;
    }
    this.state.isLoading = false;
  }

  /**
   * 搜索
   *
   * @author zhanghanrui
   * @date 2024-03-25 18:03:49
   * @return {*}  {Promise<void>}
   */
  async search(searchValue: string): Promise<void> {
    this.state.searchValue = searchValue;
    this.state.pageNo = 1;
    await this.fetch();
  }

  /**
   * 刷新表格数据
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:55
   * @return {*}  {Promise<void>}
   */
  async refresh(): Promise<void> {
    await this.fetch();
  }

  /**
   * 新建定时任务
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:29
   * @return {*}  {Promise<void>}
   */
  async add(): Promise<void> {
    // 新建
    const result = await overlay.modal(
      TimedTaskEdit,
      {},
      { width: 1040, height: 745, title: this.t(`sys.appDesigner.timedTask.modalNewTitle`) },
    );
    if (result.ok) {
      this.refresh();
    }
  }

  /**
   * 表格触发编辑
   *
   * @author zhanghanrui
   * @date 2024-03-25 18:03:55
   * @param {ITimedTaskItem} item
   * @return {*}  {Promise<void>}
   */
  async edit(item: ITimedTaskItem): Promise<void> {
    // 编辑
    const result = await overlay.modal(
      TimedTaskEdit,
      { context: { id: item.id } },
      { width: 1040, title: this.t(`sys.appDesigner.timedTask.modalEditTitle`) },
    );
    if (result.ok) {
      await this.refresh();
    }
  }

  /**
   * 删除数据
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:07
   * @param {ITimedTaskItem} [item]
   * @return {*}  {Promise<void>}
   */
  async delete(item: ITimedTaskItem): Promise<void> {
    await deleteJob({ ids: item.id });
    await this.refresh();
  }

  /**
   * 启用定时任务
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:41
   * @param {ITimedTaskItem} [item]
   * @return {*}  {Promise<void>}
   */
  async enable(item: ITimedTaskItem): Promise<void> {
    await putJobStatusById({ id: item.id }, { status: 'ENABLED' }, { joinParamsToUrl: true });
    item.state = 'ENABLED';
    message.success(this.t('sys.appDesigner.timedTask.info.enableSuccess'));
  }

  /**
   * 禁用定时任务
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:50
   * @param {ITimedTaskItem} [item]
   * @return {*}  {Promise<void>}
   */
  async disable(item: ITimedTaskItem): Promise<void> {
    await putJobStatusById({ id: item.id }, { status: 'DISABLED' }, { joinParamsToUrl: true });
    item.state = 'DISABLED';
    message.success(this.t('sys.appDesigner.timedTask.info.disableSuccess'));
  }

  /**
   * 手动执行定时任务
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:57
   * @param {ITimedTaskItem} [item]
   * @return {*}  {Promise<void>}
   */
  async manualExecution(item: ITimedTaskItem): Promise<void> {
    await postJobExec({ id: item.id }, { joinParamsToUrl: true });
    message.success(this.t('sys.appDesigner.timedTask.info.manualExecutionSuccess'));
  }
}
