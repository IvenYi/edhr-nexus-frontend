import request from '@mobile/utils/request';
import type { ResponseEntityList消息设置VO, 发送消息DTO, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 根据类型获取消息设置列表 email 邮箱 dingtalk 钉钉 wecom 企业微信 feishu 飞书 system 站内信
 * import { getMessageSettingFindAllByType } from "/@/apis/gct-apaas/MessageSettingController"
 */
export interface getMessageSettingFindAllByTypeQueryInterface {
  type: string; // type
}
export async function getMessageSettingFindAllByType(params: getMessageSettingFindAllByTypeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityList消息设置VO['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-setting/findAllByType`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发送企业微信、钉钉、飞书、站内、邮件消息
 * import { postMessageSettingSendMessageByType } from "/@/apis/gct-apaas/MessageSettingController"
 */
export async function postMessageSettingSendMessageByType(data: 发送消息DTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-setting/sendMessageByType`,
      method: 'post',
      data,
      ...config,
    },
  );
}