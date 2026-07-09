<template>
  <div class="tabs ks-column">
    <a-tabs v-model:activeKey="activeKey" centered :animated="false" @change="changeTab">
      <a-tab-pane :key="DataTabEnum.SYS_MODULAR" tab="系统模块" />
      <a-tab-pane :key="DataTabEnum.APP_MODULAR" tab="应用模型" />
    </a-tabs>
    <div class="pl12px pr12px ks-column ks-col pb12px">
      <a-input
        v-model:value="appName"
        :placeholder="activeKey === DataTabEnum.SYS_MODULAR ? '搜索模块名称' : '搜索模型名称'"
        @pressEnter="searchTab"
      >
        <template #prefix>
          <search-outlined />
        </template>
      </a-input>
      <div class="pl12px h36px ks-row-middle"> <a @click="allChicked">全选</a> </div>

      <div class="ks-col" ref="refTree">
        <a-tree
          :key="activeKey"
          v-if="refTree"
          :height="refTree.clientHeight"
          blockNode
          default-expand-all
          v-model:selectedKeys="selectedKeys"
          :checkedKeys="checkedKeys"
          checkable
          :tree-data="filterTree || treeData"
          @check="checked"
          @select="selected"
          :fieldNames="{ key: 'id' }"
        >
          <template #title="{ name }">
            <div class="name">
              {{ name }}
            </div>
          </template>
        </a-tree>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed, nextTick, inject } from 'vue';
  import { DataTabEnum, CheckedData, SysPageEnum } from '../../const';
  import { sysPageOptions } from '../../setting';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const defProps = defineProps<{
    appId: string;
    suiteKey?: string;
    selectKey: string;
    checkedModal: CheckedData[];
  }>();
  const emit = defineEmits(['update:selectKey', 'addBarKeys']);
  const activeKey = ref(DataTabEnum.SYS_MODULAR);
  /**选中项 */
  const checkedKeys = computed(() => {
    return defProps.checkedModal.filter((i) => i.type === activeKey.value).map((i) => i.key);
  });
  const selectedKeys = computed(() => [defProps.selectKey]);
  const refTree = ref();
  const appName = ref();
  const moduleDate = ref([]);
  const filterTree = ref();

  const sourceEnv = inject('sourceEnv') as any;
  const branchId = inject('branchId') as any;

  const handleQueryData = async () => {
    const isDev = sourceEnv.sourceEnv === 'dev';
    if (isDev && !branchId.value) return;

    moduleDate.value = await getCategoryListComplete(
      { module: ModelTypeEnum.ENTITY as string },
      {
        transferToConfig: {
          headers: {
            'App-Tag': defProps.appId,
            Env: sourceEnv.sourceEnv,
            'Branch-Id': isDev ? branchId.value : '',
          },
        },
      },
    );
  };

  onMounted(() => {
    handleQueryData();
  });

  const treeData = computed(() => {
    if (activeKey.value === DataTabEnum.SYS_MODULAR) {
      const tree = sysPageOptions.map((i) => {
        if (i.id === 4 && defProps.suiteKey !== 'MEDPRO') {
          i.children = [
            {
              id: SysPageEnum.FORM_DESIGN,
              name: '表单设计',
            },
          ];
        } else if (i.id === 4 && defProps.suiteKey == 'MEDPRO') {
          i.children = [
            {
              id: SysPageEnum.FORM_DESIGN,
              name: '表单设计',
            },
            {
              id: SysPageEnum.EDHR_DESIGN,
              name: 'eDHR设计',
            },
          ];
        }
        return { ...i };
      });
      return tree;
    } else {
      return moduleDate.value
        .map((i) => {
          return { ...i, selectable: false };
        })
        .filter((i) => i?.children?.length);
    }
  });

  function findNodeByName(node, name) {
    if (node?.name.includes(name)) {
      return node; // 找到节点，返回该节点
    } else if (node.children) {
      const childs = node.children.filter((i) => i.name.includes(name));
      return childs.length ? { ...node, children: childs } : null;
    }
    return null; // 没有找到，返回null
  }

  function checked(_, { node }) {
    if (node.children) {
      // 如果没有打开的，打开并定位到第一个
      defProps.selectKey || node.checked || emit('update:selectKey', node.children[0].id);

      emit('addBarKeys', !node.checked, activeKey.value, [...node.children], 'checked');
    } else {
      // 如果没有打开的，打开并定位到第一个
      defProps.selectKey || node.checked || emit('update:selectKey', node.id);

      emit('addBarKeys', !node.checked, activeKey.value, [node.dataRef], 'checked');
    }
  }
  function selected(_, { node }) {
    emit('update:selectKey', node.id);
    emit('addBarKeys', node.checked, activeKey.value, [node.dataRef], 'select');
  }

  function allChicked() {
    const nodes = treeData.value.map((i) => i.children).flat();
    emit('addBarKeys', true, activeKey.value, [...nodes], 'checked');
  }

  function searchTab() {
    if (appName.value) {
      filterTree.value = treeData.value
        .map((i) => {
          const tree = findNodeByName(i, appName.value);
          return tree || [];
        })
        .filter((i) => i.id);
      log;
    } else {
      filterTree.value = undefined;
    }
  }

  const changeTab = () => {
    appName.value = '';
    searchTab();
  };
  defineExpose({});
</script>
<style scoped lang="less">
  .tabs {
    width: 300px;
    border-right: 1px solid #e0e3ea;
  }

  :deep(.ant-tree-node-content-wrapper) {
    &:hover {
      background-color: transparent;
    }
  }

  :deep(.ant-tree-treenode-selected) {
    background-color: hsl(from var(--ant-primary-color) h s 95%);
    color: #212528;

    .ant-tree-node-content-wrapper {
      background-color: transparent;
      color: #212528;
    }
  }

  :deep(.ant-tree-treenode) {
    align-items: center;
    height: 36px;
    padding-bottom: 0;

    .ant-tree-checkbox {
      margin: 0 4px;
      margin-top: 0;
    }

    .ant-tree-switcher {
      width: 12px;
      margin-right: 4px;
      padding-top: 8px;

      .ant-tree-switcher-icon {
        font-size: 14px;

        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }

    &:hover {
      background: hsl(from var(--ant-primary-color) h s 95%);
    }
  }
  .name {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
