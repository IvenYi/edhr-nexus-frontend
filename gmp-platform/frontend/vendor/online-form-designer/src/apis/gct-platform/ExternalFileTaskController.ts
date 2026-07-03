import { defHttp } from '@/utils/http/axios';
import { FileTaskStatus, ResponseEntitystring, FileTaskInfo } from './model/index';

/**
 * 根据文件ID查询文件信息
 * import { postFileTaskListExternal } from "/@/apis/gct-platform/ExternalFileTaskController"
 */
export async function postFileTaskListExternal(data: string[], config = {}): Promise<array['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/file-task/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新文件转换状态
 * import { postFileTaskStatusExternal } from "/@/apis/gct-platform/ExternalFileTaskController"
 */
export async function postFileTaskStatusExternal(data: FileTaskStatus, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/file-task/status`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postFileTaskSubmitExternal } from "/@/apis/gct-platform/ExternalFileTaskController"
 */
export async function postFileTaskSubmitExternal(data: FileTaskInfo, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/file-task/submit`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}