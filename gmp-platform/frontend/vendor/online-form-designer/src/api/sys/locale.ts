import { LocaleTypeListDto } from '/#/store';
import { I18nInfo, I18nPageListReq, I18nPageListRes } from '../model/localeModel';
import { defHttp } from '/@/utils/http/axios';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';
import { ProjectName } from '/@/enums/appEnum';
import { usePahtQueryStoreWithOut } from '/@/store/modules/pathQuery';
import { useBranch } from '/@/hooks/develop/useBranch';
import { useEnv } from '/@/hooks/develop/useEnv';

const { getEnv } = useEnv();
const { branchId } = useBranch();

const usePathQuery = usePahtQueryStoreWithOut();

enum Api {
  List = '/i18n-config/list',
  Update = '/i18n-config/',
  I18n = '/minio/locale-js/__platform__.json',
  PageList = '/i18n-info/page/list',
  Info = '/i18n-info',
  Edit = '/i18n-info/',
}

/**
 * @description: getLocaleList
 */
export function getLocaleListApi(): Promise<Array<LocaleTypeListDto>> {
  return defHttp.get({ url: Api.List });
}

/**
 * @description update locale api
 */
export function updateLocaleApi(params: string, data): Promise<any | null> {
  return defHttp.put({
    url: Api.Update,
    params,
    data,
  });
}

export function getI18nTranslate(locale?: string) {
  const { getCurrentProject } = usePermissionStoreWithOut();
  const aid = usePathQuery.getAid();
  if (locale) {
    const p = [
      defHttp.get(
        { url: `/minio/locale-js/${locale}__platform__.json` },
        { joinPrefix: false, isTransformResponse: false, ignore404: true },
      ),
    ];
    if (getCurrentProject === ProjectName.WEB_RENDER && aid) {
      // ignore404 跳过应用中i18n未初始化的情况
      const env = getEnv();
      const branch = env === 'dev' ? '_' + branchId.value : '';
      p.push(
        defHttp.get(
          { url: `/minio/${aid}/locale-js/${env==='sbx'?'prod':env}${branch}/${locale}__.json` },
          { joinPrefix: false, isTransformResponse: false, ignore404: true },
        ),
      );
    }
    return Promise.all(p).then((res) => res.filter((item) => item).join('\n'));
  }
  return defHttp.get({ url: Api.I18n }, { joinPrefix: false, isTransformResponse: false });
}

/**
 * @description 翻译管理 获取分页列表
 */
export function I18nPageListApi(params: I18nPageListReq): Promise<I18nPageListRes> {
  return defHttp.get({
    url: Api.PageList,
    params,
  });
}

/**
 * @description 翻译管理 删除接口
 */
export function I18nDeleteApi(params: { ids: string }): Promise<null> {
  return defHttp.delete(
    {
      url: Api.Info,
      params,
    },
    {
      joinParamsToUrl: true,
    },
  );
}

/**
 * @description 翻译管理 添加/修改接口
 */
export function I18nAddOrEditApi(params: string, data: I18nInfo): Promise<null> {
  return defHttp.put({
    url: Api.Edit,
    params,
    data,
  });
}
