/** 实例状态集合 */
export const InstanceStatusValues = {
  /** 作废状态 */
  ABANDON: 'ABANDON',
  /** 未填报 */
  UNFILLED: 'UNFILLED',
  /** 已填报 */
  FILLED: 'FILLED',
  /** 已完成 */
  COMPLETED: 'COMPLETED',
  /** 进行中 */
  RUNNING: 'RUNNING',
  /** 暂存 */
  STASH: 'STASH',
  /** 待放行 */
  UNRELEASED: 'UNRELEASED',
  /** 放行中 */
  RELEASE: 'RELEASE',
  /** 异常 */
  EXCEPTION: 'EXCEPTION',
  /** 已封存 */
  ARCHIVED: 'ARCHIVED',
  /** 汇总中 */
  IN_SUMMARY: 'IN_SUMMARY',
  /** 已汇总 */
  SUMMARIZED: 'SUMMARIZED',
  /** 汇总审核中、表单变更审核中 */
  IN_AUDIT: 'IN_AUDIT',
} as const;

export type InstanceStatusValue = (typeof InstanceStatusValues)[keyof typeof InstanceStatusValues];

/** eDHR实例状态 */
export type EdhrInstanceStatus = Extract<
  InstanceStatusValue,
  | typeof InstanceStatusValues.UNFILLED
  | typeof InstanceStatusValues.RUNNING
  | typeof InstanceStatusValues.COMPLETED
  | typeof InstanceStatusValues.ARCHIVED
  | typeof InstanceStatusValues.ABANDON
  | typeof InstanceStatusValues.IN_SUMMARY
  | typeof InstanceStatusValues.SUMMARIZED
  | typeof InstanceStatusValues.IN_AUDIT
>;

/** 放行实例状态 */
export type ReleaseInstanceStatus = Extract<
  InstanceStatusValue,
  | typeof InstanceStatusValues.UNRELEASED
  | typeof InstanceStatusValues.RELEASE
  | typeof InstanceStatusValues.COMPLETED
  | typeof InstanceStatusValues.EXCEPTION
  | typeof InstanceStatusValues.ARCHIVED
>;
