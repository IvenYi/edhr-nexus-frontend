<template>
  <div class="ks-column overflow-hidden h100%">
    <div class="ks-row items-center px8px mb6px">
      <a-input
        :class="[ns.e('search-input')]"
        v-model:value="searchKey"
        :placeholder="$t('sys.keywordsPlaceholder')"
        allowClear
      >
        <template #prefix>
          <i class="iconfont icon-sousuo1"></i>
        </template>
      </a-input>
      <div
        class="text-[#1A1D23] pl4px ml12px cursor-pointer"
        @click="expandedKeys.length > 0 ? collapseAll() : expandAll()"
      >
        <i
          class="gct-iconfont icon-zhedie"
          :class="[expandedKeys.length > 0 ? 'icon-zhedie' : 'icon-zhankai']"
        ></i>
      </div>
    </div>
    <div class="ks-col overflow-hidden">
      <Scrollbar>
        <a-tree
          class="biz-tree h100%"
          :class="[ns.e('tree')]"
          v-model:selectedKeys="selectedKeys"
          default-expand-all
          block-node
          show-icon
          v-model:expandedKeys="expandedKeys"
          :tree-data="filteredTreeData"
          @select="handleSelect"
        >
          <template #title="node">
            <BizTreeNode :data="node">
              <template #ope="{ data }">
                <slot name="opeBtns" :data="data"></slot>
              </template>
            </BizTreeNode>
          </template>
          <template #icon="node">
            <i
              v-show="showIconFunc(node)"
              class="iconfont"
              :class="[node.data?.nodeIcon || 'icon-cangku-shu']"
            ></i>
          </template>
        </a-tree>
      </Scrollbar>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  import BizTreeNode from './biz-tree-node.vue';
  import { NodeItem } from './types';
  import { useNamespace } from '@gct/runtime';
  import { cloneDeep } from 'lodash-es';
  import { recursiveIterate, filterTreeData } from '/@/utils/recursive';
  import { Scrollbar } from '/@/components/Scrollbar';

  const props = withDefaults(
    defineProps<{
      // expandedKeys?: string[];
      treeData: NodeItem[];
      icon?: string;
      iconColor?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'nodeSelect', node: NodeItem): void;
  }>();
  const ns = useNamespace('category-sider');
  const searchKey = ref();
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const selectedNodes = ref<NodeItem[]>([]);

  const filteredTreeData = computed(() => {
    if (searchKey.value?.trim()) {
      const cloneData = cloneDeep(props.treeData);
      const filterData = filterTreeData(cloneData, (item) => {
        return item.title.toLowerCase().includes(searchKey.value?.toLowerCase());
      });
      if (filterData.length > 0) {
        nextTick(() => {
          // 展开所有
          expandAll();
        });
      }
      return filterData;
    } else {
      return props.treeData;
    }
  });
  const showIconFunc = (node) => {
    return !node.data?.disableNodeIcon;
  };

  function collapseAll() {
    expandedKeys.value = [];
  }
  function expandAll() {
    const newExpandKeys: string[] = [];
    recursiveIterate(props.treeData, ({ item }) => {
      if (item.children?.length) {
        newExpandKeys.push(item.key);
      }
    });
    expandedKeys.value = newExpandKeys;
  }

  function handleSelect(stedKeys, e) {
    selectedNodes.value = cloneDeep(e.selectedNodes);
    console.log(selectedNodes.value);
    emit('nodeSelect', e.selectedNodes[0]);
  }

  function getSelectedNode() {
    return selectedNodes.value;
  }

  defineExpose({
    expandAll,
    getSelectedNode,
  });
</script>
<style lang="less" scoped>
  :deep(.ant-tree.biz-tree) {
    color: #1a1d23;

    --tree-ex-line-height: 36px;
    .ant-tree-treenode {
      padding: 0 8px 0 12px;
      align-items: center;
      border-radius: 4px;
      .ant-tree-switcher,
      .ant-tree-iconEle,
      .ant-tree-node-content-wrapper {
        line-height: var(--tree-ex-line-height);
        background-color: transparent;
      }
      .ant-tree-node-content-wrapper {
        width: 1px;
        flex-grow: 1;
        flex-shrink: 1;
        display: flex;
        width: 100%;
        overflow: hidden;
      }
      .ant-tree-switcher {
        display: flex;
        align-items: center;
        width: 16px;
        .anticon {
          font-size: 16px;
          color: #8b8b8b;
        }
      }

      .ant-tree-iconEle {
        width: auto;
        margin: 0 8px;
        color: #8b8b8b;
      }

      .ant-tree-title {
        flex: 1;
        overflow: hidden;
      }

      .biz-node-item-btns {
        display: none;
      }

      &:hover {
        background-color: #f2f5f8;
        .biz-node-item-btns {
          display: block;
        }
      }
      &.ant-tree-treenode-selected {
        color: var(--ant-primary-color);
        font-weight: 500;
        background-color: rgba(from var(--ant-primary-color) r g b / 8%);
        .ant-tree-iconEle {
          color: inherit;
        }
      }

      .ant-tree-checkbox {
        margin: 0 8px 0 0;
      }
    }
  }
</style>
