import { pick } from 'lodash-es';
import { ref } from 'vue';
import { DesignMode } from '../enums';
import type {
  DocOutlineRequest,
  DocOutlineResponse,
  DocumentRequest,
} from '/@/apis/gct-apaas/model';
import { useI18n } from '/@/hooks/web/useI18n';
import { GctDialog } from '/@/utils/Dialog';
import DocumentModal from '/@online-form/views/designer/modules/modals/document-modal.vue';

import {
  deleteDocOutline,
  getDocOutlineList,
  postDocOutline,
  postDocOutlineDrag,
  putDocOutlineById,
} from '/@/apis/gct-apaas/DocOutlineController';
import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
import { ITreeNode } from '/@/components/TreeEx';
import { findRecursiveChild } from '/@/utils/recursive';
import tmplModal from '/@page-designer/components/widgets/web/field/tmpl-tree-select/component/tmpl-modal.vue';
import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';
import { message } from 'ant-design-vue';
import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';
import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

enum SheetType {
  Blank = 'Blank',
  Refer = 'Refer',
}

export enum OutlineType {
  OUTLINE = 'OUTLINE',
  DOC = 'DOC',
}

/**
 * 目录树节点数据接口(包含表单节点的数据)
 * @author lingxiaoming
 * @date 2024-07-24 11:35:24
 * @export
 * @interface OutlineTreeNode
 * @extends {ITreeNode}
 */
export interface OutlineTreeNode extends ITreeNode, DocOutlineResponse {
  children?: OutlineTreeNode[];
  sortNum: number;
  /**
   * 节点类型
   * @type {('OUTLINE' 目录 | 'DOC' 表单)}
   */
  type: OutlineType;
}

/**
 * 给树节点排序
 * @author lingxiaoming
 * @date 2024-07-23 03:56:31
 * @param {OutlineTreeNode[]} nodes
 * @return {*}  {OutlineTreeNode[]}
 */
function sortNodes(nodes: OutlineTreeNode[]): OutlineTreeNode[] {
  return nodes
    .sort((a, b) => a.sortNum - b.sortNum)
    .map((item) => {
      if (item.children) {
        item.children = sortNodes(item.children);
      }
      return item;
    });
}

const { t } = useI18n();

const edhrId = ref<string>();
/** edhr纸张大小必须统一 */
const firstPageSize = ref<string>();
const loading = ref<boolean>(false);
const outlineTreeData = ref<OutlineTreeNode[]>([]);
const selectedDocIds = ref<string[]>([]);

/**
 * 重置edhr状态
 */
function _restState() {
  edhrId.value = undefined;
  firstPageSize.value = undefined;
  outlineTreeData.value = [];
  selectedDocIds.value = [];
}
/**
 * edhrWiki
 * @returns
 */
export function useEDHRWiki(props: { requestOutLine?: (params: any) => Promise<any> } = {}) {
  const enableDocControl = isEnableDocControl();

  /**
   * 根据edhrid初始化
   * @param id
   */
  async function initialize(id: string) {
    _restState();
    edhrId.value = id;
    await loadOutlineTreeData(id);
  }

  /**
   * 加载edhrWiki的目录树数据
   * @param id
   * @param sheetId
   * @returns
   */
  async function loadOutlineTreeData(id: string) {
    if (!id) return;
    loading.value = true;
    const res = props.requestOutLine
      ? await props.requestOutLine({ baseId: id })
      : await getDocOutlineList({ baseId: id });

    const nodeMap = new Map<string, OutlineTreeNode>();
    const childrenMap = new Map<string, OutlineTreeNode[]>();
    childrenMap.set(edhrId.value!, []);

    if (!res) {
      throw new Error($t('sys.onlineForm.notFoundOutlineData'));
    }

    res!.forEach((item) => {
      const node: OutlineTreeNode = {
        ...item,
        key: item.id!,
        title: item.name!,
        sortNum: item.sortNum || 0,
        type: item.type as any,
      };
      nodeMap.set(item.id!, node);
      if (!childrenMap.has(item.parentId!)) {
        childrenMap.set(item.parentId!, []);
      }
      childrenMap.get(item.parentId!)!.push(node);
    });

    for (const [key, arr] of childrenMap) {
      if (key !== edhrId.value) {
        const node = nodeMap.get(key)!;
        node && (node.children = arr);
      }
    }

    const rootNodes: OutlineTreeNode[] = childrenMap.get(id)!;

    outlineTreeData.value = sortNodes(rootNodes);

    const firstDoc = res.find((item) => item.type === 'DOC');

    if (firstDoc) {
      const pageInfo = await getOnlineFormTmplGetVersionById({
        id: firstDoc.refId || firstDoc.id || '',
      });
      if (pageInfo) {
        firstPageSize.value = pageInfo.paperSize;
      }
    }

    // 计算已经选择的表单父级的id集合
    const selectedDocSet = new Set<string>();
    [...nodeMap.values()].forEach((node) => {
      if (node.type === 'DOC' && node.refId) {
        selectedDocSet.add(node.refId.split(':')[0]);
      }
    });
    selectedDocIds.value = [...selectedDocSet];

    loading.value = false;
  }

  /**
   * 外部调用刷新树数据
   * @author lingxiaoming
   * @date 2024-07-25 05:14:53
   * @return {*}
   */
  async function refresh() {
    if (!edhrId.value) {
      throw new Error($t('sys.onlineForm.notInitialize'));
    }
    return loadOutlineTreeData(edhrId.value);
  }

  /**
   * 创建表单（改成批量添加）
   */
  async function createDoc(parentId?: string) {
    // 禁用的模版ids
    const disabledKeys = selectedDocIds.value;
    const baseParams: DocOutlineRequest = {
      baseId: edhrId.value,
      type: 'DOC',
      parentId: parentId || edhrId.value,
      ofRequired: 1,
    };

    const queryParams: IParams = {};

    if (enableDocControl) {
      queryParams.controlStatus = ControlStatusEnum.CONTROLLED;
    }
    queryParams.operationState = true;

    const res = await gct.openUtil.modal<any>(
      tmplModal,
      {
        moduleType: FormDesignEnum.ONLINE_FORM,
        exclusiveCheck: true,
        multiple: true,
        queryParams: queryParams,
        checkFunc: (row) => {
          // 禁止选择已经在目录里的表单
          const parentKey = row.children ? row.id : row.baseId;
          if (disabledKeys?.includes(parentKey)) {
            return false;
          }
          // 启用文控的时候
          if (enableDocControl) {
            if (row.children) {
              const defaultVersion = row.children.find((e) => !!e.default);
              return defaultVersion?.controlStatus === ControlStatusEnum.CONTROLLED;
            } else {
              return row.controlStatus === ControlStatusEnum.CONTROLLED;
            }
          }
          return true;
        },
      },
      {
        title: $t('sys.onlineForm.batchReferenceForms'),
        width: 1100,
        height: 700,
        okText: t('sys.okText'),
      },
    );

    if (res.ok && res.params?.selected) {
      let hasSuccess = false;
      let hasError = false;
      await Promise.allSettled(
        res.params.selected.map(async (data) => {
          const params: DocOutlineRequest = {
            ...baseParams,
            refId: data.refId,
            name: data.name,
          };
          try {
            await postDocOutline(params, { errorMessageMode: 'none' });
            hasSuccess = true;
          } catch (error) {
            console.log(error);
            const docName = `【${data.name}${data.version ? ':' + data.version : ''}】`;
            message.error({
              content: docName + error,
              duration: 3,
            });
            hasError = true;
          }
        }),
      );
      if (hasSuccess) {
        refresh();
      }
      if (!hasError) {
        message.success($t('sys.appDesigner.addSuccess'));
      }
    }
  }

  function editDoc(node: OutlineTreeNode) {
    GctDialog.open(DocumentModal, {
      props: {
        id: node.key,
        parentId: node.parentId,
      },
      options: {
        title: $t('sys.onlineForm.editForm'),
      },
      isSheet: true,
      callback: async (data: DocumentRequest) => {
        await putDocOutlineById(
          { id: node.key },
          pick(data, ['name', 'description', 'type', 'parentId', 'baseId', 'refId', 'ofRequired']),
        );
        refresh();
      },
    });
  }

  function getParentOutlinePath(id: string): string {
    const find = findRecursiveChild<OutlineTreeNode>(outlineTreeData.value, id, {
      compareField: 'key',
    });
    if (find?.parent) {
      const upParentPath = getParentOutlinePath(find.parent.key);
      return `${upParentPath ? upParentPath + '/' : ''}${find.parent.title}`;
    }
    return '';
  }

  /**
   * 设计表单
   * @author lingxiaoming
   * @date 2024-07-25 07:27:46
   * @param {string} id 节点id
   */
  function designDoc(node: OutlineTreeNode) {
    const id = node.refId || node.key;
    const parentOutlinePath = getParentOutlinePath(node.key);
    // const designMode = node.refId ? DesignMode.Refer : DesignMode.Collect;
    const designMode = DesignMode.Collect;
    const docName = node.title;
    const url = `${location.origin}${location.pathname}#/Online-form-designer/${id}?parent_outline_path=${parentOutlinePath}&doc_name=${docName}&designMode=${designMode}`;
    window.open(url);
  }

  /**
   * 删除目录节点(表单也用这个删除)
   * @author lingxiaoming
   * @date 2024-07-25 03:09:10
   * @export
   * @param {OutlineTreeNode} node
   */
  async function deleteOutline(node: OutlineTreeNode) {
    await deleteDocOutline({ id: node.key });
  }

  /**
   * 保存目录节点(新建或修改)
   * @author lingxiaoming
   * @date 2024-07-25 06:06:57
   * @param {OutlineTreeNode} node
   */
  async function saveOutline(node: OutlineTreeNode) {
    const data: DocOutlineRequest = {
      baseId: edhrId.value!,
      parentId: node.parentId || edhrId.value!,
      name: node.title,
      type: 'OUTLINE',
    };
    if (!node.key) {
      // 没有主键就是新增
      await postDocOutline(data);
    } else {
      await putDocOutlineById({ id: node.key! }, data);
    }
  }

  /**
   * 拖拽排序目录的节点
   * @author lingxiaoming
   * @date 2024-07-25 07:04:27
   * @param {{ dragKey: string; 拖拽的节点key parentKey?: string; 拖到的父节点key sortNum: number 拖拽后的排序值(节点前就是节点的排序值,节点后就是节点的排序值+1) }} args
   */
  async function dragOutlineNode(args: { dragKey: string; parentKey?: string; sortNum: number }) {
    await postDocOutlineDrag({
      id: args.dragKey,
      targetParentId: args.parentKey || edhrId.value,
      targetSortNum: args.sortNum,
    });
  }

  return {
    loading,
    edhrId,
    firstPageSize,
    outlineTreeData,
    initialize,
    createDoc,
    editDoc,
    designDoc,
    saveOutline,
    deleteOutline,
    dragOutlineNode,
    refresh,
  };
}
