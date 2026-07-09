import { ToNode } from '../../param-tables/type';
import {
  AppAuthParamConfig,
  AppAuthSuccessExpression,
  ConnectorConfigRequest,
} from '/@/apis/gct-ipaas2/model';

export interface IConnectorDesignerController {
  /**
   * 设计连接器
   * @param data 连接器数据
   */
  design(data: any): Promise<boolean>;

  /**
   * 新建或修改配置信息
   * @param data
   * @return {*}
   */
  createOrUpdate(data: any): Promise<void>;
  /**
   * 表单校验
   * @param id
   * @return {*}
   */
  validateForm(): Promise<boolean>;
}

export interface IConnectorDesignerData extends ConnectorConfigRequest {
  // 鉴权参数
  __authPathParams: ToNode<AppAuthParamConfig>[];
  __authQueryParams: ToNode<AppAuthParamConfig>[];
  __authHeaderParams: ToNode<AppAuthParamConfig>[];
  __authBodyParams: ToNode<AppAuthParamConfig>[];

  // 鉴权入参
  __requestPathParams: ToNode<AppAuthParamConfig>[];
  __requestQueryParams: ToNode<AppAuthParamConfig>[];
  __requestHeaderParams: ToNode<AppAuthParamConfig>[];
  __requestBodyParams: ToNode<AppAuthParamConfig>[];

  // 鉴权成功参数
  __successParams: ToNode<AppAuthSuccessExpression>[];
}
