import { defHttp } from '/@/utils/http/axios';
import { LoginParams, PasswordParams,UserSettigParams } from './model/useLogin';
import { ErrorMessageMode } from '/#/axios';

enum Api {
  Login = '/login/sign',
  GetUserInfo = '/user/info',
  ChangePassword = '/user/reset/pwd',
  UserSetting ='/user/settings'
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description userinfo
 */
export function getUserInfo() {
  return defHttp.get({ url: Api.GetUserInfo }, { errorMessageMode: 'none' });
}

/**
 * @description changePassword
 */
export function changePassword(data: PasswordParams) {
  return defHttp.post({
    url: Api.ChangePassword,
    data,
  });
}
/**
 * @description userSettings
 */
 export function updateUserSetting(data: UserSettigParams) {
  return defHttp.post({
    url: Api.UserSetting,
    data,
  });
}