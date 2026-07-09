import { Dayjs } from 'dayjs';
import { JobRequest } from '/@/apis/gct-apaas/model';

/**
 * 定时任务项
 *
 * @author chitanda
 * @date 2024-03-19 15:03:08
 * @export
 * @interface ITimedTaskItem
 */
export interface ITimedTaskItem {
  /**
   * 标识
   *
   * @author chitanda
   * @date 2024-03-19 15:03:16
   * @type {string}
   */
  id: string;
  /**
   * 名称
   *
   * @author chitanda
   * @date 2024-03-19 15:03:21
   * @type {string}
   */
  name: string;
  /**
   * 描述
   *
   * @author zhanghanrui
   * @date 2024-03-21 10:03:23
   * @type {string}
   */
  desc: string;
  /**
   * 触发类型
   *
   * @author zhanghanrui
   * @date 2024-03-21 10:03:59
   * @type {string}
   */
  type: 'ONCE' | 'REPEAT' | 'CRON';
  /**
   * 后台存储的 cron 表达式
   *
   * @author zhanghanrui
   * @date 2024-03-25 09:03:33
   * @type {string[]}
   */
  cron: string[];
  /**
   * 触发方式类型
   *
   * @author zhanghanrui
   * @date 2024-03-26 10:03:44
   * @type {string}
   */
  sourceType: string;
  /**
   * 服务脚本或服务编排值
   *
   * @author zhanghanrui
   * @date 2024-03-21 10:03:16
   * @type {string}
   */
  sourceId: string;
  /**
   * 状态
   *
   * @author zhanghanrui
   * @date 2024-03-26 14:03:28
   * @type {('ENABLED' | 'DISABLED')}
   */
  state: 'ENABLED' | 'DISABLED';
  /**
   * 修改时间
   *
   * @author zhanghanrui
   * @date 2024-03-26 14:03:00
   * @type {string}
   */
  updateDate: string;
  /**
   * 修改人
   *
   * @author zhanghanrui
   * @date 2024-03-26 14:03:05
   * @type {string}
   */
  updateMain: string;

  // 重复触发周期
  cycleInterval: number;
  // 重复触发模式, 1: 小时，2: 日，3: 周，4: 月，5: 年
  cycleMode: '1' | '2' | '3' | '4' | '5';
  // 重复触发时间量
  cycleTimeQuantum: any;
  // 自定义 cron 表达式配置
  cycleExpression: string;
  // 触发时间
  cycleDate: Dayjs;
  // 触发时分
  cycleTime: Dayjs;
  // 触发时间范围
  cycleRange: [Dayjs, Dayjs];
  // 触发方式
  cycleTriggerMode: string;

  /**
   * 多语言配置
   *
   * @author zhanghanrui
   * @date 2024-03-26 15:03:21
   * @type {*}
   */
  i18nConfig: any;

  /**
   * v
   *
   * @author zhanghanrui
   * @date 2024-09-24 11:09:20
   * @type {string}
   */
  params: string;

  /**
   * 获取向后端发送的数据
   *
   * @author zhanghanrui
   * @date 2024-03-26 14:03:42
   * @return {*}  {JobRequest}
   */
  getData(): JobRequest;
}
