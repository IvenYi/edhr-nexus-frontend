import dayjs from 'dayjs';
import { JobRequest, JobResponse } from '/@/apis/gct-apaas/model';
import { ITimedTaskItem } from '../../interface';

export class TimedTaskItem implements ITimedTaskItem {
  id!: string;
  name!: string;
  state!: ITimedTaskItem['state'];
  desc!: string;
  type!: ITimedTaskItem['type'];
  cron!: string[];
  sourceType!: string;
  sourceId!: string;
  updateDate!: string;
  updateMain!: string;
  i18nConfig: any;
  cycleInterval!: number;
  cycleMode!: '1' | '2' | '3' | '4' | '5';
  cycleTimeQuantum!: any;
  cycleExpression!: string;
  cycleDate!: dayjs.Dayjs;
  cycleTime!: dayjs.Dayjs;
  cycleRange!: [dayjs.Dayjs, dayjs.Dayjs];
  cycleTriggerMode!: string;
  params: string = '';

  constructor(data?: JobResponse) {
    if (data) {
      this.id = data.id!;
      this.name = data.jobName!;
      this.desc = data.description!;
      this.type = data.triggerPolicy as ITimedTaskItem['type'];
      this.cron = data.cron!;
      this.sourceType = data.resourceType!;
      this.sourceId = data.resourceId!;
      this.state = data.status! as ITimedTaskItem['state'];
      this.updateDate = data.modifyTime!;
      this.updateMain = data.modifyUserName!;
      this.params = data.params || '';
      const cycle = data.triggerConfig as any;
      if (cycle) {
        this.cycleInterval = cycle.interval!;
        this.cycleMode = cycle.mode!;
        this.cycleTimeQuantum = cycle.timeQuantum!;
        this.cycleExpression = cycle.expression!;
        this.cycleTriggerMode = cycle.triggerMode!;
        if (cycle.time) {
          this.cycleTime = dayjs(cycle.time);
        }
        if (cycle.date) {
          this.cycleDate = dayjs(cycle.date);
        }
        const range = cycle.range;
        if (range && range.length === 2) {
          this.cycleRange = [dayjs(range[0]), dayjs(range[1])];
        }
      }
    }
  }

  /**
   * 获取向后端发送的数据
   *
   * @author zhanghanrui
   * @date 2024-03-26 13:03:10
   * @return {*}  {JobRequest}
   */
  getData(): JobRequest {
    const cycle: any = {};
    Object.assign(cycle, {
      interval: this.cycleInterval,
      mode: this.cycleMode,
      timeQuantum: this.cycleTimeQuantum,
      expression: this.cycleExpression,
      triggerMode: this.cycleTriggerMode,
    });
    if (this.cycleTime) {
      cycle.time = dayjs(this.cycleTime).format('YYYY-MM-DD HH:mm:ss');
    }
    if (this.cycleDate) {
      cycle.date = dayjs(this.cycleDate).format('YYYY-MM-DD HH:mm:ss');
    }
    if (this.cycleRange && this.cycleRange.length === 2) {
      cycle.range = this.cycleRange.map((item: dayjs.Dayjs) => item.format('YYYY-MM-DD HH:mm:ss'));
    }
    return {
      jobName: this.name,
      description: this.desc,
      triggerPolicy: this.type,
      cron: this.cron,
      resourceType: this.sourceType,
      resourceId: this.sourceId,
      triggerConfig: cycle,
      params: this.params,
    };
  }
}
