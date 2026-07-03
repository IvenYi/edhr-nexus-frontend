import { FormTypeEnum, commonUtils } from '@gct/nocode-base';
import { InstanceStatusValues } from './status';

export const useInstanceThemeConfig = ({
  formType,
  dataStatus,
  instanceStatus,
  statusType = 'INST',
  isFormSummary,
}) => {
  const getInstanceStatus = () => {
    if (statusType === 'TMPL') {
      return 'gct-nocode-instance-status--tmpl';
    }
    // 优先处理 TEXT 和 VIEW 类型
    if (formType === FormTypeEnum.TEXT || formType === FormTypeEnum.VIEW) {
      return 'gct-nocode-instance-status--finish';
    }

    if (instanceStatus === InstanceStatusValues.ARCHIVED) {
      return 'gct-nocode-instance-status--archived';
    }

    if (instanceStatus === InstanceStatusValues.IN_AUDIT) {
      return 'gct-nocode-instance-status--in-audit';
    }

    // PROCESS 类型映射表 或者 实例汇总
    if (formType === FormTypeEnum.PROCESS || isFormSummary) {
      const statusMap = {
        [InstanceStatusValues.RUNNING]: 'gct-nocode-instance-status--running',
        [InstanceStatusValues.FILLED]: 'gct-nocode-instance-status--already-filled',
        [InstanceStatusValues.COMPLETED]: 'gct-nocode-instance-status--finish',
        [InstanceStatusValues.ABANDON]: 'gct-nocode-instance-status--invalid',
        [InstanceStatusValues.EXCEPTION]: 'gct-nocode-instance-status--abnormal',
        [InstanceStatusValues.STASH]: 'gct-nocode-instance-status--stash',
        [InstanceStatusValues.PARTIAL_SUBMIT]: 'gct-nocode-instance-status--partial-submit',
      };

      return statusMap[instanceStatus] || 'gct-nocode-instance-status--not-filled';
    }

    // BASE 类型
    if (formType === FormTypeEnum.BASE || formType === FormTypeEnum.FILE) {
      // 新版本没有暂存了，都是SUBMIT, STASH只是兼容老代码

      // 统一处理所有 STASH 状态（最高优先级）
      if (dataStatus === 'STASH' || instanceStatus === InstanceStatusValues.STASH) {
        return 'gct-nocode-instance-status--stash';
      }

      // 处理存在 dataStatus 的情况
      if (dataStatus) {
        return dataStatus === 'SUBMIT'
          ? instanceStatus === InstanceStatusValues.ABANDON
            ? 'gct-nocode-instance-status--invalid'
            : instanceStatus === InstanceStatusValues.PARTIAL_SUBMIT
            ? 'gct-nocode-instance-status--partial-submit'
            : 'gct-nocode-instance-status--finish'
          : 'gct-nocode-instance-status--not-filled';
      }

      return instanceStatus === InstanceStatusValues.UNFILLED
        ? 'gct-nocode-instance-status--not-filled'
        : instanceStatus === InstanceStatusValues.ABANDON
        ? 'gct-nocode-instance-status--invalid'
        : 'gct-nocode-instance-status--finish';
    }

    return 'gct-nocode-instance-status--not-filled';
  };

  const themeFlag = getInstanceStatus();

  return commonUtils.gctInstanceStatusTheme[themeFlag];
};
