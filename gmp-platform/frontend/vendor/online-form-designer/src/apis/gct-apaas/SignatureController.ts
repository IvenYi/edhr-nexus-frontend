import { defHttp } from '@/utils/http/axios';
import { CheckPwdRequest, ResponseEntitystring, ResponseEntitySignatureResponse } from './model/index';

/**
 * 校验账号获取签名
 * import { postSignatureGetSignatureImage } from "/@/apis/gct-apaas/SignatureController"
 */
export async function postSignatureGetSignatureImage(data: CheckPwdRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/signature/getSignatureImage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 校验账号获取上传签名或手写签名
 * import { postSignatureGetSignatureUploadOrWriteImage } from "/@/apis/gct-apaas/SignatureController"
 */
export async function postSignatureGetSignatureUploadOrWriteImage(data: CheckPwdRequest, config = {}): Promise<ResponseEntitySignatureResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/signature/getSignatureUploadOrWriteImage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}