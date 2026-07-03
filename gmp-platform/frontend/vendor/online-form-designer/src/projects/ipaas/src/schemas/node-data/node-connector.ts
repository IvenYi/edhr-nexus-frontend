import type { GctBpmnNode, NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import {
  BpmnNodeTypeEnum,
  ConnectorType,
  EndpointType,
  PanelStep,
} from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { NodeBizDataSchema } from '../../types';
import { AppTypes } from '../../enums';

export const NodeDataConstant: NodeDataSchema.Connector = {
  step: PanelStep.Connector,
  type: BpmnNodeTypeEnum.BpmnConnector,
  bizData: {
    nodeId: '',
    nodeName: '',
    nodeDescription: '',
    nodeConfig: {},
  },
};

export const NodeStepsConstant: PanelStep[] = [
  PanelStep.Connector,
  PanelStep.Setting,
  PanelStep.Test,
];

export const NodeStepsWhenConnectorApp: PanelStep[] = [
  PanelStep.Connector,
  PanelStep.Action,
  PanelStep.Setting,
  PanelStep.Test,
];

export function validator(node: GctBpmnNode.BpmnConnector): string[] {
  const connector = node.data?.connector;
  if (!connector) {
    return ['请选择连接器'];
  }
  const { endpointType, appType } = node.data?.bizData || {};
  const {
    appTag,
    authId,
    modelCategory,
    modelKey,
    bsKey,
    dataType,
    httpConfig,
    path,
    httpMethod,
    paramType,
    encode,
    baseDn,
    objectClass,
    apiId,
    body,
    functionName,
  } = node.data?.bizData?.nodeConfig || {};

  if (connector === ConnectorType.App) {
    if (!endpointType || !appType || (!authId && !appTag && !apiId)) return ['请选择应用'];
  }
  const msg: string[] = [];

  if (appTag) {
    if (!dataType) msg.push('请选择数据类型');
    if (!modelCategory) msg.push('请选择模型类型');
    if (!modelKey) msg.push('请选择模型');
    if (!bsKey) msg.push('请选择业务服务');
  }
  if (authId && endpointType === EndpointType.apiConnector) {
    if (httpConfig && (!httpConfig.protocol || !httpConfig.host)) msg.push('域名配置不能为空');
  }
  if (
    connector === ConnectorType.Http ||
    (connector === ConnectorType.App && authId && endpointType === EndpointType.apiConnector)
  ) {
    if (!path) msg.push('请求地址不能为空');
    if (!httpMethod) msg.push('请求方式不能为空');
    if (!paramType) msg.push('报文类型不能为空');
    if (!encode) msg.push('编码不能为空');
  }
  if (connector === ConnectorType.App && authId && endpointType === EndpointType.ldap) {
    if (!baseDn) msg.push('域范围不能为空');
    if (!objectClass) msg.push('搜索目标对象不能为空');
  }
  if (connector === ConnectorType.App && authId && endpointType === EndpointType.sapRfc) {
    if (!functionName) msg.push('调用函数名不能为空');
  }
  if (connector === ConnectorType.App && endpointType === EndpointType.platform) {
    if (!body[0]?.value) msg.push('参数不能为空');
  }
  if (connector === ConnectorType.Db) {
    const { dsKey, env, sql } = node.data?.bizData?.nodeConfig || {};
    if (!dsKey) msg.push('请选择数据源');
    if (!env) msg.push('请选择环境');
    if (!sql) msg.push('请输入执行SQL');
  }
  return msg;
}
