import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 文件上传minio
 * import { postLdapUploadCertificate } from "/@/apis/gct-platform/LdapController"
 */
export async function postLdapUploadCertificate(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/ldap/upload/certificate`,
      method: 'post',
      data,
      ...config,
    },
  );
}