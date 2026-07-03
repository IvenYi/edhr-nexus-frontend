import { useGctFlow } from '@gct/flow';
import { useGctPaasBpmn } from '@gct/flow/src/plugins/paas-bpmn';
import { computed, ref, unref, watch } from 'vue';
import { randomId } from '@gct/flow/src/utils/NodeGenerator';
import { message } from 'ant-design-vue';
import {
  ApproveWayEnum,
  BpmnNodeTypeEnum,
  ButtonTypeEnum,
  DismissRuleEnum,
  DismissToEnum,
  OpinionTypeEnum,
} from '@gct/flow/src/plugins/paas-bpmn/enums';
import { useRoute } from 'vue-router';
import { getPmProcessDefinitionInfo } from '/@/apis/gct-apaas/PmProcessDefinitionController';
import {
  ProcessDefinitionVerListResponse,
  PmProcessDefinition,
  ProcessDefinitionVersionResponse,
} from '/@/apis/gct-apaas/model';
import { IGctBpmnEventConfig } from '@gct/flow/src/plugins/paas-bpmn/types';
import {
  getPmProcessDefinitionVersionList,
  getPmProcessDefinitionVersionById,
  postPmProcessDefinitionVersionCopyById,
  deletePmProcessDefinitionVersion,
  postPmProcessDefinitionVersion,
  postPmProcessDefinitionVersionSave,
  postPmProcessDefinitionVersionSaveAndDeploy,
  postPmProcessDefinitionVersionUpdateProcessUser,
} from '/@/apis/gct-apaas/PmProcessDefinitionVersionController';
import { BpmnVersionStatusEnum } from '../constants';
import { pick } from 'lodash-es';

const { nodeSelectedId, nodeSelectedData, gctFlowData, setReadonly } = useGctFlow();
const { validateNode, init, addNode, resetGctFlowData, validate, toBpmnData } = useGctPaasBpmn();

const ButtonEventsForNode = {
  [BpmnNodeTypeEnum.BpmnSubmit]: [
    {
      type: ButtonTypeEnum.Resubmit,
      enable: true,
    },
    {
      type: ButtonTypeEnum.End,
      enable: false,
    },
    {
      type: ButtonTypeEnum.Withdraw,
      enable: false,
    },
  ],
  [BpmnNodeTypeEnum.BpmnApproval]: [
    {
      type: ButtonTypeEnum.Approve,
      enable: true,
      signature: true,
    },
    {
      type: ButtonTypeEnum.Refuse,
      enable: true,
      signature: false,
    },
    {
      type: ButtonTypeEnum.Reassign,
      enable: false,
      signature: false,
    },
    {
      type: ButtonTypeEnum.Countersign,
      enable: false,
      signature: true,
    },
    {
      type: ButtonTypeEnum.Reject,
      enable: false,
      signature: false,
      dismissTo: DismissToEnum.StartNode,
      dismissRule: DismissRuleEnum.ReApprove,
    },
  ],
};
export interface Global {
  id: string;
  type: string;
  data: {
    type?: string;
    push: Array<{ type: string; key?: string }>;
    builtinMsgEnabled: number;
    events?: Array<IGctBpmnEventConfig>;
    webPageOption: boolean;
    webPageKey: string;
    webViewPageKey: string;
    mobilePageOption: boolean;
    mobilePageKey: string;
    mobileViewPageKey: string;
  };
}
const globalData = ref<Global>({
  id: randomId(),
  type: 'global',
  data: {
    type: 'global',
    push: [{ type: 'system' }],
    builtinMsgEnabled: 1,
    webPageOption: true,
    webPageKey: '',
    webViewPageKey: '',
    mobilePageOption: false,
    mobilePageKey: '',
    mobileViewPageKey: '',
  },
});
const processId = ref<string>('');
const processInfo = ref<PmProcessDefinition>({});
const versionList = ref<ProcessDefinitionVerListResponse[]>([]);
const curVersionId = ref<string>();
const curVersionInfo = ref<ProcessDefinitionVersionResponse>({});
const isFrontPage = ref<boolean>(false);
const readonlyFlow = ref(false);

/**
 * 非草稿状态 只读
 */
const bpmnReadonly = computed(() => {
  if (readonlyFlow.value) return true;
  if (!curVersionInfo.value?.status) return false;
  return curVersionInfo.value?.status !== BpmnVersionStatusEnum.DRAFT;
});

// 监听节点切换，切换时，校验节点信息
watch(nodeSelectedId, (id, oldId) => {
  if (oldId) {
    validateNode(oldId, validateTargetUserConfig);
  }
});

watch(
  () => curVersionId.value,
  (val) => {
    curVersionInfo.value = {};
    resetGctFlowData();
    if (val) {
      loadVersionInfo();
    }
  },
);

// 流程只读
function bpmnSetReadonly() {
  setReadonly(!!bpmnReadonly.value);
}

// 初始化时，添加提交和结束节点，这里需要给节点添加默认值
function addPaasBpmnNode() {
  resetGctFlowData();
  addNode(BpmnNodeTypeEnum.BpmnSubmit, {
    allowDelete: false,
    data: {
      ...addNodeDefaultValue({ type: BpmnNodeTypeEnum.BpmnSubmit }),
    },
  });
  addNode(BpmnNodeTypeEnum.BpmnApproval, {
    data: {
      ...addNodeDefaultValue({ type: BpmnNodeTypeEnum.BpmnApproval }),
    },
  });
  addNode(BpmnNodeTypeEnum.BpmnEnd, {
    allowDelete: false,
    allowNext: false,
  });
}

/**
 * 创建节点后，给节点添加默认值
 * @param node
 */
function onNodeCreated(node) {
  // 给节点添加默认值
  addNodeDefaultValue(node.data);
}

function addNodeDefaultValue(data) {
  if (!data.buttonConfig) {
    // 初始化按钮权限的默认值
    const buttons = ButtonEventsForNode[data.type];
    if (buttons) {
      data.buttonConfig = buttons.map((e) => {
        return {
          ...e,
          alias: $t(`sys.process.paasBpmnButtonEvent.${e.type}`),
        };
      });
      // console.log('初始化按钮权限的默认值', data.buttonConfig);
    }
  }
  if (!data.approveWay) data.approveWay = ApproveWayEnum.ApprovedByOne;
  if (!data.opinionConfig) {
    data.opinionConfig = {
      enable: true,
      opinionType: OpinionTypeEnum.Required,
    };
  }
  return data;
}

// 加载版本列表
async function loadVersionList() {
  versionList.value =
    (await getPmProcessDefinitionVersionList({ procDefId: processInfo.value.id! })) || [];
  if (!curVersionId.value) curVersionId.value = versionList.value[0]?.id || '';
}

// 加载版本详情
async function loadVersionInfo() {
  const res = (await getPmProcessDefinitionVersionById({ id: curVersionId.value })) || {};
  curVersionInfo.value = res;
  globalData.value.data = {
    type: 'global',
    push: res.push ? JSON.parse(res.push) : [{ type: 'system' }],
    builtinMsgEnabled: res.builtinMsgEnabled || 1,
    webPageOption: res.webPageOption === 0 ? false : true,
    mobilePageOption: res.mobilePageOption === 0 ? false : true,
    ...pick(res, ['webPageKey', 'webViewPageKey', 'mobilePageKey', 'mobileViewPageKey']),
  };
  if (curVersionInfo.value.json) {
    const { processApproveUsers, processMessageUsers } = res;
    const users = [...(processApproveUsers || []), ...(processMessageUsers || [])];
    const json = JSON.parse(curVersionInfo.value.json);
    users.length && setNodeUsers(json.children, users);
    init(json);
  } else if (curVersionId.value) {
    addPaasBpmnNode();
  }
  bpmnSetReadonly();
}

// 复显审批人和消息推送人
function setNodeUsers(json, users) {
  json.forEach((e) => {
    const nUser = users.find((f) => f.nodeId === e.id);
    if (nUser) {
      e.data['targetUserConfig'] = nUser.config;
    }
    if (e.children && e.children.length) {
      setNodeUsers(e.children, users);
    }
  });
}

// 切换当前版本
function toggleVersion(id) {
  curVersionId.value = id;
}

// 新建版本
async function createVersion() {
  await postPmProcessDefinitionVersion({ procDefId: processId.value });
  await loadVersionList();
}

// 删除版本
async function deleteVersion(ids) {
  await deletePmProcessDefinitionVersion({ ids });
  if (ids === curVersionId.value) curVersionId.value = '';
  await loadVersionList();
}

// 复制版本
async function copyVersion(id) {
  await postPmProcessDefinitionVersionCopyById({ id });
  await loadVersionList();
}

// 加载流程详情
async function initProcess(id, readonly = false) {
  const res = await getPmProcessDefinitionInfo({ id: id || unref(processId) });
  processInfo.value = res!;
  curVersionId.value = '';
  readonlyFlow.value = readonly;
  if (res?.activeVersionId) {
    curVersionId.value = res.activeVersionId;
    loadVersionInfo();
    loadVersionList();
  } else {
    loadVersionList();
  }
}

// 保存流程
async function saveProcess() {
  await validNode();
  const data = saveFunc();
  await postPmProcessDefinitionVersionSave(data);
  message.success($t('sys.saveSuccess'));
  loadVersionList();
  loadVersionInfo();
}

// 保存并发布流程
async function publishProcess() {
  await validNode();
  const data = saveFunc();
  await postPmProcessDefinitionVersionSaveAndDeploy(data);
  message.success($t('sys.doSuccess'));
  loadVersionList();
  loadVersionInfo();
}

// 保存审批人和消息接收人
async function saveUsers() {
  await validNode();
  const { nodes } = saveFunc();
  const processApproveUsers = getUsersValue(BpmnNodeTypeEnum.BpmnApproval, nodes);
  const processMessageUsers = getUsersValue(BpmnNodeTypeEnum.BpmnMessage, nodes);
  await postPmProcessDefinitionVersionUpdateProcessUser({
    procDefVerId: curVersionId.value,
    processApproveUsers: processApproveUsers,
    processMessageUsers: processMessageUsers,
  });
  message.success($t('sys.saveSuccess'));
  loadVersionInfo();
}

function getUsersValue(type, nodes) {
  return nodes
    .filter((e: any) => e.type === type)
    .map((node) => {
      return {
        config: node.targetUserConfig,
        nodeId: node.key,
        procDefVerId: curVersionId.value,
      };
    });
}

function validNodeData(nodeId) {
  validateNode(nodeId, validateTargetUserConfig);
}

async function validNode() {
  const { valid } = validate(validateTargetUserConfig);
  if (!valid) {
    message.warn($t('sys.edhr.flowNotCompleted'));
    return Promise.reject();
  }
  const {
    webPageOption,
    webPageKey,
    webViewPageKey,
    mobilePageOption,
    mobilePageKey,
    mobileViewPageKey,
    push,
  } = globalData.value.data;
  if (push.some((e) => e.type !== 'system' && !e.key)) {
    message.warn('消息推送方式配置不完整，请检查');
    return Promise.reject();
  }
  if (
    (webPageOption && (!webPageKey || !webViewPageKey)) ||
    (mobilePageOption && (!mobilePageKey || !mobileViewPageKey))
  ) {
    message.warn('全局页面配置不完整，请检查');
    return Promise.reject();
  }
  const { nodes } = toBpmnData({
    processId: curVersionId.value,
  });
  if (!nodes.some((e) => e.type === BpmnNodeTypeEnum.BpmnApproval)) {
    message.warn('至少要有一个审批节点！');
    return Promise.reject();
  }
}

function validateTargetUserConfig(node) {
  if (
    isFrontPage.value &&
    [BpmnNodeTypeEnum.BpmnApproval, BpmnNodeTypeEnum.BpmnMessage].includes(node.type) &&
    !node?.data.targetUserConfig
  ) {
    return node.type === BpmnNodeTypeEnum.BpmnApproval
      ? ['审批人不能为空']
      : ['消息推送人不能为空'];
  }

  return [];
}

// 递归遍历所有节点，根据全局页面的配置，清除对应节点的页面配置
function clearNodeBindPages(data) {
  const { webPageOption, mobilePageOption } = globalData.value.data;
  if (webPageOption && mobilePageOption) return;
  if (!webPageOption) {
    globalData.value.data.webPageKey = undefined;
    globalData.value.data.webViewPageKey = undefined;
  }
  if (!mobilePageOption) {
    globalData.value.data.mobilePageKey = undefined;
    globalData.value.data.mobileViewPageKey = undefined;
  }
  recursiveNodes(data, webPageOption, mobilePageOption);
}

function recursiveNodes(data, web, mobile) {
  data.forEach((e) => {
    if (e.type === BpmnNodeTypeEnum.BpmnApproval || e.type === BpmnNodeTypeEnum.BpmnStart) {
      if (!web) {
        e.data.webPageKey = undefined;
        e.data.webViewPageKey = undefined;
      }
      if (!mobile) {
        e.data.mobilePageKey = undefined;
        e.data.mobileViewPageKey = undefined;
      }
    }
    if (e.children) recursiveNodes(e.children, web, mobile);
  });
}

function saveFunc() {
  const { xml, nodes } = toBpmnData({
    processId: curVersionId.value,
  });

  console.log(xml);

  nodes.forEach((n) => {
    Object.keys(n).forEach((k) => {
      if (k !== 'events' && typeof n[k] === 'object') {
        n[k] = JSON.stringify(n[k]);
      }
    });
    const beNode = curVersionInfo.value?.nodes?.find((item) => item.key === n.key);
    // 修改时需要携带id
    if (beNode) {
      n.id = beNode.id;
    }
  });
  clearNodeBindPages(gctFlowData.value.children);
  return {
    id: curVersionId.value,
    version: curVersionInfo.value.version,
    procDefId: processInfo.value.id,
    json: JSON.stringify(gctFlowData.value),
    nodes,
    xml,
    ...globalData.value.data,
    push: JSON.stringify(globalData.value.data.push),
    webPageOption: globalData.value.data.webPageOption ? 1 : 0,
    mobilePageOption: globalData.value.data.mobilePageOption ? 1 : 0,
  };
}

export function useProcess() {
  const route = useRoute();
  processId.value = route.params.id as string;
  isFrontPage.value = !!route.query.front;

  return {
    addPaasBpmnNode,
    onNodeCreated,
    globalData,
    nodeSelectedData,
    addNodeDefaultValue,
    bpmnReadonly,
    isFrontPage,

    initProcess,
    processInfo,
    saveProcess,
    publishProcess,
    saveUsers,
    validNodeData,

    loadVersionList,
    versionList,
    curVersionId,
    curVersionInfo,
    createVersion,
    deleteVersion,
    copyVersion,
    toggleVersion,
  };
}
