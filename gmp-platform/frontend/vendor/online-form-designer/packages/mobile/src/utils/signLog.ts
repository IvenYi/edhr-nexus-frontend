import { getMobileBrowserFingerprint, getPageIdentification } from '@/hooks/event/userBrowser';
import { postSignLog } from '@mobile/apis/gct-platform/SignLogController';
import { useEnv } from '@mobile/utils/useEnv';

export const projectNameType = {
  portal: 'WORKTABLE',
  'backend-management': 'ENTERPRISE',
  'developer-center': 'DEVELOPER',
  'tenant-center': 'TENANT',
  'app-designer': 'APPDESIGN',
  'web-render': 'APPFRONT',
  web: 'APPFRONT',
};
const { getEnv } = useEnv();

export async function signLogRegister(type?, appId?, tenantId) {
  const session = sessionStorage.getItem('currentPlatOrAppId');
  const signWay = sessionStorage.getItem('signWay');
  const sessionData = JSON.parse(session) || {};
  const fingerprint = await getMobileBrowserFingerprint();
  const env = getEnv();
  const data = {
    appId,
    appIdOut: session ? sessionData.appId : '',
    changeApp: !!(appId && session && sessionData.appId && appId !== sessionData.appId),
    changePlatform:
      !(appId && session && sessionData.appId && tenantId !== sessionData.tenantId) &&
      !(appId && session && sessionData.appId && appId !== sessionData.appId),
    changeTenant: !!(
      tenantId &&
      session &&
      sessionData.tenantId &&
      tenantId !== sessionData.tenantId
    ),
    platformIn: type,
    platformOut: session ? sessionData.type : '',
    env,
    signWay: !(session && sessionData?.tenantId) && tenantId && signWay ? signWay : '',
    tenantIn: tenantId, // 切入租户
    tenantOut: session ? sessionData.tenantId : '', // 切出租户
  };
  await postSignLog(data, {
    headers: { pagetag: getPageIdentification(), browser: fingerprint },
  });
  if (!(session && sessionData?.tenantId) && tenantId && signWay) {
    sessionStorage.removeItem('signWay');
  }
  sessionStorage.setItem(
    'currentPlatOrAppId',
    JSON.stringify({
      appId,
      type,
      tenantId,
    }),
  );
}
