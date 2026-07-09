import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, FileTaskStatus, FileTaskDTO } from './model/index';

/**
 * 立即开启文件转换任务
 * import { getFileTaskStart } from "/@/apis/gct-apaas/FileTaskController"
 */
export async function getFileTaskStart(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/file-task/start`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新文件转换状态
 * import { postFileTaskStatus } from "/@/apis/gct-apaas/FileTaskController"
 */
export async function postFileTaskStatus(data: FileTaskStatus, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file-task/status`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 新增生成PDF任务
 * import { postFileTaskSubmit } from "/@/apis/gct-apaas/FileTaskController"
 */
export async function postFileTaskSubmit(data: FileTaskDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/file-task/submit`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}