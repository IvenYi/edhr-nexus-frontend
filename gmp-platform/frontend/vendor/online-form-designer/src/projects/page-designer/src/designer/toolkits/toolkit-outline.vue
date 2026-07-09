<template>
  <ScrollContainer>
    <div class="outline-wrapper">
      <a-tree
        default-expand-all
        block-node
        showIcon
        :tree-data="treeData"
        @select="handleSelectNode"
      >
        <template #icon="props">
          <i :class="['iconfont', props.fieldIcon || 'icon-zidingyi']"></i>
        </template>
        <template #title="node">
          <div class="tree-node">
            <span v-ellipsis-title="node.title">{{ t(node.title) }}</span>
          </div>
        </template>
      </a-tree>
    </div>
  </ScrollContainer>
</template>

<script lang="ts" setup name="toolkit-outline">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useScope } from '/@page-designer/hooks/useScope';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { traverseAndBuildTree, findNode } from '/@/utils/helper/treeHelper';
  import { ScrollContainer } from '/@/components/Container';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  // import { cloneDeep } from 'lodash-es';

  const { setSelectedWidget } = useSelectedWidget();
  const { t } = useI18n();
  const { scopeData } = useScope();
  const { pageJson } = useDesigner();

  const handleSelectNode = (_selectedKeys, e) => {
    const widget = findNode(scopeData.value, (node) => {
      return node.id === e.node.key;
    });
    if (widget) {
      setSelectedWidget(widget);
    }
  };

  const treeData = computed(() => {
    const list = traverseAndBuildTree(scopeData.value, (node) => {
      return {
        key: node.id,
        children: node.children,
        title: node.alias || node.name,
        fieldIcon: node.icon,
      };
    });
    return list.filter((n) => {
      return pageJson.pageConfig.hasFooter || !n.key.includes('bottombuttoncontainer');
    });
  });
</script>

<style lang="less" scoped>
  .outline-wrapper {
    padding: 12px;

    :deep(.ant-tree-treenode) {
      position: relative;
      padding: 0;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        transition: background-color 0.3s;
        pointer-events: none;
      }

      &:hover::before {
        content: '';
        position: absolute;
        inset: 0;
        transition: background-color 0.3s;
        background: transparent;
        pointer-events: none;
      }
    }

    :deep(.ant-tree-switcher) {
      width: 14px;
      color: #666;
      line-height: 40px;
    }

    :deep(.ant-tree-switcher .ant-tree-switcher-icon) {
      font-size: 14px;
      vertical-align: middle;
    }

    :deep(.ant-tree-node-content-wrapper) {
      display: flex;
      align-items: center;
      min-height: 40px;

      .ant-tree-iconEle {
        color: #666;
      }

      .ant-tree-title {
        flex: 1;
        margin-left: 4px;
      }

      &:hover {
        background-color: transparent;
      }
    }

    :deep(.ant-tree-treenode.ant-tree-treenode-selected) {
      &::before {
        background: transparent;
        color: var(--ant-primary-color);
      }

      .ant-tree-switcher {
        transition: all 0.3s;
        color: var(--ant-primary-color);
      }

      .ant-tree-iconEle {
        transition: all 0.3s;
        color: var(--ant-primary-color);
      }

      .ant-tree-node-content-wrapper {
        background-color: transparent;
        color: var(--ant-primary-color);
      }
    }

    .tree-node {
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // max-width: 178px;
      span {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  :deep(.scrollbar__wrap) {
    background: #fff;
  }
</style>
