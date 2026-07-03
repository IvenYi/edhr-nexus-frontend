import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 文件上传minio
 * import { postLdapUploadCertificate } from "/@/apis/gct-platform/LdapController"
 */
export async function postLdapUploadCertificate(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/ldap/upload/certificate`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}