import { reactive, computed } from 'vue';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';

export enum DeployModeEnum {
  STANDARD = 'STANDARD', // 标准部署
  INDEPENDENT_APP = 'INDEPENDENT_APP', // 独立应用部署
}

const deploySetting: {
  deployMode: DeployModeEnum;
} = reactive({
  deployMode: DeployModeEnum.STANDARD,
});

const isIndependentApp = computed(() => {
  return deploySetting.deployMode === DeployModeEnum.INDEPENDENT_APP;
});

function setDeploySetting(data: SysConfigResponse) {
  const { value } = data;
  if (!value) return;
  try {
    Object.assign(deploySetting, JSON.parse(value));
  } catch (err) {
    console.warn(err);
  }
}

export function useDeploySetting() {
  return {
    deploySetting,
    setDeploySetting,
    isIndependentApp,
  };
}
