import request from '@mobile/utils/request';
import type { SmsDto, ResponseEntityMap, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取短信功能的签名与短信模板
 * import { postSmsGetSignsAndTemplates } from "/@/apis/gct-platform/SmsController"
 */
export async function postSmsGetSignsAndTemplates(data: SmsDto, config:AxiosRequestConfig = {}): Promise<ResponseEntityMap['data']> {
  return request(
    {
      url: `/gct-platform/api/sms/getSignsAndTemplates`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 发送短消息
 * import { postSmsSendMsg } from "/@/apis/gct-platform/SmsController"
 */
export async function postSmsSendMsg(data: SmsDto, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/sms/sendMsg`,
      method: 'post',
      data,
      ...config,
    },
  );
}