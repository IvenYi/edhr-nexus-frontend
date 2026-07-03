export enum eventTypeEnum {
  BEFORE = 'PRE',
  AFFTER = 'POST',
}
export enum executeTypeEnum {
  ASYNC = 'ASYNC',
  SYNC = 'SYNC',
}

export enum triggerEnum {
  SCRIPT_SERVICE = 'SCRIPT',
  SO_SERVICE = 'ORCHESTRATION',
}

export const i18nKeyMap = {
  [eventTypeEnum.BEFORE]: 'sys.beforeExecution',
  [eventTypeEnum.AFFTER]: 'sys.afterExecution',
  [executeTypeEnum.ASYNC]: 'sys.asynchronous',
  [executeTypeEnum.SYNC]: 'sys.synchronous',
  [triggerEnum.SCRIPT_SERVICE]: 'sys.script',
  [triggerEnum.SO_SERVICE]: 'sys.model.serviceOrchestration',
};

export interface eventDataTypeEnum {
  type: eventTypeEnum; // 事件类型
  executeType: executeTypeEnum; // 执行类型
  resourceType: triggerEnum; // 触发方式
  bizServiceKey: any; // 业务服务
  relationId: any; // 关联事件key
  description: string; // 说明
}
