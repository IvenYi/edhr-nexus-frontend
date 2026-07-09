import { postSignLog } from '/@/apis/gct-platform/SignLogController';
import { useEnv } from '/@/hooks/develop/useEnv';
import { getBrowserFingerprint, getPageIdentification } from '/@/hooks/event/userBrowser';
import { LoginTypeEnum } from '/@/hooks/platform/constants';

const { getEnv } = useEnv();

export const projectNameType = {
  portal: 'WORKTABLE',
  'backend-management': 'ENTERPRISE',
  'developer-center': 'DEVELOPER',
  'tenant-center': 'TENANT',
  'app-designer': 'APPDESIGN',
  'web-render': 'APPFRONT',
  web: 'APPFRONT',
  'bi-designer': 'APPDESIGN',
  ipaas: 'DEVELOPER',
};

export const eventTypeName = {
  0: 'sys.loginOut',
  1: 'sys.login',
};

export const signWayName = {
  CHANGE_PLATFORM: 'sys.platform.changePlatform',
  CHANGE_APP: 'sys.platform.changeApp',
  CHANGE_TENANT: 'sys.mobile.switchTenants',
  PC_SIGN_OUT: 'sys.platform.pcSignout',
  MOBILE_SIGN_OUT: 'sys.platform.mobileSignout',
  ACCOUNT_LOGIN: 'sys.platform.accountLogin',
  WECHAT_LOGIN: 'sys.platform.wechatLogin',
  MICROSOFT_LOGIN: 'sys.platform.microsoftLogin',
  DINGTALK_LOGIN: 'sys.platform.dingtalkLogin',
  FEISHU_LOGIN: 'sys.platform.feishuLogin',
  SMS_LOGIN: 'sys.mobileSignInFormTitle',
  CARD_LOGIN: 'sys.cardSignInFormTitle',
  AD_LOGIN: 'sys.adLogin',
  LOGIN: 'sys.loginOut',
};
export const platformName = {
  ENTERPRISE: 'sys.EnterpriseBackendManage',
  TENANT: 'sys.tenantBackendManage',
  DEVELOPER: 'sys.developCenter',
  WORKTABLE: 'sys.workbench',
  APPFRONT: 'sys.appDesigner.appFront',
  APPDESIGN: 'sys.model.appDesigner',
};

export const sourceName = {
  501: 'sys.portal.deviceWeb',
  502: 'sys.portal.deviceMobile',
  504: 'sys.portal.deviceMobile',
};

export async function signLogRegister(type?, appId?, tenantId) {
  const session = sessionStorage.getItem('currentPlatOrAppId');
  const signWay = sessionStorage.getItem('signWay');
  console.log('signWay--------------', signWay);
  const sessionData = JSON.parse(session) || {};
  const fingerprint = await getBrowserFingerprint();
  const env = getEnv();

  const data = {
    appId,
    appIdOut: session ? sessionData.appId : '',
    changeApp:
      !!(
        appId &&
        session &&
        sessionData.appId &&
        type === sessionData?.type &&
        appId !== sessionData?.appId
      ) ||
      !!(
        session &&
        type === JSON.parse(session).type &&
        appId !== JSON.parse(session).appId &&
        type === 'APPFRONT'
      ),
    changePlatform:
      ((!!(type && session && JSON.parse(session).type && type !== JSON.parse(session).type) ||
        !!(type && !session) ||
        !!(session && type === JSON.parse(session).type && type !== 'APPFRONT')) &&
        !(!(session && sessionData?.tenantId) && tenantId && signWay) &&
        !(tenantId && session && sessionData.tenantId && tenantId !== sessionData.tenantId)) ||
      (type !== 'APPFRONT' && !session && !(type === 'WORKTABLE' && !tenantId)),
    changeTenant: !!(
      tenantId &&
      session &&
      sessionData.tenantId &&
      tenantId !== sessionData.tenantId
    ),
    signWay:
      (!(session && sessionData?.tenantId) &&
        !(type === 'WORKTABLE' && !tenantId) &&
        signWay &&
        ((type === 'APPFRONT' && appId) || type !== 'APPFRONT')) ||
      (signWay == LoginTypeEnum.MICROSOFT + '_LOGIN' && tenantId)
        ? signWay
        : '',
    platformIn: type,
    platformOut: session ? sessionData?.type : '',
    env,
    tenantIn: tenantId, // 切入租户
    tenantOut: session ? sessionData?.tenantId : '', // 切出租户
  };
  await postSignLog(data, {
    transferToConfig: { headers: { pagetag: getPageIdentification(), browser: fingerprint } },
  });
  if (
    (!(session && sessionData?.tenantId) &&
      !(type === 'WORKTABLE' && !tenantId) &&
      signWay &&
      ((type === 'APPFRONT' && appId) || type !== 'APPFRONT')) ||
    (signWay == LoginTypeEnum.MICROSOFT + '_LOGIN' && tenantId)
  ) {
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
