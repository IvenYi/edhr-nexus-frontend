import { useMobileUpload } from '../hooks';
import { JSSDK } from '@mobile/utils/sdkAdapter';
import { UserData, MasterTenant } from '@mobile/stores/loginHooks';
import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
import type { UploadType, IUploadParams } from '../types';

/**
 * Paas初始化上传api配置
 */
export const initMobilePaasUploadApis = () => {
  const { setUploadApis } = useMobileUpload();
  /**
   * 设置上传api
   */
  setUploadApis({
    upload: (uploadType: UploadType, uploadParams: IUploadParams) => {
      JSSDK.run('Uploader', uploadParams, uploadType);
    },
    transfer: (filename: string): string => {
      if (!filename) return '';
      return `${MOBILE_MINIO_PATH.value}${!filename.startsWith('/') ? `/${filename}` : filename}`;
    },
  });
};

/** 获取移动端端配置信息 */
export const getConfigInfoByMobile = () => {
  return {
    defaultUserId: UserData?.value?.userId || null,
    defaultOrgId: MasterTenant?.value?.masterOrgId || null,
    defaultProductSearchFields: 'name_,code_',
  };
};
