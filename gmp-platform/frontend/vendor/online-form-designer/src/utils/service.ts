import { defaults } from 'lodash-es';
import type { RequestOptions } from '/#/axios';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as modelGet,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as modelPost,
  putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as modelPut,
  deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as modelDelete,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { interceptor } from 'vxe-table';

/** 业务参数 */
interface BusinessParams {
  /** 服务方法名 */
  bsKey: string;
  /**
   * 模型类型
   * - view 视图模型
   * - entity 实体模型
   * - data 数据模型
   */
  modelCategory: 'view' | 'entity' | 'data';
  /** 模型key */
  modelKey: string;
}

/** 路径参数 */
interface PathParams {
  [key: string | symbol]: any;
}

/** body参数 */
interface BodyParams {
  [key: string | symbol]: any;
}

/** 配置参数 */
type ConfigParams = RequestOptions;

/** 列表查询接口通用参数 */
interface ListBodyParams {
  query?: Record<string, any>;
  exp?: string;
  pageNo?: number;
  pageSize?: number;
  sorts?: { sortfield: string; sortType: 'asc' | 'desc' }[];
  foreignFields?: string[];
}

/** 预置的列表查询接口 */
interface ListBusinessParams extends BusinessParams {
  /** 服务方法名 */
  bsKey: 'listByPage' | 'listAll';
}

/** 列表接口返回类型 */
interface ListResponse {
  data?: Array<IData>; // 数据
  dict?: Record<string, Record<string, string>>; // 字典
  pageNo: number; // 当前页码
  pageSize: number; // 每页记录数
  totalCount: number; // 总记录数
  totalPage: number; // 总页数
}

/** 服务工具类 */
export class ServiceInvoker {
  /** 默认的配置 */
  private defaultConfig: RequestOptions = {};
  constructor(opts?: { config?: ConfigParams }) {
    // 私有构造函数，防止外部实例化对象
    if (opts?.config) {
      this.defaultConfig = opts.config;
    }
  }
  /** 解析配置参数 */
  parseConfig(config?: ConfigParams) {
    return defaults({}, config, this.defaultConfig);
  }

  get(businessParams: BusinessParams, pathParams?: PathParams, config?: ConfigParams) {
    return modelGet(businessParams, pathParams as any, this.parseConfig(config)) as Promise<any>;
  }

  post(
    businessParams: BusinessParams,
    bodyParams: BodyParams,
    pathParams?: PathParams,
    config?: ConfigParams,
  ) {
    return modelPost(
      businessParams,
      bodyParams,
      pathParams as any,
      this.parseConfig(config),
    ) as Promise<any>;
  }

  put(
    businessParams: BusinessParams,
    bodyParams: BodyParams,
    pathParams?: PathParams,
    config?: ConfigParams,
  ) {
    return modelPut(
      businessParams,
      bodyParams,
      pathParams as any,
      this.parseConfig(config),
    ) as Promise<any>;
  }

  delete(
    businessParams: BusinessParams,
    pathParams: PathParams,
    bodyParams?: BodyParams,
    config?: ConfigParams,
  ) {
    return modelDelete(
      businessParams,
      bodyParams,
      pathParams as any,
      this.parseConfig(config),
    ) as Promise<any>;
  }

  list(
    businessParams: ListBusinessParams | BusinessParams,
    bodyParams: ListBodyParams,
    pathParams?: PathParams,
    config?: ConfigParams,
  ) {
    return this.post(businessParams, bodyParams, pathParams, config) as Promise<ListResponse>;
  }
}

/** 常规的调用 */
export const SERVICE_INVOKER = new ServiceInvoker();
/** 不弹报错提示的调用 */
export const SILENT_SERVICE_INVOKER = new ServiceInvoker({ config: { errorMessageMode: 'none' } });
