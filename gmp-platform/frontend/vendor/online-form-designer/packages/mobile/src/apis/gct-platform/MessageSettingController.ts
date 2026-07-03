import request from '@mobile/utils/request';
import type { MessageSettingRequest, ResponseEntitystring, ResponseEntityMessageSettingCountResponse, ResponseEntityMessageSettingResponse, ResponseEntityListMessageSettingResponse, SendMessageRequest, ResponseEntityPageBaseMessageSettingResponse, SendEmailMessageRequest, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postMessageSetting } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSetting(data: MessageSettingRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMessageSetting } from "/@/apis/gct-platform/MessageSettingController"
 */
export interface deleteMessageSettingQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMessageSetting(params: deleteMessageSettingQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 获取各个类型的数据条数
 * import { getMessageSettingGetTypeCount } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function getMessageSettingGetTypeCount(config:AxiosRequestConfig = {}): Promise<ResponseEntityMessageSettingCountResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/getTypeCount`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getMessageSettingInfo } from "/@/apis/gct-platform/MessageSettingController"
 */
export interface getMessageSettingInfoQueryInterface {
  id: string; // id
}
export async function getMessageSettingInfo(params: getMessageSettingInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMessageSettingResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getMessageSettingList } from "/@/apis/gct-platform/MessageSettingController"
 */
export interface getMessageSettingListQueryInterface {
  type?: string; // type
}
export async function getMessageSettingList(params: getMessageSettingListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMessageSettingResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 调试用api测试发送MQTT消息
 * import { postMessageSettingMqttSend } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSettingMqttSend(data: SendMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/mqtt/send`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMessageSettingPageList } from "/@/apis/gct-platform/MessageSettingController"
 */
export interface getMessageSettingPageListQueryInterface {
  endTime?: string; // 结束时间
  key?: string; // key
  name?: string; // 名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  remark?: string; // 备注
  serviceType?: string; // 服务类型
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  type?: string; // 消息分类
}
export async function getMessageSettingPageList(params: getMessageSettingPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMessageSettingResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 测试发送邮箱消息
 * import { postMessageSettingSendEmailMessage } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSettingSendEmailMessage(data: SendEmailMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/sendEmailMessage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试发送企业微信、钉钉、飞书消息
 * import { postMessageSettingSendMessage } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSettingSendMessage(data: SendMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/sendMessage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putMessageSettingById } from "/@/apis/gct-platform/MessageSettingController"
 */
export interface putMessageSettingByIdPathInterface {
  id: string; // id
}
export async function putMessageSettingById(path: putMessageSettingByIdPathInterface, data: MessageSettingRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/message-setting/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}