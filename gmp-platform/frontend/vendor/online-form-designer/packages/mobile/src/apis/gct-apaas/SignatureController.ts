import request from '@mobile/utils/request';
import type { CheckPwdRequest, ResponseEntitystring, ResponseEntitySignatureResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 校验账号获取签名
 * import { postSignatureGetSignatureImage } from "/@/apis/gct-apaas/SignatureController"
 */
export async function postSignatureGetSignatureImage(data: CheckPwdRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/signature/getSignatureImage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 校验账号获取上传签名或手写签名
 * import { postSignatureGetSignatureUploadOrWriteImage } from "/@/apis/gct-apaas/SignatureController"
 */
export async function postSignatureGetSignatureUploadOrWriteImage(data: CheckPwdRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitySignatureResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/signature/getSignatureUploadOrWriteImage`,
      method: 'post',
      data,
      ...config,
    },
  );
}