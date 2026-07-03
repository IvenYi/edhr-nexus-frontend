import request from './request';
/**模块分类 */
export enum MODULE_ENUMS {
  /**移动端 */
  MOBILE = 'mobile',
  /**平板端 */
  IPAD = 'ipad',
  /**eDHR */
  EDHR = 'edhr',
}
export async function getApkGetActiveApp(baseURL: string, config = {}): Promise<any> {
  return request({
    url: `/gct-platform/api/apk/getActiveApp`,
    method: 'get',
    baseURL,
    ...config,
  });
}
export async function getAppVersion(
  baseURL: string,
  moduleType: MODULE_ENUMS = MODULE_ENUMS.MOBILE,
): Promise<any> {
  return request({
    url: `/${moduleType}/version?` + Math.random(),
    method: 'get',
    baseURL,
  });
}

export async function getEdhrVersion(baseURL: string): Promise<any> {
  return request({
    url: `/edhr/version?` + Math.random(),
    method: 'get',
    baseURL,
  });
}
