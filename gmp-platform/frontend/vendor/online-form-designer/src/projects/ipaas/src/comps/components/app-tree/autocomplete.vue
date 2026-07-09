<template>
  <div ref="AutocompleteRef">
    <a-popover
      overlayClassName="app-tree__autocomplete-popover"
      trigger="hover"
      :get-popup-container="() => AutocompleteRef"
      v-model:visible="visible"
    >
      <template #content>
        <a-tree
          v-if="treeDataFiltered.length > 0"
          class="app-tree__tree-instance"
          :selected-keys="[]"
          block-node
          :tree-data="treeDataFiltered"
          :fieldNames="{
            key: '_key_',
            title: '_name_',
          }"
          @select="handleSelect"
          v-model:expanded-keys="expandedKeys"
        />
        <div v-else class="pt-30px pb-20px">
          <a-empty class="important-m-0px" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </template>
      <div>
        <slot></slot>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { getCategoryTree, deleteAppById } from '/@/apis/gct-ipaas/IpaasCategoryController';
  import type { CategoryTreeResp } from '/@/apis/gct-ipaas/model';
  import { findNodeInTree } from '/@ipaas/utils';
  import { Empty } from 'ant-design-vue';

  const props = defineProps<{
    value?: string;
  }>();

  const emit = defineEmits(['update:value', 'app-change']);

  const treeData = ref<CategoryTreeResp[]>([]);
  const AutocompleteRef = ref();
  const visible = ref<boolean>(false);
  const expandedKeys = ref<(string | number)[]>([]);

  /**
   * 修改数数据 增加层级 名称显示等字段
   * @param list
   * @param level
   * @param path
   * @returns
   */
  const _transferTree = (list, level = 0, path = '') => {
    list.forEach((item) => {
      item._key_ = path + (path ? '/' : '') + (level > 1 ? item.id : item.name);
      item._name_ = level === 2 ? item.version : item.name;
      item._level_ = level;
      if (level === 2) {
        item.children = undefined;
      }
      if (item.children) {
        _transferTree(item.children, level + 1, item._key_);
      }
    });
    return list;
  };

  /**
   * 初始化
   */
  async function initTreeData() {
    const res = await getCategoryTree();
    treeData.value = _transferTree(res ?? []);
  }

  onMounted(() => {
    initTreeData();
  });

  const treeDataFiltered = computed(() => {
    const key = props.value?.trim();
    if (key) {
      const { tree, hitKeys } = findNodeInTree(treeData.value, key);
      const keys = hitKeys
        .map((hitKey) => {
          const kk = hitKey.split('/');
          kk.pop();
          return kk.reduce((s, k) => {
            if (s.length === 0) {
              s.push(k);
            } else {
              s.push(s[s.length - 1] + '/' + k);
            }
            return s;
          }, []);
        })
        .flat();
      expandedKeys.value = [...new Set([...expandedKeys.value, ...keys])];
      return tree;
    } else {
      return treeData.value;
    }
  });

  /**
   * 节点选中事件
   */
  const handleSelect = (sKeys, { node }) => {
    if (node.dataRef._level_ !== 2) return;
    emit('app-change', node.dataRef);
    visible.value = false;
  };
</script>

<style lang="less">
  .app-tree__autocomplete-popover {
    width: 100%;
    padding-top: 0px;

    .ant-popover-arrow {
      display: none;
    }
    .ant-popover-inner-content {
      padding: 0;
    }
  }

  .app-tree__tree-instance {
    max-height: 300px;
    overflow: auto;
    padding: 6px 4px;
  }
</style>
