import { useGctSelect } from '@gct/runtime-mobile-render';

export class GlobaAppInfo {
  /**环境变量 */
  static ENV: string;
  /**应用标识 */
  static AID: string;
  /**用户信息 */
  static userInfo: any;

  /**app初始化变量 */
  static runApp({ userInfo, env, aid }) {
    this.ENV = env;
    this.AID = aid;
    this.userInfo = userInfo;
  }
}

/**获取缓存变量 */
export const useCreateAppredis = ({ value: defaultValue, appredis, key: varKey, type }) => {
  const isredis = GlobaAppInfo.ENV !== 'dev' ? appredis : false;
  const key = `${GlobaAppInfo.AID}_${GlobaAppInfo.userInfo?.userId}`;
  const { cacheMap } = useGctSelect(key);
  const globalVar = new Proxy(
    { value: defaultValue, type },
    {
      get(target, name, receiver) {
        if (isredis && name === 'value') {
          return cacheMap.value[varKey];
        }
        return Reflect.get(target, name);
      },
      set(target, name, value, receiver) {
        if (isredis && name === 'value') {
          if (cacheMap.value[varKey]) {
            cacheMap.value[varKey] = value;
          } else {
            cacheMap.value = { ...cacheMap.value, [varKey]: value };
          }
        }
        return Reflect.set(target, name, value, receiver);
      },
    },
  );
  return globalVar;
};
