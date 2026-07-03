import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 应用下所有子模型增加sortNum字段
 * import { postSubModelProcessAllSubModelDataClean } from "/@/apis/gct-apaas/SubModelProcessController"
 */
export async function postSubModelProcessAllSubModelDataClean(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sub-model-process/allSubModelDataClean`,
      method: 'post',
      ...config,
    },
  );
}