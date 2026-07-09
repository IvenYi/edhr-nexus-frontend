import { computed, createVNode, h, ref, toRaw } from 'vue';
import EdhrSummaryIndex from '../index.vue';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { listToTree, treeToList } from '/@/utils/helper/treeHelper';
import { OutlineType } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
import { pick, cloneDeep } from 'lodash-es';
import { Button, message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import SelectProcessModal from '../components/modals/select-process-modal.vue';
import { Fixed_Btns_Keys, processBtnGroup, DataStatistics } from '../components/constant';
import { InstanceStatusValues } from '/@/projects/online-form/src/views/integration/apaas_ebr';
import { useBusinessSetting } from '../../../../system-config/hooks/useBusinessSetting';

export interface EdhrSummaryProps {
  edhrInstId: string;
  businessId: string;
  lotSnNo?: string;
  edhrTmplName?: string;
  detailMode?: boolean;
  onClosed?: Function;
}

interface EdhrInfo {
  edhrInstId?: string;
  lotSnNo?: string;
  tmplName?: string;
  tmplId?: string;
  productName?: string;
  materialStatus?: string;
}

const { businessSetting } = useBusinessSetting();

const edhrInfo = ref<any>({});
/** 目录树 */
// const catalogTreeData = ref<any[]>([]);
/** 展开的树节点 */
// const expandedTreeIds = ref<string[]>([]);
/** 被删除的目录和表单模板 */
const summaryDeletedIds = ref<string[]>([]);
/** 指定目录或表单模板下的表单实例 */
const formInstData = ref<any[]>([]);
/** 表单实例列表区域显隐 */
const instanceVisible = ref(false);
const loadingMiddle = ref(false);
const loadingRight = ref(false);
const loading = ref(false);
/** 所有的事务表单实例 */
const txnFormInstData = ref<any[]>([]);
/** 所有的附录表单 */
const appendixFormInstData = ref<any[]>([]);
/** 关联 EDHR 表单 */
const relateEdhrInstData = ref<any[]>([]);
/** 待整理的删除表单 */
const deleteFormInstData = ref<any[]>([]);
const initDeleteFormInstIds = ref<string[]>([]);
/** 返工表单实例 */
const reworkFormInstData = ref<any[]>([]);
/** 记录本 */
const recordsFormInstData = ref<any[]>([]);
/** 当前查询的记录本 Id */
const searchedRecordId = ref<string>();
/** 当前点选的树节点 id */
const selectedTreeId = ref<string[]>([]);
/** 当前点选的树节点 */
const selectedTreeNode = ref<any>({});
/** 当前拖拽的实例 */
const choosedFormInst = ref<any>({});
const notAllowToList = ref<boolean>(false);
/** 当前右侧展示的表单实例 */
const currentFormInst = ref<any>({});
/** 详情模式 */
const detailMode = ref<boolean>(false);
/** 初始化时的wiki目录，做备份 */
const initJsonTreeData = ref<string>();
/** 审批按钮 */
const actionButtonList = ref<any[]>([]);
// 统计数据
const dataStatisticsList = ref<any[]>(cloneDeep(DataStatistics));
const curStatistics = ref<any>(dataStatisticsList.value[0]);
// InstanceStatusValues
const readonlySummary = computed(() => {
  return (
    detailMode.value ||
    [InstanceStatusValues.SUMMARIZED, InstanceStatusValues.IN_AUDIT].includes(
      edhrInfo.value.instanceStatus,
    ) ||
    curStatistics.value.type !== 'TOTAL'
  );
});

const enforceUseProcess = computed(() => {
  return !businessSetting.dhrSumDisabled && businessSetting.enforceUseDHRSummaryProcess;
});

const catalogTreeData = computed(() => {
  return curStatistics.value.list || [];
});

const expandedTreeIds = computed(() => {
  return curStatistics.value.expandedIds || [];
});

export function useEdhrSummary() {
  async function openModal(props: EdhrSummaryProps) {
    edhrInfo.value = props;
    detailMode.value = props.detailMode || false;
    const res: any = await gct.openUtil.fullScreen(EdhrSummaryIndex, {
      ...props,
    });
    if (props.onClosed && typeof props.onClosed === 'function') {
      props.onClosed(res.ok);
    }
  }

  function init(instId) {
    resetAll();
    getEdhrInfo(instId);
  }

  async function getEdhrInfo(id) {
    loading.value = true;
    try {
      const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelKey: 'gct_edhr_instance',
          bsKey: 'getById',
          modelCategory: 'entity',
        },
        { id },
      );
      edhrInfo.value = {
        edhrInstId: id,
        lotSnNo: res?.data?.material_no_,
        mfgOrderId: res?.data?.mfg_order_id_,
        tmplName: res?.data?.tmpl_name_,
        tmplId: res?.data?.tmpl_id_,
        productName: res?.data?.product_id_ ? res?.dict.product_id_[res?.data?.product_id_] : '',
        materialStatus: res?.data?.material_status_,
        materialNo: res?.data?.material_no_,
        processInstId: res?.data?.approve_proc_inst_id_,
        processId: res?.data?.approve_process_id_,
        instanceStatus: res?.data?.instance_status_,
        createBy: res?.data?.create_type_,
      };
      await getCatalogData(id, res?.data?.tmpl_id_);
      loading.value = false;
      getAllFormInst();
      getActionBtns(res?.data?.approve_proc_inst_id_);
      getEdhrDataStatistics();
    } catch (error) {
      loading.value = false;
    }
  }

  async function getEdhrDataStatistics() {
    let res: any;
    try {
      res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelKey: 'em_edhr_summary_form_inst',
          bsKey: 'biz_number_statistics',
          modelCategory: 'entity',
        },
        {
          edhrInstanceId: edhrInfo.value.edhrInstId,
        },
      );
    } catch (error) {}
    const totalMap = (res || []).reduce((obj, e) => {
      obj[e.type] = e.number || 0;
      return obj;
    }, {});
    dataStatisticsList.value.forEach((e) => {
      e.total = totalMap[e.type] || 0;
    });
    curStatistics.value = { ...dataStatisticsList.value[0], ...curStatistics.value };
  }

  function setCurrentStatistic(data) {
    // 目录有数据的，不在做请求，防止将新增或修改的数据更新掉
    curStatistics.value = data;
    // const firstDoc = findTreeNode('', (n) => n.type_ === OutlineType.DOC);
    setSelectedTreeNode();
    if (data.list?.length > 0) return;
    getCatalogData(edhrInfo.value.edhrInstId, edhrInfo.value.tmplId);
  }

  function resetAll() {
    edhrInfo.value = {};
    // catalogTreeData.value = [];
    curStatistics.value.list = [];
    summaryDeletedIds.value = [];
    formInstData.value = [];
    // expandedTreeIds.value = [];
    curStatistics.value.expandedIds = [];
    txnFormInstData.value = [];
    appendixFormInstData.value = [];
    reworkFormInstData.value = [];
    recordsFormInstData.value = [];
    deleteFormInstData.value = [];
    initDeleteFormInstIds.value = [];
    relateEdhrInstData.value = [];
    selectedTreeId.value = [];
    selectedTreeNode.value = {};
    notAllowToList.value = false;
    currentFormInst.value = {};
    initJsonTreeData.value = '';
    searchedRecordId.value = '';
    actionButtonList.value = [];
    dataStatisticsList.value = cloneDeep(DataStatistics);
    curStatistics.value = dataStatisticsList.value[0];
  }

  async function setSelectedTreeNode(node?) {
    if (!node) {
      // selectedTreeId.value = [];
      selectedTreeNode.value = {};
      formInstData.value = [];
      currentFormInst.value = {};
      const firstDoc = findTreeNode('', (n) => n.type_ === OutlineType.DOC);
      setSelectedTreeNode(firstDoc);
      return;
    }
    selectedTreeId.value = [node.id_];
    selectedTreeNode.value = node;
    if (!curStatistics.value.expandedIds?.some((e) => e !== node.parent_id_)) {
      curStatistics.value.expandedIds.push(node.parent_id_);
    }
    try {
      if (!node?.instData) {
        node.instData = (await getFormInstDataById(node)) || [];
      }
      formInstData.value = node?.instData;
      currentFormInst.value = formInstData.value[0] || {};
    } catch (error) {
      formInstData.value = node?.instData || [];
      currentFormInst.value = formInstData.value[0] || {};
    }
  }

  async function getCatalogData(edhrInstId, edhrTmplId) {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_outline',
        bsKey: 'biz_search_outline',
        modelCategory: 'entity',
      },
      { edhrInstId, edhrTmplId, summaryType: curStatistics.value.type },
    );
    curStatistics.value.expandedIds = (res || [])
      .filter((e) => e.type_ === OutlineType.OUTLINE)
      .map((e) => e.id_);
    // catalogTreeData.value = listToTree(res || [], {
    //   pid: 'parent_id_',
    //   id: 'id_',
    // });
    curStatistics.value.list = listToTree(
      res || [],
      {
        pid: 'parent_id_',
        id: 'id_',
      },
      (n) => {
        if (
          n.source_edhr_inst_id_ &&
          n.source_edhr_inst_id_ !== edhrInfo.value.edhrInstId &&
          !n.source_root_
        ) {
          n.class = 'no-drag no-put';
        }
        if (n.source_root_) n.class = 'no-put';
        return n;
      },
    );
    if (curStatistics.value.type === 'TOTAL') {
      const data: any = buildData();
      initJsonTreeData.value = JSON.stringify(data.summary_outLine_list_?.insert);
    }
    // const firstDoc = findTreeNode('', (n) => n.type_ === OutlineType.DOC);
    setSelectedTreeNode();
  }

  async function getFormInstDataById(node, needSetTree = true) {
    if (!node) {
      return [];
    }
    // 新拖进来的关联 DHR 查询表单实例，用原始的edhrId和大纲中treeNode的 Id，保存后用新的edhrId和大纲中treeNode的 Id
    const params = {
      edhrInstanceId: node.summary_outline_id_
        ? node.source_edhr_inst_id_
        : edhrInfo.value.edhrInstId,
      docOutlineId: node.summary_outline_id_ || node.id_,
    };
    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_form_inst',
        bsKey: 'biz_search_in_select',
        modelCategory: 'entity',
      },
      {
        // edhrInstanceId: edhrInfo.value.edhrInstId,
        // docOutlineId: node.id_,
        ofTmplId: node.form_tmpl_id_,
        ignoreAbandon: true,
        pageSize: 99999,
        pageNo: 1,
        summaryType: curStatistics.value.type,
        ...params,
      },
    );
    const data = (res?.data || []).map((e) => formatRequestInst(e, Fixed_Btns_Keys.Deleted));
    if (needSetTree) setTreeNodeData(node.id_, data);
    return data;
  }

  function setTreeNodeData(id, instData, list = catalogTreeData.value) {
    list.forEach((e) => {
      if (e.id_ === id) {
        e.instData = instData;
      } else if (e.children && e.children.length) setTreeNodeData(id, instData, e.children);
    });
  }

  function findTreeNode(target, cond?: (n) => boolean, tree = catalogTreeData.value) {
    if (!cond || typeof cond !== 'function') cond = (n) => n.id_ === target;
    for (const node of tree) {
      if (cond(node)) {
        return node;
      } else if (node.children?.length) {
        const found = findTreeNode(target, cond, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 用来删除或者插入一条数据
   * @param id 删除或插入位置的 id
   * @param list
   * @param node 不传为删除节点
   * @param isBefore 是否是前一个
   * @returns 被删除的节点
   */
  function updateTreeData(id, list = catalogTreeData.value, node?, isBefore?) {
    const idx = list.findIndex((e) => e.id_ === id);
    if (idx > -1) {
      const f = list[idx];
      if (node && f.type_ === OutlineType.DOC) {
        const putIdx = isBefore ? idx : idx + 1;
        list.splice(putIdx, 0, { ...node, parent_id_: f.parent_id_ });
      } else if (node && !isBefore) {
        if (f.source_root_) {
          // 关联 DHR 放在同层的后一个兄弟节点
          list.splice(idx + 1, 0, { ...node, parent_id_: f.parent_id_ });
        } else {
          if (!f.children) f.children = [];
          f.children.splice(0, 0, { ...node, parent_id_: f.id_ });
        }
      } else if (node && isBefore) {
        list.splice(idx, 0, { ...node, parent_id_: f.parent_id_ });
      } else {
        // 删除树节点
        const n = list.splice(idx, 1)[0];
        if (id === selectedTreeId.value[0]) {
          setSelectedTreeNode();
        }
        return n;
      }
    } else {
      list.forEach((e) => {
        if (e.children?.length) updateTreeData(id, e.children, node, isBefore);
      });
    }
  }

  function updateTreeNode(opts: { id: string; list?: any[]; params?: any; cond?: (n) => boolean }) {
    const { id, list = relateEdhrInstData.value, params = {}, cond = (n) => n.id === id } = opts;
    // if (!cond || typeof cond !== 'function') cond = (n) => n.id === id;
    list.forEach((e) => {
      if (cond(e)) {
        Object.assign(e, params);
      }
      if (e.children?.length) updateTreeNode({ id, list: e.children, params, cond });
    });
  }

  async function deleteTreeNode(checkedNodes) {
    loading.value = true;
    try {
      const nodes = findAllDeleteNode(checkedNodes);
      const deletedIds = nodes.map((e) => e.id_);
      summaryDeletedIds.value = [...new Set([...summaryDeletedIds.value, ...deletedIds])];
      // 关联的DHR，删除后，DHR列表中的该条数据要可以重新拖拽
      nodes.forEach((n) => {
        if (n.source_root_) {
          updateTreeNode({ id: n.source_edhr_inst_id_, params: { associated: false } });
        }
      });
      const docNodes = nodes.filter(
        (e) => e.type_ === OutlineType.DOC && e.edhr_inst_id_ === e.source_edhr_inst_id_,
      );
      const noInstData = docNodes
        .filter((e) => !e.instData)
        ?.map((e) => getFormInstDataById(e, false));
      const hasInstData = docNodes
        .filter((e) => e.instData)
        .map((e) => e.instData)
        ?.flat();

      await Promise.all(noInstData).then((list) => {
        hasInstData.push(...list.flat());
      });
      hasInstData.forEach((e) => {
        insertFormInstToTable(e);
      });
      // 删除树节点
      deletedIds.forEach((id) => {
        if (curStatistics.value.expandedIds.includes(id)) {
          curStatistics.value.expandedIds = curStatistics.value.expandedIds.filter(
            (id) => id !== id,
          );
        }
        updateTreeData(id);
      });
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  }

  function findAllDeleteNode(data) {
    return data.reduce((list, e) => {
      const arr = [e];
      if (e.children?.length) {
        arr.push(...findAllDeleteNode(e.children));
      }
      arr.forEach((g) => {
        if (!list.some((f) => f.id_ === g.id_)) {
          list.push(g);
        }
      });
      return list;
    }, []);
  }

  function insertFormInstToTable(e) {
    if (e.inst_from === Fixed_Btns_Keys.Appendix) {
      appendixFormInstData.value.push(e);
    } else if (e.inst_from === Fixed_Btns_Keys.Records && searchedRecordId.value === e.materialNo) {
      recordsFormInstData.value.push(e);
    } else if (e.inst_from === Fixed_Btns_Keys.Txn) {
      txnFormInstData.value.push(e);
    } else if (e.inst_from === Fixed_Btns_Keys.Rework) {
      reworkFormInstData.value.push(e);
    } else if (
      e.inst_from === Fixed_Btns_Keys.Deleted &&
      !deleteFormInstData.value.some((f) => f.id_ === e.id_)
    ) {
      deleteFormInstData.value.push(e);
    }
  }

  async function getAllFormInst() {
    loadingRight.value = true;
    try {
      const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelKey: 'em_edhr_summary_form_inst',
          bsKey: 'biz_search_all_form_inst',
          modelCategory: 'entity',
        },
        {
          materialNo: edhrInfo.value.lotSnNo!,
          edhrInstId: edhrInfo.value.edhrInstId,
          mfgOrderId: edhrInfo.value.mfgOrderId,
          materialStatus: edhrInfo.value.materialStatus,
        },
      );
      loadingRight.value = false;
      appendixFormInstData.value = (res.appendixList || []).map((e) =>
        formatRequestInst(e, Fixed_Btns_Keys.Appendix),
      );
      reworkFormInstData.value = (res.reworkList || []).map((e) =>
        formatRequestInst(e, Fixed_Btns_Keys.Rework),
      );
      txnFormInstData.value = (res.txnList || []).map((e) =>
        formatRequestInst(e, Fixed_Btns_Keys.Txn),
      );
      deleteFormInstData.value = (res.recycleBinList || []).map((e) =>
        formatRequestInst(e, Fixed_Btns_Keys.Deleted),
      );
      const relationEdhrList: any[] = res.relationEdhrList || [];
      formatTree(relationEdhrList);
      relateEdhrInstData.value = relationEdhrList;
      initDeleteFormInstIds.value = deleteFormInstData.value.map((e) => e.id_);
    } catch (error) {
      loadingRight.value = false;
    }
  }

  function formatTree(list) {
    list.forEach((e) => {
      e.uuid = randomId(12);
      if (e.children && !e.children.length) {
        e.children = null;
      } else if (e.children) {
        formatTree(e.children);
      }
    });
  }

  async function getEdhrOutlineData(edhrInstId) {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_outline',
        bsKey: 'biz_search_outline',
        modelCategory: 'entity',
      },
      { edhrInstId },
    );
    const data = arrayToTreeAndUpdateId(res || [], {
      source_edhr_inst_id_: edhrInstId,
      class: 'no-drag no-put',
      source_root_: 0,
    });
    return data;
  }

  async function getRecordsFormInstData({ notebookId, title }) {
    if (!notebookId) {
      message.warning($t('sys.chooseTextTip', { name: $t('sys.edhr.recordBook.recordBookTitle') }));
      return;
    }
    searchedRecordId.value = notebookId;
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_form_inst',
        bsKey: 'biz_notebook',
        modelCategory: 'entity',
      },
      {
        notebookId,
        title,
        edhrInstId: edhrInfo.value.edhrInstId,
      },
    );
    const { form_inst_list_: formInst } = await buildData();

    // todo
    const insertedIds = new Set(formInst?.insert?.map((f) => f.form_inst_id_) ?? []);
    recordsFormInstData.value = (res ?? []).reduce((acc, e) => {
      // 记录本中作废的实例不应该显示
      if (e.instanceStatus !== InstanceStatusValues.ABANDON && !insertedIds.has(e.id)) {
        acc.push(formatRequestInst(e, Fixed_Btns_Keys.Records));
      }
      return acc;
    }, []);
  }

  /** 将接口返回的表单实例转换为保存时需要的数据结构 */
  function formatRequestInst(e, inst_from) {
    return {
      ...pick(e, [
        'materialNo',
        'businessType',
        'materialStatus',
        'sourceMaterialNo',
        'id',
        'txnName',
        'txnNo',
        'operationName',
        'reworkName',
      ]),
      form_type_: e.formType,
      form_inst_id_: e.id,
      form_inst_name_: e.title || e.description || e.tmplName,
      serial_no_: e.serialNo,
      form_create_time_: e.createTime,
      form_modify_time_: e.modifyTime,
      form_modify_user_id_: e.modifyUserId,
      form_modify_user_name: e.modifyUserName,
      instance_status_: e.instanceStatus,
      form_tmpl_id_: e.tmplId,
      form_tmpl_name_: e.tmplName,
      of_required_: e.ofRequired,
      id_: e.id,
      inst_from: inst_from,
    };
  }

  function randomId(length: number = 8): string {
    let result = Math.random().toString(36).substring(2, 10);
    while (result.length < length) {
      result += Math.random().toString(36).substring(2, 10);
    }
    return result.substring(0, length);
  }

  function newOutLine(props) {
    return {
      id_: 'tmp_' + randomId(12),
      parent_id_: '',
      name_: '',
      type_: 'OUTLINE',
      isInsert: true,
      isEdit: true,
      ...props,
    };
  }

  function formInstTransfer(data, where) {
    const id_ = 'tmp_' + randomId(12);
    const inst = {
      ...data,
      form_inst_name_:
        data.inst_from === Fixed_Btns_Keys.Txn ? data.form_tmpl_name_ : data.form_inst_name_,
      isInsert: true,
      isUpdate: undefined,
    };
    switch (where) {
      case 'tree':
        return {
          id_,
          name_: '',
          parent_id_: '',
          form_tmpl_id_: data.form_tmpl_id_,
          sort_num_: 1,
          type_: OutlineType.DOC,
          instData: [{ ...inst, summary_outline_id_: id_ }],
        };
      case 'list':
        return { ...inst, summary_outline_id_: selectedTreeId.value[0] };
      case 'table':
        return data;
    }
  }

  function buildData() {
    const data = dataStatisticsList.value[0].list;
    const catalogList = treeToList(data).map((e) => toRaw(e));
    const instList = catalogList
      .map((e) => {
        if (e.source_edhr_inst_id_ && e.source_edhr_inst_id_ !== edhrInfo.value.edhrInstId) {
          return [];
        }
        return e.instData || [];
      })
      .flat();
    if (catalogList.some((e) => e.isEdit) || instList.some((e) => e.isEdit)) {
      message.warn($t('sys.edhr.completeInformation'));
      return Promise.reject();
    }
    const list = catalogList.map((e) => {
      return {
        ...pick(e, [
          'id_',
          'name_',
          'parent_id_',
          'form_tmpl_id_',
          'type_',
          'form_tmpl_name_',
          'source_edhr_inst_id_',
          'summary_outline_id_',
          'source_root_',
        ]),
      };
    });
    const insertProps = [
      'form_inst_id_',
      'form_tmpl_name_',
      'summary_outline_id_',
      'form_inst_name_',
      'serial_no_',
      'form_modify_user_id_',
      'form_create_time_',
      'form_modify_time_',
      'instance_status_',
      'of_required_',
      'form_type_',
      'form_tmpl_id_',
      'inst_from',
    ];
    const instInsert = instList.filter((e) => e.isInsert).map((e) => pick(e, insertProps));
    const instUpdate = instList
      .filter((e) => e.isUpdate)
      .map((e) => pick(e, ['form_inst_id_', 'form_inst_name_', 'form_tmpl_name_']));
    return {
      summary_outLine_list_: {
        insert: list,
        delete: summaryDeletedIds.value,
      },
      form_inst_list_: {
        insert: instInsert,
        update: instUpdate,
        delete: deleteFormInstData.value
          .filter((e) => !initDeleteFormInstIds.value.includes(e.id_))
          .map((e) => e.id_),
      },
    };
  }

  function hasBeenUpdated() {
    const data: any = buildData();
    const curJson = JSON.stringify(data.summary_outLine_list_?.insert);
    const instD: any = data.form_inst_list_;
    return (
      initJsonTreeData.value !== curJson ||
      instD.insert?.length > 0 ||
      instD.delete?.length > 0 ||
      instD.update?.length > 0
    );
  }

  async function saveSummary() {
    const data = await buildData();
    await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_outline',
        bsKey: 'biz_save',
        modelCategory: 'entity',
      },
      {
        edhr_inst_id_: edhrInfo.value.edhrInstId,
        ...data,
      },
    );
    message.success($t('sys.saveSuccess'));
    init(edhrInfo.value.edhrInstId);
  }

  async function finishSummary() {
    return new Promise((resolve, reject) => {
      const cfg = Modal.confirm({
        title: $t('sys.edhr.submitDhrSummaryTip'),
        // content: '请选择是否需要发起汇总流程',
        icon: createVNode(ExclamationCircleFilled),
        content: h(
          'div',
          {},
          !enforceUseProcess.value
            ? [
                h(
                  Button,
                  {
                    type: 'link',
                    class: 'confirm-modal-left-btn',
                    title: $t('sys.edhr.summarizeDirectly'),
                    onClick: async () => {
                      cfg.destroy();
                      try {
                        await finishFunc();
                        resolve(true);
                      } catch (e) {
                        reject();
                      }
                    },
                  },
                  $t('sys.edhr.summarizeDirectly'),
                ),
              ]
            : [],
        ),
        // okButtonProps: { style: { display: 'none' } },
        okText: $t('sys.edhr.selectSummaryProcess'),
        onOk: async () => {
          const res: any = await gct.openUtil.modal(
            SelectProcessModal,
            {},
            {
              title: $t('sys.edhr.SummaryProcessSelect'),
              width: 640,
              okText: $t('sys.okText'),
            },
          );
          if (res.ok) {
            // cfg.destroy();
            const id = res.data?.id;
            try {
              await finishFunc(id);
              resolve(true);
            } catch (e) {
              reject();
            }
          } else {
            return Promise.reject();
          }
        },
        onCancel: () => {
          reject();
        },
      });
    });
  }

  async function finishFunc(approve_tmpl_id_?) {
    const data = buildData();
    await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_outline',
        bsKey: 'biz_finish',
        modelCategory: 'entity',
      },
      {
        edhr_inst_id_: edhrInfo.value.edhrInstId,
        approve_tmpl_id_,
        ...data,
      },
    );
    message.success($t('sys.edhr.finishSortingOut'));
  }

  async function getActionBtns(processId) {
    if (detailMode.value || !processId) {
      actionButtonList.value = [];
      return;
    }
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_process',
        bsKey: 'biz_button',
        modelCategory: 'entity',
      },
      { id: processId },
    );
    if (!res) {
      actionButtonList.value = [];
      return;
    }
    const nodeDef = res.nodeDef ?? {};
    const showButtons = res.buttons;
    const buttonConfig = nodeDef.buttonConfig;

    const buttonMap = (buttonConfig ? JSON.parse(buttonConfig) : []).reduce((acc, current) => {
      acc[current.type] = current;
      return acc;
    }, {});
    actionButtonList.value = processBtnGroup
      .filter((info) => showButtons.includes(info.type))
      .map((item) => {
        const btn = buttonMap?.[item.type];
        if (btn && btn.enable) {
          return {
            ...btn,
            style: {
              ...item.style,
              ...btn.style,
            },
            buttonType: 'builtin',
            customTitle: btn.alias || item.title || $t('sys.pageDesigner.button'),
            api: item.api,
            taskId: res.taskId,
            businessId: res.businessId || edhrInfo.value.businessId,
          };
        }
      })
      .filter((i) => i) as any;
  }

  // 格式化关联 DHR 的大纲数据
  function arrayToTreeAndUpdateId(list, params = {}) {
    const map = new Map();
    const tree: any[] = [];

    list.forEach((item) => {
      const newNode = {
        ...item,
        id_: 'tmp_' + randomId(12),
        children: [],
        ...params,
        summary_outline_id_: item.id_,
      };
      map.set(item.id_, newNode);
    });

    list.forEach((item) => {
      const newNode = map.get(item.id_);
      const parent = map.get(item.parent_id_);
      if (item.parent_id_ === 'ROOT' || !parent) {
        tree.push(newNode);
      } else {
        if (parent) {
          parent.children.push(newNode);
          newNode.parent_id_ = parent.id_;
        }
      }
    });

    return tree;
  }

  function changeInstanceVisible(visible) {
    instanceVisible.value = visible;
  }

  return {
    loading,
    init,
    openModal,
    edhrInfo,
    catalogTreeData,
    expandedTreeIds,
    summaryDeletedIds,
    getFormInstDataById,
    formInstTransfer,
    saveSummary,
    finishSummary,
    readonlySummary,
    detailMode,
    getRecordsFormInstData,
    hasBeenUpdated,

    loadingMiddle,
    loadingRight,
    notAllowToList,
    formInstData,
    txnFormInstData,
    appendixFormInstData,
    deleteFormInstData,
    relateEdhrInstData,
    recordsFormInstData,
    searchedRecordId,
    reworkFormInstData,
    insertFormInstToTable,
    currentFormInst,
    getEdhrOutlineData,

    selectedTreeId,
    selectedTreeNode,
    setSelectedTreeNode,
    choosedFormInst,
    findTreeNode,
    updateTreeData,
    deleteTreeNode,
    newOutLine,
    updateTreeNode,

    OutlineType,
    actionButtonList,
    getActionBtns,

    dataStatisticsList,
    curStatistics,
    setCurrentStatistic,

    instanceVisible,
    changeInstanceVisible,
  };
}
