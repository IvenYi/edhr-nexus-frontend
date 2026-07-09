import { ref, computed, createVNode, watch } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { NodeDataSchemaMap } from '/@ipaas/schemas/node-data';
import { NodeBizDataSchemaMap } from '/@ipaas/schemas/node-biz-data';
import { cloneDeep, isEqual, pick } from 'lodash-es';
import { getBffFlowByFuuid } from '/@/apis/gct-ipaas/IpaasBackForFrontController';
import type { FlowMainResp, FlowVersionResp, BizFlowMainResp } from '/@/apis/gct-ipaas/model';
import {
  putFlowPublish,
  postFlowDef,
  getFlowDefByFuuidByVersion,
  putFlowDefByUuid,
  putFlowOnline,
  putFlowOffline,
  postFlowDefCopy,
} from '/@/apis/gct-ipaas/IpaasDataFlowController';
import {
  EndpointType,
  ConnectionFlowStatus,
  FlowCallLogStatusEnum,
  IPaaSNodeStatusMap,
  BpmnNodeTypeEnum,
} from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { useGctFlow, FlowNodeTypeEnum, GctFlowNode } from '@gct/flow';
import { message, Modal } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { randomString } from '/@ipaas/utils';
import JsonPathUtil from '/@ipaas/utils/JsonPathUtil.js';
import {
  getRuntimeDestroyContext,
  getRuntimeRandomId,
  postRuntimeValidWebSocketAndRunToSpecNode,
} from '/@/apis/gct-ipaas2/RunTimeController';
import { useGctIPaaSBpmn } from '@gct/flow/src/plugins/ipaas-bpmn';
import { ValueTypeEnum } from '../comps/components/ParameterStruct';
import { useGlobSetting } from '/@/hooks/setting';
import { AppTypes, ConditionOperatorEnum } from '../enums';
import { useUserStoreWithOut } from '/@/store/modules/user';

interface DebugNodeInfo {
  status?: FlowCallLogStatusEnum;
  time?: string;
  nodeId?: string;
  response?: any;
  message?: string;
  startTime?: number;
  endTime?: number;
  input?: any;
  output?: any;
  endpointType?: EndpointType;
}

const {
  addNode,
  deleteNodeById,
  setNodeSelected,
  gctFlowData,
  setReadonly,
  setInstMode,
  setNodeInstStatusMap,
  gctFlowDataMap,
  nodeSelectedId,
  flowSelectedId,
  gctFlowDataLastNode,
} = useGctFlow();
const { init, validateNode, validate } = useGctIPaaSBpmn();

const { t } = useI18n();
const userStore = useUserStoreWithOut();

const nodeId = ref<string | undefined>();
const fuuid = ref<string>('');
const fversion = ref<string>('');
const flowDefCreate = ref<boolean>(false);
const flowCategoryInfo = ref<any[]>([]);
const flowBasicInfo = ref<Partial<FlowMainResp>>({});
const flowVersions = ref<FlowVersionResp[]>([]);
const loading = ref<boolean>(false);
const socketId = ref<string>();
const debugNodeMap = ref<Record<string, DebugNodeInfo>>({});
const debugNodeInfo = ref<{
  completed?: 1 | 2; // 0：非调试状态；1：调试中；2 调试结束；
  nodeId?: string;
  flow?: string;
}>({});
const socketInst = ref();
const { host } = useGlobSetting();
const socketUrl = computed(() => {
  return (
    process.env.NODE_ENV === 'development'
      ? host
      : `${location.protocol}//${location.hostname}${location.port ? ':' + location.port : ''}`
  )?.replace('http', 'ws');
});
/**
 * appTag有值时表示是应用内部的连接流
 */
const appInfo = ref<{ appTag?: string; branchId?: string; env?: string; tenantId?: string }>({});
/**
 * 当前操作版本
 */
const flowVersionInfo = computed<FlowVersionResp | undefined>(() => {
  return flowVersions.value.find((item) => item.version === fversion.value);
});

/**
 * 当前上线版本
 */
// const flowVersionInfoOnline = computed<FlowVersionResp | undefined>(() => {
//   return flowVersions.value.find((item) => item.version === fversionOnline.value);
// });

/**
 * 当前版本只读
 */
const flowReadonly = computed<boolean>(() => {
  if (!flowVersionInfo.value) return false;
  return ![ConnectionFlowStatus.Draft, ConnectionFlowStatus.Init].includes(
    flowVersionInfo.value.statusStr as ConnectionFlowStatus,
  );
});
const setOnlineAvailable = computed<boolean>(() => {
  return flowVersions.value.every((item) => item.statusStr !== ConnectionFlowStatus.Online);
});

// 监听节点切换，切换时，校验节点信息
watch(nodeSelectedId, (id, oldId) => {
  if (oldId) {
    validNode(oldId);
  }
});

// 监听节点切换，切换时，校验节点信息
watch(flowSelectedId, (id, oldId) => {
  if (oldId) {
    validateNode(oldId, validateCaseNode);
  }
});

// 校验ipaas节点
function validNode(nodeId): boolean {
  const res = validateNode(nodeId, validateNodeByStep);
  return res.valid;
}

// 根据节点步骤数据校验相关项
function validateNodeByStep(node) {
  if (node.type === 'flow') return validateCaseNode(node);
  const validator = NodeDataSchemaMap[node.type].validator;
  return validator ? validator(node) : [];
}

function validateCaseNode(node) {
  const config = node.data?.bizData.nodeConfig;
  const elements = config?.elements;
  const tips: string[] = [];
  if (!node.data?.bizData?.nodeName) tips.push('条件名称不能为空');
  if (elements && elements.length && validateConditionEmpty(elements)) {
    tips.push('分支条件不完整');
  }
  return tips;
}

function validateConditionEmpty(data) {
  const res = data.some((e) => {
    if (e.type === 'condition') {
      const { left, right, operator } = e.element || {};
      if (
        operator === ConditionOperatorEnum.isNotNull ||
        operator === ConditionOperatorEnum.isNull
      ) {
        return !left;
      } else return !left || !right;
    } else if (e.type === 'conditionGroup' && e.element?.elements && e.element?.elements?.length) {
      return validateConditionEmpty(e.element.elements);
    }
    return false;
  });
  return res;
}

/**
 * 创建节点 data
 * @param type
 * @returns
 */
function createNodeData(type: BpmnNodeTypeEnum, bizType?: EndpointType, bizData?) {
  const data = cloneDeep(NodeDataSchemaMap[type].config);
  if (bizType) {
    data.bizData = createNodeBizData(bizType, bizData);
  } else if (BpmnNodeTypeEnum.BpmnApiResponse === type) {
    data.bizData = createNodeBizData(EndpointType.apiResponse, bizData);
  } else {
    const nodeId = bizData ? bizData.nodeId : randomString(16);
    data.bizData['nodeId'] = nodeId;
    data.bizData['nodeDescription'] = nodeId;
  }
  // else if (BpmnNodeTypeEnum.Switch === type) {
  //   data.bizData = createNodeBizData('switch');
  // }
  return data;
}

/**
 * 创建节点 bizData
 * @param type
 * @returns
 */
function createNodeBizData(type: string, bizData?) {
  const nodeId = bizData ? bizData.nodeId : randomString(16);
  const bData = NodeBizDataSchemaMap[type];
  const data = {
    ...cloneDeep(bData),
    nodeId,
    nodeName: bData?.nodeName || bizData?.nodeName || nodeId,
    nodeDescription: nodeId,
  };
  return data;
}

/**
 * 创建 apiresponse 节点
 * 不允许重复创建
 */
function addApiResponseNode() {
  const node = gctFlowData.value?.children.find(
    (item) => (item.data as NodeDataSchema.Base).type === BpmnNodeTypeEnum.BpmnApiResponse,
  );
  if (node) return;
  addNode(
    BpmnNodeTypeEnum.BpmnApiResponse,
    {
      data: createNodeData(BpmnNodeTypeEnum.BpmnApiResponse),
      allowDelete: false,
      allowNext: false,
    },
    (node) => {
      node.data.bizData.nodeId = node.id;
      node.data.bizData.nodeName = node.id;
      node.data.bizData.nodeDescription = node.id;
    },
  );
}

/**
 * 移除 apiresponse 节点
 */
function removeApiResponseNode() {
  const node = gctFlowData.value?.children.find(
    (item) => (item.data as NodeDataSchema.Base).type === BpmnNodeTypeEnum.BpmnApiResponse,
  );
  if (node) {
    deleteNodeById(node.id);
  }
}

/**
 * 加载连接流信息
 * @param id
 * @returns
 */
async function loadFlow(id: string) {
  if (!id) return;
  fuuid.value = id;
  const res: any = await getBffFlowByFuuid({ fuuid: id });
  Object.assign(flowBasicInfo.value, res.flow ?? {});

  flowCategoryInfo.value = res.currentCategoryList ?? [];
  // flowVersionInfo.value = res.currentVersion ?? {};
  fversion.value = res.currentVersion.version ?? '';
  flowVersions.value = res.versions ?? [];

  await loadFlowChart();
}

/**
 * 加载版本列表
 * @param id
 * @returns
 */
async function loadFlowVersions() {
  if (!fuuid.value) return;
  const res: BizFlowMainResp = await getBffFlowByFuuid({ fuuid: fuuid.value });
  flowVersions.value = res.versions ?? [];
}

/**
 * 基于指定版本创建新版本
 * @param version
 */
async function createFlowVersion(version: string) {
  await postFlowDefCopy({
    fuuid: fuuid.value,
    version,
  });
  message.success(t('sys.operationSuccess'));
  loadFlowVersions();
}

function setAttrValue(targetObj, valueObj) {
  Object.entries(valueObj).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(targetObj, key)) {
      targetObj[key] = value;
    }
  });
}

// 老数据修正
function revisedData(flow: GctFlowNode.Flow, metaElements: any[]): GctFlowNode.Flow {
  const data = Array.isArray(flow) ? flow : [flow];
  data.forEach((item) => {
    if (item.type === 'app') {
      item.type = item.data.type;
      const { type, bizData } = item.data;
      if (type === BpmnNodeTypeEnum.BpmnConnector && bizData?.nodeConfig.authId) {
        bizData.endpointType = EndpointType.apiConnector;
      }
    }
    if (item.type === 'connector') {
      if (!item.data.bizData.appType) {
        // 给之前的应用连接器-增加一个内外部应用的标识
        if (item.data?.bizData?.endpointType === EndpointType.modelBs) {
          item.data.bizData.appType = AppTypes.Internal;
        } else if (item.data?.bizData?.endpointType === EndpointType.apiConnector) {
          item.data.bizData.appType = AppTypes.External;
        }
      }
      // 导入数据的连接器节点里的环境信息可能是错误的，修正成当前环境信息
      const metaELe = metaElements.find((e) => e.nodeId === item.data?.bizData?.nodeId);
      if (metaELe && metaELe?.nodeConfig) {
        const { appTag, branchId, env, tenantId, platformAppId } = metaELe.nodeConfig;
        const nodeConfig = item.data.bizData.nodeConfig;
        // 导入到应用里的连接流，需要修正为当前应用的env、branchId、platformAppId、appTag、tenantId
        if (nodeConfig)
          setAttrValue(nodeConfig, { appTag, branchId, env, tenantId, platformAppId });
      }
    }
    item.children && revisedData(item.children, metaElements);
  });
  return flow;
}

/**
 * 加载连接流定义
 */
async function loadFlowChart() {
  try {
    loading.value = true;
    const res = await getFlowDefByFuuidByVersion({
      fuuid: fuuid.value,
      version: fversion.value,
    });

    // 根据状态 设置只读
    if (
      [ConnectionFlowStatus.Draft, ConnectionFlowStatus.Init].includes(
        flowVersionInfo.value?.statusStr as ConnectionFlowStatus,
      )
    ) {
      // 获取调试socket唯一标识
      getUniqueKey();
      setReadonly(false);
    } else {
      setReadonly(true);
    }

    if (res?.viewMetaZip) {
      const nodeFlows = JSON.parse(res.viewMetaZip ?? '{}');

      console.log('nodeFlows');
      console.log(nodeFlows);

      // setGctFlowData(nodeFlows);
      init(revisedData(nodeFlows, res.meta?.elements || []));
      console.log('修正后的nodeFlows', nodeFlows);
      flowDefCreate.value = false;
    } else {
      const node: any = addNode(
        BpmnNodeTypeEnum.BpmnTrigger,
        {
          data: createNodeData(BpmnNodeTypeEnum.BpmnTrigger),
          allowDelete: false,
        },
        (node) => {
          node.data.bizData.nodeId = node.id;
          node.data.bizData.nodeName = node.id;
          node.data.bizData.nodeDescription = node.id;
        },
      );
      flowDefCreate.value = true;
      setNodeSelected(node.id);
    }
    // setNodeSelected(gctFlowData.value?.children[0].id);
  } catch (err) {
    console.warn(err);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 150);
  }
}

/**
 * 切换版本
 * @param version
 * @returns
 */
async function toggleVersion(version: string) {
  if (version === fversion.value) return;
  fversion.value = version;
  setInstMode(false);
  setNodeInstStatusMap({});
  loadFlowChart();
}

// 传给后端的数据，不需要flow层
const handleElementsData = (list) => {
  list.forEach((e) => {
    e.childNodes = cloneDeep(e.children);
    e.children && delete e.children;
    if (e.childNodes && e.childNodes.length) {
      e.childNodes = handleElementsData(e.childNodes);
    }
  });
  return list.filter((e) => e.type !== 'flow');
};

function returnBodyConfig(data) {
  if (data && data.length === 1 && data[0].valueType === ValueTypeEnum.EXPRESSION) {
    return data;
  }
  return (data[0]?.children ?? [])
    .filter((e) => !(e.key === 'query' && e.keyType === 'Object'))
    .map((item) => JsonPathUtil.toList(item, '', data[0].keyType === 'Array'))
    .flat();
}

/**
 * 转换sapRfc的import和tables数据
 * @param data
 * @return {*}
 */
function returnRfcConfig(data) {
  if (data && data.length === 1 && data[0].valueType === ValueTypeEnum.EXPRESSION) {
    return data;
  }
  return (data[0]?.children ?? [])
    .map((item) => JsonPathUtil.toRfcList(item, '', data[0].keyType === 'TABLES'))
    .flat();
}

/**
 * 重新构造树结构
 * @param elements
 * @returns
 */
const _rebuildElementsTree = (elements: GctFlowNode.Basic[]): any[] => {
  return elements.map((node) => {
    if (
      node.type === FlowNodeTypeEnum.Flow &&
      ![EndpointType.if, EndpointType.else, EndpointType.pipeline].includes(
        node.data?.bizData?.endpointType,
      )
    ) {
      const newNode = node.children[0]?.data.bizData;
      // debugger;
      if (newNode) {
        newNode.childNodes = _rebuildElementsTree(node.children[0].children || []);
      }
      return newNode;
    }

    const newNode = node.data.bizData;

    if (newNode.nodeConfig?.body) {
      const queryChildren = newNode.nodeConfig?.body[0]?.children?.filter(
        (e) => e.key === 'query' && e.keyType === 'Object',
      )[0]?.children;
      if (queryChildren && queryChildren.length) {
        newNode.nodeConfig.query = queryChildren
          .map((item) => JsonPathUtil.toList(item, '', false))
          .flat();
      }
      newNode.nodeConfig.body = returnBodyConfig(newNode.nodeConfig?.body);
    }

    if (newNode.nodeConfig?.outputBody) {
      newNode.nodeConfig.outputBody = returnBodyConfig(newNode.nodeConfig?.outputBody);
    }

    if (newNode.nodeConfig?.imports?.length) {
      newNode.nodeConfig.imports = returnRfcConfig(newNode.nodeConfig?.imports);
    }
    if (newNode.nodeConfig?.tables?.length) {
      newNode.nodeConfig.tables = JsonPathUtil.toRfcList(newNode.nodeConfig?.tables[0], '', false);
    }

    // 修正导入的连接流，配置信息中的tenantId
    // if (newNode.nodeConfig?.tenantId) {
    //   newNode.nodeConfig.tenantId = userStore.tenantId;
    // }

    if (node.children) {
      newNode.childNodes = _rebuildElementsTree(node.children).filter((e) => !!e);
    }

    return newNode;
  });
};

/**
 * 保存
 */
async function _save() {
  const { valid } = await validate(validateNodeByStep);
  if (!valid) {
    message.warn('流程配置不完整，请检查');
    return Promise.reject();
  }
  // const nodeTreeData = traverseAndBuildTree(gctFlowData.value?.children ?? [], (node) => {
  //   const nodeData = node.data as NodeDataSchema.Base;
  //   const element = cloneDeep(nodeData.bizData);
  //   const { body, outputBody } = element.nodeConfig ?? {};
  //   if (body && body.length > 0) {
  //     element.nodeConfig.body = (body[0].children ?? [])
  //       .map((item) => JsonPathUtil.toList(item))
  //       .flat();
  //   }
  //   if (outputBody && outputBody.length > 0) {
  //     element.nodeConfig.outputBody = (body[0].children ?? [])
  //       .map((item) => JsonPathUtil.toList(item))
  //       .flat();
  //   }
  //   return element;
  // });
  // let elements = cloneDeep(nodeTreeData);
  // elements = handleElementsData(elements);
  // 解决导入的连接流，webhook节点的path字段没有更新的问题
  const webhookNode = gctFlowData.value?.children[0];
  if (webhookNode && webhookNode.data?.bizData?.nodeConfig?.path) {
    webhookNode.data.bizData.nodeConfig.path = `/${fuuid.value}`;
  }
  const elements = _rebuildElementsTree(cloneDeep(gctFlowData.value?.children ?? []));
  console.log('elements', elements);
  // return;
  const params = {
    tenantId: 'flow_save_tenantId',
    flowUuid: fuuid.value,
    flowName: flowBasicInfo.value.name,
    version: fversion.value,
    meta: { elements },
    viewMetaZip: JSON.stringify(gctFlowData.value),
  };

  if (flowDefCreate.value) {
    await postFlowDef(params);
  } else {
    await putFlowDefByUuid({ uuid: fuuid.value }, params);
  }
}

/**
 * 保存
 */
async function save() {
  await _save();
  message.success(t('sys.saveSuccess'));
  loadFlowVersions();
}

/**
 * 保存并发布
 */
async function saveAndPublish() {
  await _save();
  await putFlowPublish({
    fuuid: fuuid.value,
    version: fversion.value,
  });
  destroyDebugContext(false);
  message.success('保存并发布成功');
  loadFlowVersions();
}

/**
 * 发布
 */
async function setPublish() {
  await putFlowPublish({
    fuuid: fuuid.value,
    version: fversion.value,
  });
  message.success(t('sys.app.publish.SUCCESS'));
  // 发布成功以后更新版本列表
  loadFlowVersions();
}

async function setPublishAndOnline() {
  await putFlowPublish({
    fuuid: fuuid.value,
    version: fversion.value,
  });
  await putFlowOnline({
    fuuid: fuuid.value,
    version: fversion.value,
  });
  message.success(t('sys.operationSuccess'));
  // 发布成功以后更新版本列表
  loadFlowVersions();
}

async function _setOnline(version?: string) {
  await putFlowOnline({
    fuuid: fuuid.value,
    version: version ?? fversion.value,
  });
  message.success('上线成功');
  // 发布成功以后更新版本列表
  loadFlowVersions();
}
async function setOnline(version?: string) {
  if (version) {
    _setOnline(version);
    return;
  }
  Modal.confirm({
    title: '确认上线该版本？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: t('sys.ok'),
    cancelText: t('sys.cancel'),
    async onOk() {
      _setOnline(version);
    },
    onCancel() {},
  });
}

async function _setOffline(version?: string) {
  await putFlowOffline({
    fuuid: fuuid.value,
    version: version ?? fversion.value,
  });
  message.success('下线成功');
  // 发布成功以后更新版本列表
  loadFlowVersions();
}

async function setOffline(version?: string) {
  if (version) {
    _setOffline(version);
    return;
  }
  Modal.confirm({
    title: '确认下线该版本？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: t('sys.ok'),
    cancelText: t('sys.cancel'),
    async onOk() {
      _setOffline(version);
    },
    onCancel() {},
  });
}

// 获取 socket唯一标识
async function getUniqueKey() {
  const uniqueId = await getRuntimeRandomId();
  socketId.value = `debug_${fuuid.value}_${uniqueId}`;
  postSocket();
}

function validateNodeByIds(nodeId) {
  // console.log('gctFlowData', gctFlowData.value);
  // 暂时没有分支节点的逻辑
  const idx = gctFlowData.value.children.findIndex((e) => e.data.bizData?.nodeId === nodeId);
  const nodes = gctFlowData.value.children.slice(0, idx + 1);
  const ids = nodes.map((e) => e.id);
  const isValid = ids.every((e) => validNode(e));
  if (!isValid) {
    message.warn('流程配置不完整，请检查');
    return Promise.reject();
  }
  return Promise.resolve();
}

// 创建调试上下文
async function createDebugContext(nodeId, config) {
  // await validateNodeByIds(nodeId);
  const { valid } = await validate(validateNodeByStep);
  if (!valid) {
    message.warn('流程配置不完整，请检查');
    return Promise.reject();
  }
  setInstMode(false);
  debugNodeMap.value = {};
  if (!socketInst.value) await postSocket();
  const jsonData = getFlowJson();
  const elements = jsonData.meta.elements;
  const debugFirstNode = {
    ...elements[0],
    endpointType: 'debugConsumer',
    nodeConfig: {
      ...elements[0].nodeConfig,
      ...config,
    },
  };
  const flow = JSON.stringify({
    ...jsonData,
    meta: {
      ...jsonData.meta,
      elements: [debugFirstNode].concat(elements.slice(1)),
    },
  });
  const updated = debugNodeInfo.value.flow ? !isEqual(flow, debugNodeInfo.value.flow) : undefined;
  debugNodeInfo.value = { nodeId, completed: 1, flow };
  try {
    await postRuntimeValidWebSocketAndRunToSpecNode(
      {
        clientId: socketId.value,
        debugModel: 'multi',
        debugNodeIds: [nodeId],
        flow,
        updated,
      },
      {
        transferToConfig: {
          headers: {
            'App-Tag': appInfo.value.appTag,
            'Branch-Id': appInfo.value.branchId,
            Env: appInfo.value.env,
          },
        },
      },
    );
  } catch (error) {
    // debugNodeInfo.value.completed = 2;
    destroyDebugContext(false);
  }
}

// 销毁调试上下文
async function destroyDebugContext(hasMsg = true) {
  if (!socketId.value) return Promise.resolve();
  await getRuntimeDestroyContext({ clientId: socketId.value! });
  debugNodeInfo.value = {};
  debugNodeMap.value = {};
  hasMsg && message.success('退出调试成功');
  setInstMode(false);
  setNodeInstStatusMap({});
}

// 调试节点的结果map
function getNodeStatusMap() {
  const nodeIdToIdMap = Object.entries(gctFlowDataMap.value).reduce((total, [key, value]) => {
    const nodeId = value.node.data.bizData.nodeId;
    total[nodeId] = key;
    return total;
  }, {});
  return Object.entries(debugNodeMap.value).reduce((obj, [key, value]) => {
    obj[nodeIdToIdMap[key]] = {
      status: IPaaSNodeStatusMap[value.status!],
      data: {
        ...value,
        approveStatus: IPaaSNodeStatusMap[value.status!],
      },
    };
    return obj;
  }, {});
}

function setParentNodeDebugStatus(nodeId) {
  const pIds = gctFlowDataMap.value[nodeId]?.pIds;
  if (pIds && pIds.length) {
    pIds.forEach((id) => {
      if (!debugNodeMap.value[id]) {
        // 条件节点、并行节点，调试时，若经过子节点，则父节点必经过，手动将父节点状态塞到map中
        debugNodeMap.value[id] = {
          status: FlowCallLogStatusEnum.Success,
          input: gctFlowDataMap.value[id]?.node,
        };
      }
    });
  }
}

// 创建连接
function postSocket() {
  if (socketInst.value) socketInst.value.close();
  return new Promise((resolve, reject) => {
    socketInst.value = new WebSocket(`${socketUrl.value}/gct-ipaas/runtime/${socketId.value}`);
    socketInst.value.onopen = () => {
      console.log('连接流socket连接成功', new Date().getTime());
      resolve(true);
    };
    socketInst.value.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('ws success', data);
      let status = data.status ? FlowCallLogStatusEnum.Success : FlowCallLogStatusEnum.Failure;

      // 添加进行中的状态
      if (data.type === 'BEFORE_PROCESS') {
        status = FlowCallLogStatusEnum.Pending;
      }
      const detail = {
        status: status,
        startTime: data.startTime,
        endTime: data.endTime,
        message: data.exceptionCause,
        input: cloneDeep(data.input),
        output: cloneDeep(data.output),
        endpointType: data.endpointType,
      };
      debugNodeMap.value[data.nodeId] = detail;
      setParentNodeDebugStatus(data.nodeId);
      // const lastNodeId = gctFlowDataLastNode.value?.data?.bizData?.nodeId;
      if (
        data.nodeId === debugNodeInfo.value.nodeId ||
        !data.status ||
        data.status === 'finished'
      ) {
        debugNodeInfo.value.completed = 2;
      }
      const map = getNodeStatusMap();
      setInstMode(true);
      setNodeInstStatusMap(map);
    };
    socketInst.value.onclose = () => {
      console.log('连接流socket已关闭', new Date().getTime());
      socketInst.value = '';
    };
    socketInst.value.onerror = (e) => {
      console.log('连接流socket连接失败', e);
      reject('连接流socket连接失败');
    };
  });
}

// 销毁连接
async function clearSocket() {
  await destroyDebugContext(false);
  if (socketInst.value) socketInst.value.close();
  socketInst.value = '';
  socketId.value = '';
}

// 返回调试时后端需要的节点信息
function getFlowJson() {
  const elements = _rebuildElementsTree(cloneDeep(gctFlowData.value?.children ?? []));
  return {
    tenantId: 'flow_save_tenantId',
    flowUuid: fuuid.value,
    flowName: flowBasicInfo.value.name,
    version: fversion.value,
    meta: { elements },
    // viewMetaZip: JSON.stringify(gctFlowData.value),
  };
}

function onNodeCreated(node) {
  node.data = createNodeData(node.type, node.data?.bizData?.endpointType, node.data?.bizData);
  return node.data;
}

function setAppInfo(info) {
  appInfo.value = info;
}

export function useFlow() {
  function setNodeId(id: string) {
    nodeId.value = id;
  }

  return {
    loadFlow,
    loadFlowVersions,
    loading,
    fuuid,
    fversion,
    flowDefCreate,
    flowBasicInfo,
    flowVersions,
    flowVersionInfo,
    flowCategoryInfo,
    flowReadonly,

    toggleVersion,
    save,
    setPublish,
    setOnline,
    setOnlineAvailable,
    setOffline,
    setPublishAndOnline,
    saveAndPublish,

    createFlowVersion,

    nodeId,
    setNodeId,

    addApiResponseNode,
    removeApiResponseNode,
    createNodeData,
    createNodeBizData,

    clearSocket,
    debugNodeInfo,
    debugNodeMap,
    createDebugContext,
    destroyDebugContext,
    revisedData,

    onNodeCreated,
    appInfo,
    setAppInfo,
  };
}
