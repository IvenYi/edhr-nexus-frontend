import { reactive } from 'vue';
import {
  postPlatAppGlobal,
  getPlatAppGlobalInfo,
} from '/@/apis/gct-apaas/PlatformConfigController';

export interface Setting {
  enableProcessAbnormalAlarm: number;
  enableAutosaveForm: number;
  formAutosaveFrequency?: number;
  enableDocControl: number;
  enableCallFlow?: number;
  autoArchived?: number;
  flow: {
    fuuid?: string;
    method?: string;
    path?: string;
  };
  /** 物料RDO查询条件 */
  productSearchFields?: string;
  ruleConfig: {
    sn?: {};
    sw?: {};
  };
  validateForm: number;
  productionModality: 'container' | 'container_and_sn' | 'sn';
  dhrSumDisabled: number;
  enforceUseDHRSummaryProcess: number;
  /** 表单模板审批后自动切换默认 */
  updateFormDefaultAfterApprove: number;
  /** DHR模板审批后自动切换默认 */
  updateDhrDefaultAfterApprove: number;
  /** 是否支持放行单 */
  enableCreateReleaseTmpl: number;
  /** 放行单默认关联放行事务 */
  defaultRelatedReleaseTxn: string;
  /** 是否启用工艺审核 */
  enableRoutingApprove: number;
  /** 是否启用制程审核 */
  enableProductProcessApprove: number;
  /** 数据采集模块是否 */
  enableShareOnlineForm: number;
  /** 流程干预是否显示表单流程 */
  enableDoc: number;
  /** ERP BOM是否可修改 */
  erpBomCanModifyEnabled: number;
}

const businessSetting = reactive<Setting>({
  enableProcessAbnormalAlarm: 1,
  enableDocControl: 0,
  enableAutosaveForm: 1,
  formAutosaveFrequency: 1,
  enableCallFlow: 0,
  flow: {},
  autoArchived: 0,
  productSearchFields: '',
  ruleConfig: {},
  validateForm: 1,
  productionModality: 'container',
  dhrSumDisabled: 0,
  enforceUseDHRSummaryProcess: 0,
  updateFormDefaultAfterApprove: 1,
  updateDhrDefaultAfterApprove: 1,
  enableCreateReleaseTmpl: 1,
  defaultRelatedReleaseTxn: 'rcus_product_release',
  enableRoutingApprove: 0,
  enableProductProcessApprove: 0,
  enableShareOnlineForm: 1,
  enableDoc: 1,
  erpBomCanModifyEnabled: 0,
});

// medpro 流程干预设置的默认配置
const medProSetting = {
  enableDoc: 0,
  enableDocControl: 0,
  enableRoutingApprove: 0,
  enableProductProcessApprove: 0,
  dhrSumDisabled: 1,
};

export function useBusinessSetting() {
  const postBusinessSetting = async (localSetting: any) => {
    await postPlatAppGlobal({
      value: JSON.stringify(Object.assign(businessSetting, localSetting)),
    });
  };

  async function loadBusinessSetting() {
    const res = await getPlatAppGlobalInfo();
    res && setBusinessSetting(res);
  }

  function setBusinessSetting(data) {
    const { value } = data;
    if (!value) return;
    try {
      Object.assign(businessSetting, JSON.parse(value));
    } catch (err) {
      console.warn(err);
    }
  }

  return {
    businessSetting,
    postBusinessSetting,
    loadBusinessSetting,
    setBusinessSetting,
  };
}
