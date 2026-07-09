import { ref, watch, computed, createVNode } from 'vue';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { getModelComprehensiveSubModelList } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { useGctFlow } from '@gct/flow';
import { useGctBpmn } from '@gct/flow/src/plugins/bpmn';
import { ApproveWayEnum, BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
import {
  getProcessDefinitionVersionById,
  putProcessDefinitionVersionById,
  postProcessDefinitionVersionPublishById,
  deleteProcessDefinitionVersion,
  getProcessDefinitionVersionList,
  postProcessDefinitionVersionCopyById,
  postProcessDefinitionVersion,
} from '/@/apis/gct-apaas/ProcessDefinitionVersionController';
import type {
  FieldMetaDTO,
  ProcessDefinitionVerListResponse,
  ProcessDefinitionVersionRequest,
} from '/@/apis/gct-apaas/model';
import { message, Modal } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { BpmnVersionStatusEnum } from '../../constants';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { putControlConfigById } from '/@/apis/gct-apaas/ControlConfigController';

interface IModel {
  key?: string;
  name?: string;
  subModel?: number;
}

const bpmnFieldMap = ref<
  Record<
    string,
    {
      meta: IModel;
      sort: number;
      fields: FieldMetaDTO[];
    }
  >
>({});

/**
 * 主模型字段
 */
const bpmnMasterModelFields = ref<FieldMetaDTO[]>([]);

const { gctFlowData, setReadonly, setNodeSelected } = useGctFlow();
const { init, toJson, toBpmnData, validate } = useGctBpmn();
const { t } = useI18n();

const bpmnId = ref<string>('');
const bpmnVerDef = ref<ProcessDefinitionVerListResponse | undefined>();
const bpmnVerDefList = ref<ProcessDefinitionVerListResponse[]>([]);
const bpmnVerDefId = ref<string>('');

const needRefresh = ref(false);
/**
 * 版本定义缓存
 */
let bpmnVerDefCache: string = '';
const setBpmnVerDefCache = (data: any) => {
  bpmnVerDefCache = typeof data === 'string' ? data : JSON.stringify(data);
};

/**
 * 非草稿状态 只读
 */
const bpmnReadonly = computed(() => {
  return bpmnVerDef.value?.status !== BpmnVersionStatusEnum.DRAFT;
});

/**
 * 获取当前 bpmn 数据是否发生变化 用于切换时的提示
 * @returns
 */
const getBpmnVerDefDirty = () => {
  // 只读状态 脏数据检测永远为 false
  if (bpmnReadonly.value) return false;
  return bpmnVerDefCache !== JSON.stringify(gctFlowData.value);
};

watch(bpmnVerDefId, () => {
  if (bpmnVerDefId.value) {
    loadBpmnVerDef();
  }
});

/**
 * 加载流程定义
 * @param id
 */
async function loadBpmnDef(id?: string) {
  if (!id) return;
  bpmnId.value = id;
  bpmnVerDefId.value = '';
  await loadBpmnVerDefList();
}

/**
 * 加载流程版本列表
 * @param {boolean} initBpmnVerDef 是否需要初始化版本
 * @returns
 */
async function loadBpmnVerDefList(initBpmnVerDef: boolean = true) {
  const list = await getProcessDefinitionVersionList({
    procDefId: bpmnId.value,
  });
  bpmnVerDefList.value = list ?? [];
  if (!initBpmnVerDef) return;
  if (!bpmnVerDefId.value || !bpmnVerDefList.value.find((i) => i.id === bpmnVerDefId.value)) {
    bpmnVerDefId.value = bpmnVerDefList.value[0].id!;
  }
}

/**
 * 流程节点遍历 用于替换节点数据中的 events 数据结构
 * @param node
 */
const _nodeTraverse = (node) => {
  if (node.data) {
    const beNode = bpmnVerDef.value?.nodes?.find((item) => item.key === node.data.key);
    if (beNode?.events) {
      node.data.events = beNode?.events;
    }
  }
  if (node.children) {
    node.children.forEach((n) => {
      _nodeTraverse(n);
    });
  }
};

/**
 * 加载流程版本定义
 * @param id
 */
async function loadBpmnVerDef() {
  const res = await getProcessDefinitionVersionById({
    id: bpmnVerDefId.value,
  });
  bpmnVerDef.value = res;

  if (bpmnVerDef.value?.json) {
    const data = JSON.parse(bpmnVerDef.value.json);
    _nodeTraverse(data);
    init(data);
    setBpmnVerDefCache(JSON.stringify(data));
  } else {
    init();
  }

  // 设置画布只读
  setReadonly(bpmnVerDef.value?.status !== BpmnVersionStatusEnum.DRAFT);
}

async function addBpmnVerDef() {
  const data: ProcessDefinitionVersionRequest = {
    procDefId: bpmnId.value,
  };
  await postProcessDefinitionVersion(data);
  loadBpmnVerDefList();
  message.success(t('sys.doSuccess'), 1);
}

async function _save(params) {
  if (bpmnReadonly.value) {
    message.warn('当前状态只读');
    return Promise.reject();
  }
  const { xml, nodes } = toBpmnData({
    processId: bpmnVerDefId.value,
  });

  console.log(xml);

  nodes.forEach((n) => {
    Object.keys(n).forEach((k) => {
      if (k !== 'events' && typeof n[k] === 'object') {
        n[k] = JSON.stringify(n[k]);
      }
    });
    const beNode = bpmnVerDef.value?.nodes?.find((item) => item.key === n.key);
    // 修改时需要携带id
    if (beNode) {
      n.id = beNode.id;
    }

    if (
      [BpmnNodeTypeEnum.BpmnApproval, BpmnNodeTypeEnum.BpmnJudge].includes(n.type) &&
      !n.approveWay
    ) {
      n.approveWay = ApproveWayEnum.Competitive;
    }
  });

  await putProcessDefinitionVersionById(
    { id: bpmnVerDefId.value },
    {
      id: bpmnVerDefId.value,
      json: toJson(),
      nodes,
      procDefId: bpmnVerDef.value?.procDefId,
      version: bpmnVerDef.value?.version,
      xml,
    },
  );

  const paramsObj = {
    type: params.configType,
    procDefId: params.procDefId,
    refId: params.refId || params.id,
  };
  await putControlConfigById({ id: params.id }, paramsObj);
  needRefresh.value = true;
}

async function _validate() {
  const { valid } = validate();
  if (!valid) {
    message.warn($t('sys.edhr.flowNotCompleted'));
    return Promise.reject();
  }
  const { nodes } = toBpmnData({
    processId: bpmnVerDefId.value,
  });
  if (!nodes.some((e) => e.type === BpmnNodeTypeEnum.BpmnApproval)) {
    message.warn($t('sys.edhr.atLeastOneApprovalNode'));
    return Promise.reject();
  }
}

/**
 * 更新流程版本
 */
async function saveBpmnVerDef(params) {
  await _validate();
  await _save(params);
  loadBpmnVerDef();
  message.success(t('sys.doSuccess'), 1);
}

async function _prePublish() {
  return new Promise((resolve) => {
    Modal.confirm({
      title: $t('sys.edhr.confirmToPublish'),
      content: $t('sys.edhr.newWillOverwriteOldWhenPublished'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        resolve('');
      },
      onCancel() {},
    });
  });
}

/**
 * 发布
 * @param id
 */
async function publishBpmnVer(opts: { silent?: boolean } & IData = {}) {
  const { silent } = opts;
  await _validate();
  if (bpmnVerDefList.value.find((item) => item.status === BpmnVersionStatusEnum.PUBLISHED)) {
    if (!silent) {
      await _prePublish();
    }
  }
  await _save(opts);
  await postProcessDefinitionVersionPublishById({
    id: bpmnVerDefId.value,
  });
  loadBpmnVerDefList(false);
  loadBpmnVerDef();
  message.success(t('sys.doSuccess'), 1);
}

/**
 * 基于版本复制
 * @param id
 */
async function copyBpmnVerDef(id: string) {
  await postProcessDefinitionVersionCopyById({
    id,
  });
  loadBpmnVerDefList();
  message.success(t('sys.doSuccess'), 1);
}

async function toggleBpmnVer(id: string) {
  if (bpmnVerDefId.value === id) return;
  // 先选中节点置空
  setNodeSelected();
  bpmnVerDefId.value = id;
}

async function deleteBpmnVerDef(id: string) {
  await deleteProcessDefinitionVersion({ ids: id });
  loadBpmnVerDefList();
  message.success(t('sys.doSuccess'), 1);
}

export function useBpmnSetting() {
  needRefresh.value = false;

  const filterFieldInfo = (item) => {
    if ([CreateType.BUILTIN, CreateType.SYSTEM].includes(item.createType)) {
      return false;
    }
    // 排除某些字段类型
    if (
      [
        FIELD_TYPE.PRIMARY_KEY,
        FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
        FIELD_TYPE.SERIAL,
        // FIELD_TYPE.MASTERSLAVE,
        FIELD_TYPE.REF_MULTI,
        FIELD_TYPE.RDO_REF,
        FIELD_TYPE.REF,
        FIELD_TYPE.EXPRESSION,
        FIELD_TYPE.AGG,
        FIELD_TYPE.ESOP,
        FIELD_TYPE.TRANSACTION,
        FIELD_TYPE.LABEL_TEMPLATE,
        FIELD_TYPE.SERIALRULE,
        FIELD_TYPE.PRINTER,
        FIELD_TYPE.MESSAGE_TMPL,
        FIELD_TYPE.RANGE_USER,
        FIELD_TYPE.LABEL_TEMPLATE_REF,
        FIELD_TYPE.DOCUMENT_TEMPLATE,
        FIELD_TYPE.ONLINE_FORM_TEMPLATE,
        FIELD_TYPE.E_DHR_TEMPLATE,
        // FIELD_TYPE.ONLINE_FORM,
        FIELD_TYPE.EXPRESSION_CONDITION,
      ].includes(item.type as any)
    ) {
      return false;
    }

    return true;
  };

  async function _loadMasterFieldListByKey(modelKey, modelName) {
    if (!modelKey) return;
    const res: any = await getFieldMetaList({ modelKey: modelKey });

    bpmnFieldMap.value[modelKey] = {
      meta: { key: modelKey, name: modelName },
      sort: 1,
      fields: (res ?? []).filter(filterFieldInfo).map((item) => {
        if (!item.modelKey) {
          item.modelKey = modelKey;
        }
        return item;
      }),
    };

    bpmnMasterModelFields.value = res.filter(
      (item) =>
        ![CreateType.BUILTIN, CreateType.SYSTEM].includes(item.createType) &&
        ![
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
          FIELD_TYPE.SERIAL,
          FIELD_TYPE.RDO_REF,
          FIELD_TYPE.EXPRESSION,
          FIELD_TYPE.AGG,
          FIELD_TYPE.ESOP,
          FIELD_TYPE.TRANSACTION,
          FIELD_TYPE.LABEL_TEMPLATE,
          FIELD_TYPE.SERIALRULE,
          FIELD_TYPE.PRINTER,
          FIELD_TYPE.MESSAGE_TMPL,
          FIELD_TYPE.RANGE_USER,
          FIELD_TYPE.LABEL_TEMPLATE_REF,
          FIELD_TYPE.DOCUMENT_TEMPLATE,
          FIELD_TYPE.ONLINE_FORM_TEMPLATE,
          FIELD_TYPE.E_DHR_TEMPLATE,
          // FIELD_TYPE.ONLINE_FORM,
          FIELD_TYPE.EXPRESSION_CONDITION,
        ].includes(item.type as any),
    );
  }

  async function _loadSubFieldListByKey(modelKey) {
    if (!modelKey) return;
    const res = await getModelComprehensiveSubModelList({
      modelKey,
    });

    (res ?? []).forEach((m, index) => {
      if (!bpmnFieldMap.value[m.key!]) {
        bpmnFieldMap.value[m.key!] = {
          meta: { key: m.key, name: m.name, subModel: m.subModel },
          sort: 1 + (index + 1),
          fields: (m.fieldMetaList ?? []).filter(filterFieldInfo).map((item) => {
            if (!item.modelKey) {
              item.modelKey = modelKey;
            }
            return item;
          }),
        };
      }
    });
  }

  function resetBpmnFieldMap() {
    bpmnFieldMap.value = {};
  }

  function initFieldList(modelKey, modelName) {
    resetBpmnFieldMap();
    _loadMasterFieldListByKey(modelKey, modelName);
    _loadSubFieldListByKey(modelKey);
  }

  /** 是否有发布版本 */
  const hasPublishedVersion = computed(() => {
    return !!bpmnVerDefList.value.find((item) => item.status === BpmnVersionStatusEnum.PUBLISHED);
  });

  return {
    bpmnFieldMap,
    initFieldList,
    bpmnMasterModelFields,
    loadBpmnDef,
    bpmnVerDefList,
    bpmnVerDefId,
    bpmnReadonly,
    hasPublishedVersion,
    addBpmnVerDef,
    saveBpmnVerDef,
    copyBpmnVerDef,
    publishBpmnVer,
    toggleBpmnVer,
    deleteBpmnVerDef,
    getBpmnVerDefDirty,
    needRefresh,
  };
}
