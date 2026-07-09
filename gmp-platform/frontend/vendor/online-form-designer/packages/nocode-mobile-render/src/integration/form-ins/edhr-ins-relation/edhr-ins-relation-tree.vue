<template>
  <div :class="['edhr-ins-relation-tree']">
    <PureTree :nodes="treeNodes" @node-arrow-click="onArrowClick">
      <template #nodeArrow="{ node }">
        <gct-icon
          :class="['node-arrow', node.expanded ? 'node-arrow--expanded' : '']"
          value="icon-pad_arrow_down_tree"
          :size="16"
        />
      </template>
      <template #node="{ node }">
        <div class="flex-grow-1 w-1px">
          <div class="">
            <div class="flex main-title" :title="node.__origin.materialNo">
              <span class="flex-shrink-0"> 关联批次： </span>
              <span class="link-no" @click.stop="() => onView(node)">
                {{ node.__origin.materialNo }}
              </span>
            </div>
          </div>
          <div class="node-detail">
            <div class="overflow-ellipsis">
              关联产品：{{ calcRdoName(node.__origin.productName, node.__origin.productVersion) }}
            </div>
            <div class="overflow-ellipsis">
              关联DHR：{{ calcRdoName(node.__origin.tmplName, node.__origin.tmplVersion) }}
            </div>
          </div>
        </div>
      </template>
    </PureTree>
  </div>
</template>

<script lang="ts" setup name="edhr-ins-relation-tree">
  import { i18n } from '@mobile/locales/setupI18n';
  import { IPureTreeNode, PureTree, NodeTitle } from '../../../components/_common_/pure-tree';
  import { EdhrInstanceResponse } from '/@/apis/gct-apaas/model';
  import { computed, reactive } from 'vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      treeData: EdhrInstanceResponse[];
      idProp?: string;
    }>(),
    {
      idProp: 'id',
    },
  );

  const emit = defineEmits<{
    (e: 'view', node: any): void;
  }>();
  const selectedNodeId = ref();
  const cacheExpanded = reactive({});

  const onArrowClick = (node) => {
    console.log('onArrowClick', node);
    cacheExpanded[node.id] = !node.expanded;
  };
  function recursiveToNode(
    node: EdhrInstanceResponse,
  ): IPureTreeNode & { __origin: EdhrInstanceResponse } {
    return {
      id: node.id!,
      name: node.tmplName!,
      expanded: cacheExpanded[node.id!] ?? true,
      __origin: node,
      children: node.children?.map(recursiveToNode),
      selected: selectedNodeId.value === node.id,
    };
  }

  const treeNodes = computed(() => {
    return props.treeData.map(recursiveToNode);
  });

  const onView = (node) => {
    emit('view', node.__origin);
  };

  function calcRdoName(name: string, version?: string) {
    return `${name}${version ? ':' + version : ''}`;
  }
</script>

<style lang="less" scoped>
  .edhr-ins-relation-tree {
    :deep(.pure-tree__node-wrapper-level-0) {
      margin-bottom: 8px;
      border-radius: 8px;
      background: #fff;
    }

    :deep(.pure-tree__node-wrapper-children .pure-tree__node) {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: -16px;
        right: 0;
        width: calc(100% + 20px);
        height: 1px;
        background: #e0e3eb;
      }
    }

    :deep(.pure-tree) {
      --pure-tree__text-color: #1a1d23;

      .pure-tree__node-arrow-indent {
        width: 20px;
      }

      .pure-tree__node-wrapper-content {
        padding: 16px;
      }
    }

    :deep(.pure-tree__node-arrow) {
      margin-right: 6px;
    }

    .overflow-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // 箭头样式调整
    :deep(.pure-tree .pure-tree__node-arrow) {
      align-self: self-start;
    }

    .node-arrow {
      transform: rotate(-90deg);
      transition: transform 0.3s;
    }

    .node-arrow--expanded.node-arrow {
      transform: rotate(0);
    }

    // 主信息
    .main-title {
      font-size: 14px;
    }

    .link-no {
      overflow: auto;
      color: #026ac8ff;
      white-space: nowrap;
      cursor: pointer;
    }

    // 详细信息
    .node-detail {
      color: #8b8b8b;
      font-size: 12px;
    }
  }
</style>
