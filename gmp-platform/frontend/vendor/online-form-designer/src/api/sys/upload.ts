import { UploadApiResult } from './model/uploadModel';
import { defHttp } from '/@/utils/http/axios';
import { UploadFileParams } from '/#/axios';
import { useGlobSetting } from '/@/hooks/setting';

enum Api {
  UploadImg = '/file/upload/image',
}

const { apiUrl, urlPrefix } = useGlobSetting();

/**
 * @description: Upload interface
 */
export function uploadApi(
  params: UploadFileParams,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
) {
  return defHttp.uploadFile<UploadApiResult>(
    {
      url: Api.UploadImg,
      onUploadProgress,
    },
    params,
    {
      urlPrefix: urlPrefix,
      apiUrl: apiUrl,
      joinPrefix: true,
      joinApiUrl: true,
    },
  );
}
