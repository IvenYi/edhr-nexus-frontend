import { ref, reactive, unref, computed, toRefs, onUnmounted } from 'vue';
import { findNode } from '/@/utils/helper/treeHelper';
import { ModuleKeyPrefix } from '/@/layouts/tree-sider-page/constant';
import { CategoryType, CategoryEnum } from '/@/layouts/tree-sider-page/enum';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { useRemoteDoc } from '/@/hooks/develop/useRemoteDoc';

// import { SiderTab } from './index.d';
const { getGlobalMethods } = useRemoteDoc();

function getData() {
  return {
    siderTab: undefined,
    selectedTreeKey: '',
    selectedTreeNode: { node: {} },
    treeData: [],
    treeMap: {},
    moduleData: { enum_module: [], entity_module: [] },
  };
}

const treeSiderData = reactive({
  default: getData(),
});

// // 当前侧边栏
// const siderTab = ref<CategoryType>();
// // 选中的节点key
// const selectedTreeKey = ref<string>();
// // 选中的节点数据
// const selectedTreeNode = reactive({ node: {} });
// // 分类树
// const treeData = ref<Array<Object>>([]);

// const moduleData = ref({ enum_module: [], entity_module: [] });

export function useTreeSiderPage(pageName = 'default') {
  onUnmounted(() => {
    // treeSiderData[pageName] = undefined
  });
  if (!treeSiderData[pageName]) {
    treeSiderData[pageName] = getData();
  }
  const siderData = treeSiderData[pageName];
  const { siderTab, selectedTreeKey, treeData, moduleData, treeMap } = toRefs(siderData);
  const { selectedTreeNode } = siderData;
  /**
   * 设置侧边栏tab
   * @param value
   */
  function setSiderTab(value: number) {
    siderTab.value = value;
  }

  async function initTreeData() {
    let res: any = [];
    if (siderTab.value === CategoryEnum.GLOBAL_METHOD) {
      res = await getGlobalMethods();
    } else {
      res = await getCategoryListComplete({ module: unref(siderTab) as string });
    }
    window.console.log(res);
    if (['entity_module', 'enum_module'].includes(unref(siderTab) as string)) {
      moduleData.value[unref(siderTab) || 'entity_module'] = res!;
    }
    treeData.value = res!.map((i, idx) => {
      treeMap.value[i.id] = i.name;
      return {
        ...i,
        index: idx + 1,
      };
    });
    return treeData.value;
  }

  /**
   * 设置选中的树节点
   */
  function setTreeSelected(id, node?) {
    if (!id || id.startsWith('___new___')) {
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
      return findObj;
    }
    selectedTreeNode.node = node;
    return node;
  }

  const sliderTabKeyPrefix = computed(() => {
    return ModuleKeyPrefix[unref(siderTab) ?? ''] ?? '';
  });
  function reset() {
    // siderTab.value = undefined;
    selectedTreeKey.value = '';
    selectedTreeNode.node = {};
    treeData.value = [];
    treeMap.value = {};
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
    moduleData,
    treeMap,
  };
}
