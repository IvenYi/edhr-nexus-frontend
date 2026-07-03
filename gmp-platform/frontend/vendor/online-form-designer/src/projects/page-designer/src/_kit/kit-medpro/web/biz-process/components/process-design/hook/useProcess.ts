import { useGctFlow } from '@gct/flow';
import { useGctBizBpmn } from '@gct/flow/src/plugins/biz-bpmn';
import { computed, createVNode, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/biz-bpmn/enums';
import { getBizProcessDefinitionInfo } from '/@/apis/gct-apaas/BizProcessDefinitionController';
import {
  ProcessDefinitionVerListResponse,
  PmProcessDefinition,
  ProcessDefinitionVersionResponse,
} from '/@/apis/gct-apaas/model';
import { BpmnVersionStatusEnum } from '../constants';
import {
  getBizProcessDefinitionVersionById,
  getBizProcessDefinitionVersionList,
  postBizProcessDefinitionVersion,
  deleteBizProcessDefinitionVersion,
  postBizProcessDefinitionVersionCopyById,
  postBizProcessDefinitionVersionSave,
  postBizProcessDefinitionVersionSaveAndDeploy,
} from '/@/apis/gct-apaas/BizProcessDefinitionVersionController';
import { cloneDeep, isEqual, pick } from 'lodash-es';

const { nodeSelectedId, nodeSelectedData, gctFlowData, setReadonly } = useGctFlow('bizBpmn');
const { validateNode, init, resetGctFlowData, validate, toBpmnData, toFlowPathNodeIds } =
  useGctBizBpmn();

const processId = ref<string>('');
const processInfo = ref<PmProcessDefinition>({});
const versionList = ref<ProcessDefinitionVerListResponse[]>([]);
const curVersionId = ref<string>();
const curVersionInfo = ref<ProcessDefinitionVersionResponse>({});
const readonlyFlow = ref(false);
const processType = ref<'medpro' | 'edhr'>('medpro');
const initJsonData = ref<string>();

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
    validateNode(oldId);
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

// 加载版本列表
async function loadVersionList() {
  versionList.value =
    (await getBizProcessDefinitionVersionList({ procDefId: processInfo.value.id! })) || [];
  if (!curVersionId.value) curVersionId.value = versionList.value[0]?.id || '';
}

// 加载版本详情
async function loadVersionInfo() {
  const res = (await getBizProcessDefinitionVersionById({ id: curVersionId.value! })) || {};
  curVersionInfo.value = res;
  const json = curVersionInfo.value?.json ? JSON.parse(curVersionInfo.value?.json) : '';
  init(json, processType.value);
  initJsonData.value = JSON.stringify(gctFlowData.value);
  bpmnSetReadonly();
}

// 切换当前版本
function toggleVersion(id) {
  curVersionId.value = id;
}

// 新建版本
async function createVersion() {
  await postBizProcessDefinitionVersion({ procDefId: processId.value });
  await loadVersionList();
}

// 删除版本
async function deleteVersion(ids) {
  await deleteBizProcessDefinitionVersion({ ids });
  if (ids === curVersionId.value) curVersionId.value = '';
  await loadVersionList();
}

// 复制版本
async function copyVersion(id) {
  await postBizProcessDefinitionVersionCopyById({ id });
  await loadVersionList();
}

// 加载流程详情
async function initProcess(id, type, readonly = false) {
  processId.value = id;
  curVersionId.value = '';
  readonlyFlow.value = readonly;
  processType.value = type || 'medpro';
  initJsonData.value = '';
  const res = await getBizProcessDefinitionInfo({ id });
  processInfo.value = { ...res };
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
  await postBizProcessDefinitionVersionSave(data);
  message.success($t('sys.saveSuccess'));
  loadVersionList();
  loadVersionInfo();
}

// 保存并发布流程
async function publishProcess() {
  await validNode();
  if (versionList.value.some((e) => e.status === BpmnVersionStatusEnum.PUBLISHED)) {
    Modal.confirm({
      title: $t('sys.process.publishTip'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancel'),
      onOk() {
        publish();
      },
      onCancel() {},
    });
  } else publish();
}

async function publish() {
  const data = saveFunc();
  await postBizProcessDefinitionVersionSaveAndDeploy(data);
  message.success($t('sys.doSuccess'));
  loadVersionList();
  loadVersionInfo();
}

async function validNode() {
  const { valid } = validate();
  if (!valid) {
    message.warn($t('sys.edhr.flowNotCompleted'));
    return Promise.reject();
  }
  const { nodes } = toBpmnData({
    processId: curVersionId.value,
  });
  const inspNodes = nodes.filter((e) => e.type === BpmnNodeTypeEnum.BpmnInspection);
  const releasepNodes = nodes.filter((e) => e.type === BpmnNodeTypeEnum.BpmnRelease);
  if (inspNodes.length > 1) {
    message.warn(
      $t('sys.edhr.onlyOneNodeSth', {
        sth: $t(`sys.bpmn.bizNodeType.${BpmnNodeTypeEnum.BpmnInspection}`),
      }),
    );
    return Promise.reject();
  }
  if (releasepNodes.length > 1) {
    message.warn(
      $t('sys.edhr.onlyOneNodeSth', {
        sth: $t(`sys.bpmn.bizNodeType.${BpmnNodeTypeEnum.BpmnRelease}`),
      }),
    );
    return Promise.reject();
  }
}

function saveFunc() {
  const { xml, nodes } = toBpmnData({
    processId: curVersionId.value,
  });

  console.log(xml);
  nodes.forEach((n) => {
    if (n.type === BpmnNodeTypeEnum.BpmnMessage) {
      const { placeholder, contentName } = n.msgContentConfig;
      if (placeholder.length && contentName) {
        n.msgContentConfig.content = contentName.replace(/\$\{([^}]+)\}/g, (m, p1) => {
          const obj = placeholder.find((e) => e.name === p1);
          return '$' + `{${obj ? obj.key : p1}}`;
        });
      }
    }
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
    if (n.nextKey) {
      // 表单隐藏节点特殊处理
      const obj = nodes.find((e) => e.key === n.nextKey);
      Object.assign(
        n,
        pick(obj || {}, [
          'onlineFormModelKey',
          'onlineFormTmplId',
          'msgTmplKey',
          'msgReceiverConfig',
          'builtinMsgEnabled',
        ]),
      );
    }
  });
  return {
    id: curVersionId.value,
    version: curVersionInfo.value.version,
    procDefId: processInfo.value.id,
    json: JSON.stringify(gctFlowData.value),
    nodes,
    xml,
  };
}

function getParentNodesByType(types: BpmnNodeTypeEnum[]) {
  const { bpmnFlowPathNodeIds, bpmnNodes } = toFlowPathNodeIds();
  let ids: string[] = [];
  bpmnFlowPathNodeIds.forEach((n: string[]) => {
    const idx = Array.isArray(n) ? n.findIndex((e) => e === nodeSelectedId.value) : -1;
    if (idx > -1) ids.push(...n.slice(0, idx));
  });
  ids = [...new Set(ids)];
  return bpmnNodes.filter((e) => ids.includes(e.key) && types.includes(e.type));
}

function hasBeenUpdated() {
  if (bpmnReadonly.value) return false;
  return initJsonData.value !== JSON.stringify(gctFlowData.value);
}

export function useProcess() {
  return {
    nodeSelectedData,
    bpmnReadonly,
    getParentNodesByType,

    initProcess,
    processInfo,
    saveProcess,
    publishProcess,

    loadVersionList,
    versionList,
    curVersionId,
    curVersionInfo,
    createVersion,
    deleteVersion,
    copyVersion,
    toggleVersion,
    hasBeenUpdated,
  };
}
