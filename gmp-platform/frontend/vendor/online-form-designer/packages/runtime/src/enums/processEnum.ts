export enum ProcessStatusEnum {
  /** 审批中 */
  APPROVING = 'APPROVING',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已拒绝 */
  REFUSED = 'REFUSED',
  /** 已驳回 */
  REJECTED = 'REJECTED',
  /** 已终止 */
  TERMINATED = 'TERMINATED',
  /** 已撤回 */
  WITHDRAWN = 'WITHDRAWN',
}

export const ch_ProcessStatusMap = {
  [ProcessStatusEnum.APPROVING]: 'sys.process.status.approving',
  [ProcessStatusEnum.COMPLETED]: 'sys.process.status.completed',
  [ProcessStatusEnum.REFUSED]: 'sys.process.status.refused',
  [ProcessStatusEnum.REJECTED]: 'sys.process.status.rejected',
  [ProcessStatusEnum.TERMINATED]: 'sys.process.status.terminated',
  [ProcessStatusEnum.WITHDRAWN]: 'sys.process.status.withdrawn',
};

/**审批状态 */
export enum ExamineAndApproveStateEnum {
  /**我发起的 */
  MY_APPLICATION = 'myApplication',
  /**我的代办 */
  MY_AGENT = 'myAgent',
  /**我的已办 */
  MY_DONE = 'myDone',
  /**我的自定义审批 */
  MY_CUSTOM = 'myCustom',
  /**我的自定义审批模态框 */
  MY_CUSTOM_Modal = 'myCustomModal',
}
