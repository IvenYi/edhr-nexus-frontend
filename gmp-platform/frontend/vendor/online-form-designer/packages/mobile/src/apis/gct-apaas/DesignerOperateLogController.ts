import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseDesignerOperateLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 应用操作日志分页查询
 * import { getDesignerOperateLogPageList } from "/@/apis/gct-apaas/DesignerOperateLogController"
 */
export interface getDesignerOperateLogPageListQueryInterface {
  bizModel?: string; // 模块
  endTime?: string; // 截止时间
  keyword?: string; // 内容
  operateType?: string; // 操作类型
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  startTime?: string; // 开始时间
  username?: string; // 操作人
}
export async function getDesignerOperateLogPageList(params: getDesignerOperateLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDesignerOperateLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-operate-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}