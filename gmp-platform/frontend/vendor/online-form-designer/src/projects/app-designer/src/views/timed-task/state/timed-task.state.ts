import { ITimedTaskItem } from '../interface';

/**
 * 定时任务界面状态
 *
 * @author chitanda
 * @date 2024-03-19 13:03:09
 * @export
 * @class TimedTaskState
 */
export class TimedTaskState {
  /**
   * 定时任务数据
   *
   * @author chitanda
   * @date 2024-03-19 13:03:21
   * @type {ITimedTaskItem[]}
   */
  items: ITimedTaskItem[] = [];

  /**
   * 触发类型
   *
   * @author zhanghanrui
   * @date 2024-03-26 17:03:04
   * @type {Record<string, string>}
   */
  triggerTypeMap: Record<string, string> = {};

  /**
   * 触发模式
   *
   * @author zhanghanrui
   * @date 2024-03-26 17:03:00
   * @type {Record<string, string>}
   */
  triggerModeMap: Record<string, string> = {};

  /**
   * 触发服务(服务脚本)字典映射
   *
   * @author zhanghanrui
   * @date 2024-03-26 17:03:35
   * @type {Record<string, string>}
   */
  triggerScriptServiceMap: Record<string, string> = {};

  /**
   * 触发服务(服务编排)字典映射
   *
   * @author zhanghanrui
   * @date 2024-03-26 17:03:12
   * @type {Record<string, string>}
   */
  triggerArrangeServiceMap: Record<string, string> = {};

  /**
   * 搜索值
   *
   * @author zhanghanrui
   * @date 2024-03-25 18:03:10
   */
  searchValue = '';

  /**
   * 是否正在加载
   *
   * @author zhanghanrui
   * @date 2024-03-22 13:03:31
   * @type {boolean}
   */
  isLoading = false;

  /**
   * 是否已经初次加载完毕
   *
   * @author zhanghanrui
   * @date 2024-03-25 17:03:59
   */
  isLoaded = false;

  /**
   * 表格当前分页
   *
   * @author zhanghanrui
   * @date 2024-03-25 17:03:25
   * @type {number}
   */
  pageNo = 1;

  /**
   * 表格每页显示数量
   *
   * @author zhanghanrui
   * @date 2024-03-25 17:03:50
   */
  pageSize = 20;

  /**
   * 总数
   *
   * @author zhanghanrui
   * @date 2024-03-25 17:03:31
   */
  totalCount = 0;
}
