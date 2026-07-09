import { defHttp } from '@/utils/http/axios';
import { SmsDto, ResponseEntityMap, ResponseEntitystring } from './model/index';

/**
 * 获取短信功能的签名与短信模板
 * import { postSmsGetSignsAndTemplates } from "/@/apis/gct-platform/SmsController"
 */
export async function postSmsGetSignsAndTemplates(data: SmsDto, config = {}): Promise<ResponseEntityMap['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/sms/getSignsAndTemplates`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 发送短消息
 * import { postSmsSendMsg } from "/@/apis/gct-platform/SmsController"
 */
export async function postSmsSendMsg(data: SmsDto, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/sms/sendMsg`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}