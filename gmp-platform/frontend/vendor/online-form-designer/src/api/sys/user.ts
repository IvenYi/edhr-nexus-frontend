import { defHttp } from '/@/utils/http/axios';
import { LoginParams, LoginResultModel, GetUserInfoModel } from './model/userModel';
import { useEnv } from '/@/hooks/develop/useEnv';
import { ErrorMessageMode } from '/#/axios';
import { getBrowserFingerprint, getPageIdentification } from '/@/hooks/event/userBrowser';

const { getEnv } = useEnv();
enum Api {
  Login = '/login/sign',
  Logout = '/login/signOut',
  GetUserInfo = '/user/info',
  GetPermCode = '/getPermCode',
  TestRetry = '/testRetry',
}

/**
 * @description: user login api
 */
export async function loginApi(
  params: LoginParams,
  mode: ErrorMessageMode = 'modal',
  authCode = 'ACCOUNT',
) {
  const fingerprint = await getBrowserFingerprint();
  defHttp.setHeader({
    browser: fingerprint,
    'Auth-Code': authCode,
  });
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
      displayError: true,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo }, { errorMessageMode: 'none' });
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}

export async function doLogout() {
  const session = sessionStorage.getItem('currentPlatOrAppId');
  const fingerprint = await getBrowserFingerprint();
  const env = getEnv();
  const pageIdentification = getPageIdentification();
  defHttp.setHeader({
    browser: fingerprint,
    pagetag: pageIdentification,
  });
  return defHttp.get({
    url: Api.Logout,
    params: {
      appId: session && JSON.parse(session).appId,
      platform: session && JSON.parse(session).type,
      env,
    },
  });
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  );
}
