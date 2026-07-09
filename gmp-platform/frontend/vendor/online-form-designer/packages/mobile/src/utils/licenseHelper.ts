import { getMobileBrowserFingerprint } from '@/hooks/event/userBrowser';
import { getLicenseGetUsers } from '/@/apis/gct-platform/LicenseController';
import { UserData } from '@mobile/stores/loginHooks';
import { useEnv } from '@mobile/utils/useEnv';

const { getEnv } = useEnv();

export async function checkLicense(appId: string, data: any = {}, config = {}) {
  let env = getEnv();
  if (['test', 'prod', 'sbx'].includes(env)) {
    env = data.env || env;
    const fingerprint = await getMobileBrowserFingerprint();

    const clientId = `mobile.${UserData.value?.userId}.${env}.${appId}.${
      UserData.value?.ip
    }.${fingerprint}.${new Date().getTime()}`;
    return getLicenseGetUsers({ appId, env, clientId }, config);
  }
  return null;
}
