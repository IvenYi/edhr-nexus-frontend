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
import { BpmnVersionStatusEnum } from '../../../constants';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { DesignerType } from '../../../types/designer-type';
import {
  getLocalDesignerFieldList,
  LOCAL_FORM_MODEL_KEY,
} from '/@online-form/views/designer/hooks/local-designer-cache';

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

const bpmnMasterModelKey = ref('');
const detailMode = ref(false);

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
const LOCAL_FORM_DESIGNER_ID = '__local__';
const LOCAL_BPMN_VERSION_ID = '__local_bpmn_draft__';
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
  if (bpmnVerDefId.value && bpmnId.value !== LOCAL_FORM_DESIGNER_ID) {
    loadBpmnVerDef();
  }
});

function loadLocalBpmnDef(id: string) {
  bpmnId.value = id;
  bpmnVerDefId.value = LOCAL_BPMN_VERSION_ID;
  bpmnVerDef.value = {
    id: LOCAL_BPMN_VERSION_ID,
    procDefId: id,
    status: BpmnVersionStatusEnum.DRAFT,
    version: 'V1',
  };
  bpmnVerDefList.value = [bpmnVerDef.value];
  init();
  setBpmnVerDefCache(gctFlowData.value);
  setReadonly(false);
}

/**
 * 加载流程定义
 * @param id
 */
async function loadBpmnDef(id?: string) {
  if (!id) return;
  if (id === LOCAL_FORM_DESIGNER_ID) {
    loadLocalBpmnDef(id);
    return;
  }
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
  bpmnVerDefList.value = (list ?? []).filter(
    (e) => (detailMode.value && e.status === 'PUBLISHED') || !detailMode.value,
  );
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

async function _save() {
  if (bpmnReadonly.value) {
    message.warn('当前状态只读');
    return Promise.reject();
  }
  const { xml, nodes } = toBpmnData({
    processId: bpmnVerDefId.value,
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
    Object.keys(n).forEach((k: any) => {
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
}

async function _validate(designerType?) {
  const { valid } = validate();
  if (!valid) {
    message.warn($t('sys.edhr.flowNotCompleted'));
    return Promise.reject();
  }
  const { nodes } = toBpmnData({
    processId: bpmnVerDefId.value,
  });
  if (designerType === DesignerType.BIZ_PROCESS_TEMPLATE) {
    if (!nodes.some((e) => e.type === BpmnNodeTypeEnum.BpmnApproval)) {
      message.warn($t('sys.edhr.atLeastOneApprovalNode'));
      return Promise.reject();
    }
  } else if (nodes.length <= 3) {
    message.warn($t('sys.edhr.atLeastOneNodeInFlow'));
    return Promise.reject();
  }
}

/**
 * 更新流程版本
 */
async function saveBpmnVerDef(opts: { designerType?: string } = {}) {
  const { designerType } = opts;
  await _validate(designerType);
  await _save();
  loadBpmnVerDef();
  message.success(t('sys.doSuccess'), 1);
}

async function _prePublish() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: $t('sys.edhr.confirmToPublish'),
      content: $t('sys.edhr.newWillOverwriteOldWhenPublished'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        resolve('');
      },
      onCancel() {
        reject();
      },
    });
  });
}

/**
 * 发布
 * @param id
 */
async function publishBpmnVer(opts: { silent?: boolean; designerType?: string } = {}) {
  const { silent, designerType } = opts;
  await _validate(designerType);
  if (bpmnVerDefList.value.find((item) => item.status === BpmnVersionStatusEnum.PUBLISHED)) {
    if (!silent) {
      await _prePublish();
    }
  }
  await _save();
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
    const res: any =
      modelKey === LOCAL_FORM_MODEL_KEY
        ? getLocalDesignerFieldList(modelKey)
        : await getFieldMetaList({ modelKey: modelKey });
    bpmnMasterModelKey.value = modelKey;
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
    if (modelKey === LOCAL_FORM_MODEL_KEY) {
      return;
    }
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

  function setDetailMode(value) {
    detailMode.value = value;
  }

  return {
    bpmnFieldMap,
    bpmnMasterModelKey,
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
    setDetailMode,
  };
}
