import { reactive, ref } from 'vue';
import { PlatformSettingEnum } from './types';
import { OrgConfig } from '/@/apis/gct-platform/model';
import { getPlatInfo, postPlatOrg } from '/@/apis/gct-platform/PlatformConfigController';
import { postPlatOrg as apaasPostPlatOrg } from '/@/apis/gct-apaas/PlatformConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';
import { cloneDeep } from 'lodash-es';

const orgSetting: OrgConfig = reactive({
  initialPassword: '123456',
  initialSignPassword: '12345678',
  initialSealPassword: '1234567',
  enableIdentifier: 1,
  enableDeleteAccount: 1,
  enableDeleteUser: 0,
  requiredFields: [],
  // supportLoginFields: ['username_', 'emp_no_'],
  supportLoginFields: ['username_'],
  extFieldConfigs: [],
  orgExtFieldConfigs: [],
});

const relationFields = ref([
  {
    label: 'extString0_',
    value: 'ext0',
    type: 1,
  },
  {
    label: 'extString1_',
    value: 'ext1',
    type: 1,
  },
  {
    label: 'extString2_',
    value: 'ext2',
    type: 1,
  },
  {
    label: 'extString3_',
    value: 'ext3',
    type: 1,
  },
  {
    label: 'extString4_',
    value: 'ext4',
    type: 1,
  },
  {
    label: 'extInt5_',
    value: 'ext5',
    type: 0,
  },
  {
    label: 'extInt6_',
    value: 'ext6',
    type: 0,
  },
  {
    label: 'extInt7_',
    value: 'ext7',
    type: 0,
  },
  {
    label: 'extInt8_',
    value: 'ext8',
    type: 0,
  },
  {
    label: 'extInt9_',
    value: 'ext9',
    type: 0,
  },
]);
const relationFiledsCopy = ref<
  {
    label: string;
    value: string;
  }[]
>([]);

const originRelationFields = cloneDeep(relationFields.value);

export function useOrgSetting(isPlatform = true) {
  // 获取详情
  // const getOrgConfig = async () => {
  //   const config = await getPlatInfo({ configEnum: PlatformSettingEnum.ORGANIZATION });
  //   if (config && config.value) {
  //     const value = JSON.parse(config.value);
  //     for (const k in value) {
  //       orgSetting[k] = value[k];
  //     }
  //   }
  // };

  // const handleOrgSave = async () => {
  //   await postPlatOrg(orgSetting);
  // };

  const postOrgSetting = async () => {
    const setting = JSON.parse(JSON.stringify(orgSetting));
    // setting.supportLoginFields = setting.supportLoginFields?.concat(['username_']);
    if (isPlatform) await postPlatOrg(setting);
    else await apaasPostPlatOrg(setting);
    await loadOrgSetting();
  };

  async function loadOrgSetting() {
    const res = await getPlatInfo({ configEnum: PlatformSettingEnum.ORGANIZATION });
    res && setOrgSetting(res);
  }

  function setOrgSetting(data: SysConfigResponse) {
    const { value } = data;
    if (!value) return;
    try {
      const setting = JSON.parse(value);
      // for (const key in setting) {
      //   if (key == 'supportLoginFields') {
      //     setting['supportLoginFields'] = setting['supportLoginFields'].filter(
      //       (i) => i !== 'username_',
      //     );
      //   }
      // }
      Object.assign(orgSetting, setting);

      if (orgSetting.extFieldConfigs && orgSetting.extFieldConfigs.length) {
        orgSetting.extFieldConfigs.forEach((element) => {
          relationFields.value = relationFields.value.filter((i) => {
            if (i.value == element.relationField) {
              relationFiledsCopy.value.push(i);
            }
            return i.value !== element.relationField;
          });
        });
      }

      orgSetting.orgExtFieldConfigs = JSON.parse(JSON.stringify(setting.extFieldConfigs));
    } catch (err) {
      console.warn(err);
    }
  }

  // getOrgConfig();

  return {
    orgSetting,
    loadOrgSetting,
    setOrgSetting,
    postOrgSetting,
    relationFields,
    relationFiledsCopy,
    originRelationFields,
  };
}
