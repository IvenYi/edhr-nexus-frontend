import { ref, reactive, unref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { message } from 'ant-design-vue';

const isExistUser2SelectOrg = ref<boolean>(false);
const selectedTreeKey = ref<Array<string | number>>();
const selectTreeNode = reactive({ node: {} });
const treeData = ref<any[]>([]);
const treeOrignalData = ref<any[]>([]);
const searchTreeOrignalData = ref<any[]>([]);
const rootId = ref<string>();
const searchParams = ref();

interface TreeFunc {
  init: Function | undefined;
  add: Function | undefined;
  update: Function | undefined;
  delete: Function | undefined;
  search: Function | undefined;
}
export function useTreeList() {
  const treeFunc: TreeFunc = {
    init: undefined,
    add: undefined,
    update: undefined,
    delete: undefined,
    search: undefined,
  };
  /**
   * 初始化树的方法
   */
  async function initTree(api: Function) {
    treeOrignalData.value = await api();

    rootId.value = getTreeRootId();
    treeData.value = transformTreeData(treeOrignalData.value, rootId.value);

    treeFunc.init || (treeFunc.init = api);
    treeOrignalData.value = treeOrignalData.value.map((item) => {
      return {
        ...item,
        userOrgName: getTreeNamePathArr(item.id).join('/'),
      };
    });
  }

  async function searchTreeData(api: Function, data) {
    searchTreeOrignalData.value = await api(data);
    searchParams.value || (searchParams.value = data);
    treeFunc.search || (treeFunc.search = api);
  }

  function clearSearchTreeData() {
    searchTreeOrignalData.value = [];
    searchParams.value = undefined;
    treeFunc.search = undefined;
  }

  /** 获取根节点 */
  function getTreeRootId(list?) {
    const parentIds = [...new Set((list ?? treeOrignalData.value).map((item) => item.parentId))];

    // ! 如果存在root那么root当根节点
    if (parentIds.includes('ROOT')) {
      return 'ROOT';
    }

    // ! 当id和tenantId一样肯定就是根节点了
    const root = (list ?? treeOrignalData.value).find((item) => item.id === item.tenantId);
    if (root) {
      return root.parentId;
    }
    return '';
  }

  /**
   * 将后端扁平化数据解析成树结构的方法
   * @param list 树LIST
   * @param parentId 父ID
   * @returns 包含children的树结构
   */
  function transformTreeData(list, parentId = 'ROOT', index = 1) {
    const tree: any[] = [];
    for (let i = 0; i < list.length; i++) {
      const node = list[i];

      if (node.parentId === parentId) {
        const item = transformTreeData(list, node.id, index + 1);

        if (item.length > 0) {
          // 添加数层级
          node.children = item.map((i) => {
            i.indexDeep = index;
            return i;
          });
        } else {
          node.children = [];
        }
        tree.push(node);
      }
    }
    return tree;
  }
  /**
   * 设置选中的树节点
   */
  function setTreeSelect(key, node) {
    selectedTreeKey.value = key;
    selectTreeNode.node = node;
  }

  /**
   * 添加树节点
   */
  async function addTreeNode(api: Function, data) {
    await api(data);
    treeFunc.add || (treeFunc.add = api);
    treeFunc.init && initTree(treeFunc.init);
    treeFunc.search && searchTreeData(treeFunc.search, searchParams.value);
  }
  /**
   * 添加树节点
   */
  async function updateTreeNode(api: Function, data, opts?) {
    await api(opts ?? data.id, data);
    treeFunc.update || (treeFunc.update = api);
    treeFunc.init && initTree(treeFunc.init);
    treeFunc.search && searchTreeData(treeFunc.search, searchParams.value);
  }

  async function deleteTreeNode(api: Function, data) {
    await api(data);
    treeFunc.delete || (treeFunc.delete = api);
    treeFunc.init && initTree(treeFunc.init);
    treeFunc.search && searchTreeData(treeFunc.search, searchParams.value);
  }

  async function dragTreeNode(api: Function, data) {
    await api(data);
    treeFunc.init && initTree(treeFunc.init);
  }

  //顶部面包屑
  const getTreeNamePathArr = (treeNodeId: string) => {
    const arr = [];
    const treeNode = treeOrignalData.value.find((d) => d.id === treeNodeId);
    if (!treeNode) {
      return arr;
    }
    treeNode.fullPath.split('/').forEach((nodeId) => {
      const node = treeOrignalData.value.find((d) => {
        return nodeId == d.id;
      });
      if (node) {
        arr.push(node.name);
      }
    });
    return arr;
  };

  /** 过滤组织树 */
  const getFilterTreeData = (selectInfo) => {
    const filterData = cloneDeep(unref(treeOrignalData.value)).filter(
      (item) => item.tenantId === selectInfo.tenantId,
    );
    const rootId = getTreeRootId(filterData);
    const filterTreeData = transformTreeData(filterData, rootId);

    return filterTreeData;
  };

  /** 设置当前所选组织下是否存在用户 */
  const setOrgsExistUser = (userList) => {
    isExistUser2SelectOrg.value = userList.length !== 0;
  };

  const restTree = () => {
    isExistUser2SelectOrg.value = false;
    selectedTreeKey.value = undefined;
    selectTreeNode.node = {};
    treeData.value = [];
    treeOrignalData.value = [];
    searchTreeOrignalData.value = [];
    rootId.value = undefined;
    searchParams.value = undefined;
  };

  return {
    initTree,
    addTreeNode,
    updateTreeNode,
    deleteTreeNode,
    dragTreeNode,
    treeData,
    treeOrignalData,
    transformTreeData,
    setTreeSelect,
    selectedTreeKey,
    selectTreeNode,
    getTreeNamePathArr,
    getFilterTreeData,
    isExistUser2SelectOrg,
    setOrgsExistUser,
    searchTreeData,
    clearSearchTreeData,
    searchTreeOrignalData,
    restTree,
  };
}

export default useTreeList;
