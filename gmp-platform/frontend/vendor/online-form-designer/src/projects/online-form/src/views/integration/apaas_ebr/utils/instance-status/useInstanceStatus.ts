import { message } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';

import { EntityModelCategoryEnum } from '@gct/runtime';
import {
  InstanceStatusValues,
  InstanceStatusValue,
  EdhrInstanceStatus,
  ReleaseInstanceStatus,
} from './status';

import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

type OptionType = 'all' | 'form' | 'edhr' | 'release' | 'exclude2archived' | 'edhrDocumentTracked';

interface UseStatusOptionParams {
  /** 类型，控制取值场景 */
  type?: OptionType;
  /** 自定义过滤函数 */
  customFilter?: (value: InstanceStatusValue) => boolean;
}

export function useInstanceStatus() {
  const { t } = useI18n();
  const { businessSetting } = useBusinessSetting();

  // 全部状态值
  const allValues = Object.values(InstanceStatusValues) as InstanceStatusValue[];

  const edhrValues: EdhrInstanceStatus[] = [
    InstanceStatusValues.UNFILLED,
    InstanceStatusValues.RUNNING,
    InstanceStatusValues.COMPLETED,
    InstanceStatusValues.ABANDON,
    // InstanceStatusValues.ARCHIVED,
    InstanceStatusValues.IN_SUMMARY,
    InstanceStatusValues.IN_AUDIT,
    InstanceStatusValues.SUMMARIZED,
  ];

  const releaseValues: ReleaseInstanceStatus[] = [
    InstanceStatusValues.UNRELEASED,
    InstanceStatusValues.RELEASE,
    InstanceStatusValues.COMPLETED,
    InstanceStatusValues.EXCEPTION,
    InstanceStatusValues.ARCHIVED,
  ];

  const presets: Record<OptionType, () => InstanceStatusValue[]> = {
    all: () => allValues,
    form: () =>
      allValues.filter(
        (v) =>
          ![
            InstanceStatusValues.IN_SUMMARY,
            InstanceStatusValues.SUMMARIZED,
            InstanceStatusValues.IN_AUDIT,
          ].includes(v),
      ),
    edhr: () => {
      // 如果未开启DHR汇总，则不显示汇总相关状态
      return businessSetting.dhrSumDisabled === 1
        ? edhrValues.filter(
            (e) =>
              ![
                InstanceStatusValues.IN_SUMMARY,
                InstanceStatusValues.SUMMARIZED,
                InstanceStatusValues.IN_AUDIT,
              ].includes(e),
          )
        : edhrValues;
    },
    edhrDocumentTracked: () => [
      InstanceStatusValues.UNFILLED,
      InstanceStatusValues.STASH,
      InstanceStatusValues.RUNNING,
      InstanceStatusValues.COMPLETED,
      InstanceStatusValues.ABANDON,
      InstanceStatusValues.IN_AUDIT,
    ],
    release: () => releaseValues,
    exclude2archived: () => allValues.filter((v) => v !== InstanceStatusValues.ARCHIVED),
  };

  function getInstanceOptions(params: UseStatusOptionParams = {}) {
    const { type = 'all' } = params;
    const values = presets[type]();
    const key = type === 'edhr' ? 'instanceStatus2DhrEnum' : 'instanceStatus2FormEnum';

    return values.map((value) => ({
      value,
      label: t(`sys.edhr.${key}.${value}`),
    }));
  }

  return {
    getInstanceOptions,
  };
}

export function useEnterFillProcess() {
  const { t } = useI18n();
  const { businessSetting } = useBusinessSetting();

  const labelName = {
    SN: 'SN',
    LOT: $t('sys.edhr.materialStatus.LOT'),
  };

  async function requestGetStatus(lotSnNo) {
    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'gct_product_release',
        bsKey: 'getOne',
      },
      {
        query: {
          'material_no_.eq': lotSnNo,
        },
      },
    );

    console.log('Get Status', res);
    return res?.data;
  }

  /** 是否可以进入DHR填报 */
  async function canEnterFillProcess(info) {
    if (!info) {
      message.warn($t('sys.onlineForm.DHRInstanceNotFound'));
      return false;
    }
    const { instanceStatus, materialStatus, materialNo } = info || {};
    // 如果DHR状态是汇总审核中、已汇总、已作废的状态，那么不能进入填报
    if (
      InstanceStatusValues.IN_AUDIT === instanceStatus ||
      InstanceStatusValues.SUMMARIZED === instanceStatus ||
      InstanceStatusValues.ABANDON === instanceStatus
    ) {
      message.warn(
        t('sys.onlineForm.instanceStatusTip', {
          status: t(`sys.edhr.instanceStatus2DhrEnum.${instanceStatus}`),
        }),
      );
      return false;
    }

    // 如果未开启DHR汇总时DHR状态是已完成的状态，那么需要判断当前批次/SN是否是放行中或已放行
    if (businessSetting.dhrSumDisabled === 1 && InstanceStatusValues.COMPLETED === instanceStatus) {
      // 当前批次（或SN根据实际情况提示）正在放行中或已经放行，无法再进行填报
      const res = await requestGetStatus(materialNo);
      if (
        res &&
        (res.instance_status_ === InstanceStatusValues.RELEASE ||
          res.instance_status_ === InstanceStatusValues.ARCHIVED)
      ) {
        const msg =
          res.instance_status_ === InstanceStatusValues.RELEASE
            ? $t('sys.onlineForm.releaseInProgress')
            : $t('sys.onlineForm.releaseCompleted');
        message.warn(
          $t('sys.onlineForm.materialStatusErrorTip', {
            msg: `${labelName[materialStatus]}${msg}`,
          }),
        );
        return false;
      }
    }

    return true;
  }

  /** 是否可以进入DHR变更 */
  function canEnterChangeProcess(instanceStatus: InstanceStatusValue) {
    if (!instanceStatus) {
      message.warn($t('sys.onlineForm.DHRInstanceStatusNotFound'));
      return false;
    }

    // 如果DHR状态是汇总审核中、已作废的状态，那么不能进入变更
    if (
      InstanceStatusValues.IN_AUDIT === instanceStatus ||
      InstanceStatusValues.ABANDON === instanceStatus
    ) {
      message.warn(
        $t('sys.onlineForm.instanceCannotChangeTip', {
          status: t(`sys.edhr.instanceStatus2DhrEnum.${instanceStatus}`),
        }),
      );
      return false;
    }

    return true;
  }

  /**
   * 判断是否可以进入放行单创建流程
   * @param {Object} info - 实例信息，包含 edhrInstanceStatus, containerSnStatus, createType
   * @returns {boolean}
   */
  function canEnterReleaseFillProcess(info) {
    if (!info) {
      message.warn($t('sys.onlineForm.DHRInstanceNotFound'));
      return false;
    }

    const { edhrInstanceStatus, containerSnStatus, createType } = info;
    const isSystemCreate = createType === 'system';
    const finished = containerSnStatus === 'finished';
    const requiredInstanceStatus =
      businessSetting.dhrSumDisabled === 0
        ? InstanceStatusValues.SUMMARIZED
        : InstanceStatusValues.COMPLETED;
    const required = edhrInstanceStatus === requiredInstanceStatus;

    const notFinished = !finished;
    const notRequired = !required;
    const summarizedMode = businessSetting.dhrSumDisabled === 0;

    function getWarnMessage() {
      if (isSystemCreate) {
        if (notFinished && notRequired) {
          return summarizedMode
            ? $t('sys.onlineForm.batchNotCompletedAndDHRNotSummarized')
            : $t('sys.onlineForm.batchNotCompletedAndDHRNotCompleted');
        }
        // 批次未完成但实例已达到要求状态
        if (notFinished && !notRequired) {
          return $t('sys.onlineForm.batchNotCompleted');
        }
        if (!notFinished && notRequired) {
          return summarizedMode
            ? $t('sys.onlineForm.batchDHRNotSummarized')
            : $t('sys.onlineForm.batchDHRNotCompleted');
        }
      } else {
        // 非系统创建只关心实例状态是否满足
        return summarizedMode
          ? $t('sys.onlineForm.DHRNotSummarized')
          : $t('sys.onlineForm.DHRNotCompleted');
      }
    }

    // 系统创建：必须同时满足 finished && required
    if (isSystemCreate) {
      if (finished && required) return true;
      message.warn(getWarnMessage());
      return false;
    }

    // 手动创建：只需实例达到 required 状态
    if (required) return true;

    message.warn(getWarnMessage());
    return false;
  }

  return {
    canEnterFillProcess,
    canEnterChangeProcess,
    canEnterReleaseFillProcess,
  };
}
