import { defHttp } from '@/utils/http/axios';
import { MessageSettingRequest, ResponseEntitystring, ResponseEntityMessageSettingCountResponse, ResponseEntityMessageSettingResponse, ResponseEntityListMessageSettingResponse, SendMessageRequest, ResponseEntityPageBaseMessageSettingResponse, SendEmailMessageRequest, ResponseEntityboolean } from './model/index';

/**
 * 保存
 * import { postMessageSetting } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSetting(data: MessageSettingRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/message-setting`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteMessageSetting(params: deleteMessageSettingQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/message-setting`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 获取各个类型的数据条数
 * import { getMessageSettingGetTypeCount } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function getMessageSettingGetTypeCount(config = {}): Promise<ResponseEntityMessageSettingCountResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/message-setting/getTypeCount`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getMessageSettingInfo(params: getMessageSettingInfoQueryInterface = {}, config = {}): Promise<ResponseEntityMessageSettingResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/message-setting/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getMessageSettingList(params: getMessageSettingListQueryInterface = {}, config = {}): Promise<ResponseEntityListMessageSettingResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/message-setting/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 调试用api测试发送MQTT消息
 * import { postMessageSettingMqttSend } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSettingMqttSend(data: SendMessageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/message-setting/mqtt/send`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getMessageSettingPageList(params: getMessageSettingPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMessageSettingResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/message-setting/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试发送邮箱消息
 * import { postMessageSettingSendEmailMessage } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSettingSendEmailMessage(data: SendEmailMessageRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/message-setting/sendEmailMessage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试发送企业微信、钉钉、飞书消息
 * import { postMessageSettingSendMessage } from "/@/apis/gct-platform/MessageSettingController"
 */
export async function postMessageSettingSendMessage(data: SendMessageRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/message-setting/sendMessage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putMessageSettingById(path: putMessageSettingByIdPathInterface, data: MessageSettingRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/message-setting/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}