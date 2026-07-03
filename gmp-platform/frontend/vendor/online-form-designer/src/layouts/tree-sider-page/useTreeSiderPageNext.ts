import { ref, reactive, unref, computed } from 'vue';
import { findNode } from '/@/utils/helper/treeHelper';
import { ModuleKeyPrefix } from '/@/layouts/tree-sider-page/constant';
import {
  postCategory,
  getCategoryListComplete,
  putCategoryById,
  deleteCategory,
  postCategoryDrag,
} from '/@/apis/gct-apaas/CategoryController';

// import { SiderTab } from './index.d';

type ISdierTab = number | string;
// 当前侧边栏
const siderTab = ref<ISdierTab>();

// 选中的节点key
const selectedTreeKey = ref<string>();
// 选中的节点数据
const selectedTreeNode = reactive({ node: {} });
// 分类树
const treeData = ref<Array<Object>>([]);

export function useTreeSiderPage() {
  /**
   * 设置侧边栏tab
   * @param value
   */
  function setSiderTab(value: number) {
    siderTab.value = value;
  }

  async function initTreeData() {
    const res = await getCategoryListComplete({ module: unref(siderTab) });
    window.console.log(res);
    treeData.value = res!;
  }

  /**
   * 设置选中的树节点
   */
  function setTreeSelected(id, node?) {
    if (!id) {
      selectedTreeKey.value = undefined;
      selectedTreeNode.node = {};
      return;
    }
    selectedTreeKey.value = id;

    if (!node) {
      const findObj = findNode(treeData.value, (node) => {
        return node.id == id;
      });
      selectedTreeNode.node = findObj;
      return;
    }
    selectedTreeNode.node = node;
  }

  const sliderTabKeyPrefix = computed(() => {
    return ModuleKeyPrefix[unref(siderTab) ?? ''] ?? '';
  });
  function reset() {
    console.log('clear');
    // siderTab.value = undefined;
    selectedTreeKey.value = '';
    selectedTreeNode.node = {};
    treeData.value = [];
  }

  return {
    siderTab,
    sliderTabKeyPrefix,
    setSiderTab,
    treeData,
    initTreeData,
    selectedTreeKey,
    selectedTreeNode,
    setTreeSelected,
    reset,
  };
}
