<template>
  <div class="ipaas-app__tree flex flex-col h-full">
    <div class="pl-16px pr-16px pt-24px">
      <a-input
        class="flex-none"
        v-model:value="searchKey"
        :placeholder="t('sys.searchText')"
        allowClear
      >
        <template #prefix>
          <!-- <search-outlined /> -->
          <i class="iconfont icon-sousuo1"></i>
        </template>
      </a-input>

      <a-button class="mt-10px" type="link" @click.stop="createApp">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.newSth', { sth: t('sys.category') }) }}
      </a-button>
    </div>

    <div class="flex-1 h-1px overflow-auto pl-12px pr-12px">
      <a-tree
        class="ant-tree__override"
        block-node
        :tree-data="treeDataFiltered"
        :fieldNames="{
          key: '_key_',
        }"
        :selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        @select="handleSelect"
      >
        <template #title="{ data }">
          <div
            class="tree-node relative flex items-center pr-10px"
            :class="{
              'is-flow': data._is_flow_,
              'hover:pr-30px': data.id && data._level_ === 2,
            }"
          >
            <SvgIcon v-if="data._level_ === 0" size="20" name="folder" class="mr-6px" />
            <span :title="data._name_" class="ell">{{ data._name_ }}</span>

            <a-dropdown v-if="data.id && data._level_ === 2">
              <ellipsis-outlined class="opacity-0 absolute top-50% right-6px -translate-y-50%" />
              <template #overlay>
                <a-menu class="w-80px" @click="({ key }) => handleMoreClick(data, key as any)">
                  <a-menu-item key="edit">{{ t('sys.edit') }}</a-menu-item>
                  <a-menu-item class="color-error" key="delete">{{ t('sys.delete') }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts" name="treeContainer">
  import { ref, computed, onMounted } from 'vue';
  import { PlusOutlined, SearchOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';
  import type { CategoryResp, FlowMainResp } from '/@/apis/gct-ipaas/model';
  import { useFlowEntry } from './useFlowEntry';
  import { findNodeInTree } from '/@ipaas/utils';

  // const emit = defineEmits(['click-flow', 'edit-flow', 'delete-flow']);

  const { t } = useI18n();
  const { treeData, initTreeData, createApp, editApp, deleteApp, getFlowDetail } = useFlowEntry();

  const searchKey = ref('');
  const expandedKeys = ref<(string | number)[]>([]);
  const selectedKeys = ref<(string | number)[]>([]);

  onMounted(() => {
    initTreeData();
  });

  const treeDataFiltered = computed(() => {
    const key = searchKey.value.trim();
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
    // 点击文本展开/收起节点
    if (node.dataRef.children?.length) {
      const keyIndex = expandedKeys.value.findIndex((item) => item === node.dataRef._key_);
      if (keyIndex >= 0) {
        expandedKeys.value.splice(keyIndex, 1);
      } else {
        expandedKeys.value.push(node.dataRef._key_);
      }
    }
    // 不可取消选中
    if (sKeys.length === 0) return;
    // // 文件夹不可选中
    if (node.dataRef.children) return;
    selectedKeys.value = [node.dataRef._key_];
    getFlowDetail(node.dataRef.fuuid);
  };

  /**
   * 下拉菜单点击事件
   */
  const handleMoreClick = (data: CategoryResp | FlowMainResp, key: 'edit' | 'delete') => {
    if ('modelKey' in data) {
      // switch (key) {
      //   case 'edit':
      //     editFlow(data as CategoryResp);
      //     break;
      //   case 'delete':
      //     deleteFlow(data as CategoryResp);
      //     break;
      //   default:
      //     break;
      // }
    } else {
      switch (key) {
        case 'edit':
          editApp(data as CategoryResp);
          break;
        case 'delete':
          deleteApp(data as CategoryResp);
          break;
        default:
          break;
      }
    }
  };
</script>

<style scoped lang="less">
  :deep(.color-error) {
    color: var(--ant-error-color);
  }

  .tree-node {
    .opacity-0 {
      transition: all 0.3s;
    }
    &:hover {
      .opacity-0 {
        opacity: 1;
      }
    }
  }
</style>

<style lang="less">
  @import './ant-tree.less';
</style>

<style lang="less">
  // .ant-tree__override .ant-tree-treenode:has(.is-flow) .ant-tree-switcher {
  //   width: 0;
  // }
</style>
