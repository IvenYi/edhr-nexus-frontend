<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="pt16px pb16px px16px">
      <a-input
        v-model:value="searchVal"
        :placeholder="$t('sys.keywordsPlaceholder')"
        allowClear
        style="border-radius: 4px; padding-top: 1px; padding-bottom: 1px"
      >
        <template #suffix>
          <i class="iconfont icon-sousuo text-[#797A7D] text-[13px]"></i>
        </template>
      </a-input>
    </div>
    <Scrollbar>
      <a-tree
        v-model:selectedKeys="selectedKeys"
        v-model:expandedKeys="curStatistics.expandedIds"
        :tree-data="catalogTreeData"
        :checkable="!readonlySummary"
        checkStrictly
        blockNode
        class="gct-custom-tree"
        :class="[readonlySummary && 'disabled']"
        :fieldNames="{ key: 'id_', title: 'name_' }"
        @select="onSelectTree"
        @check="onCheckTree"
      >
        <template #title="{ data }">
          <TreeNode
            :data="data"
            :key="data?.id_"
            :data-tmplid="data?.form_tmpl_id_"
            :data-id="data?.id_"
            :data-sourceEdhr="data?.source_edhr_inst_id_"
            :data-sourceRoot="data?.source_root_"
            :disabled="
              readonlySummary ||
              (data?.source_edhr_inst_id_ &&
                data?.source_edhr_inst_id_ !== edhrInfo.edhrInstId &&
                !data?.source_root_)
            "
            class="node-title-item"
            :class="[selectedTreeId[0] === data?.id_ && 'selected', data.hidden && 'hidden']"
          />
        </template>
      </a-tree>
    </Scrollbar>
  </div>
</template>
<script setup lang="ts">
  import Sortable from 'sortablejs';
  import { onMounted, ref, watch } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import TreeNode from './tree-node.vue';
  import { useEdhrSummary } from '../hook/useEdhrSummary';
  import { OutlineType } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';

  const props = defineProps<{
    // selectedIds: any[];
  }>();

  onMounted(() => {
    init();
  });

  const emit = defineEmits(['on-select', 'on-check', 'update:selectedIds']);

  const {
    catalogTreeData,
    selectedTreeId,
    findTreeNode,
    updateTreeData,
    readonlySummary,
    curStatistics,
    edhrInfo,
  } = useEdhrSummary();

  const searchVal = ref<string | undefined>();
  const selectedKeys = ref<string[]>([]);
  const relateTreeId = ref<any>();
  const isBefore = ref<boolean>(false);

  // const list = computed(() => {
  //   // if (searchVal.value && searchVal.value.trim()) {
  //   // }
  //   return filterTree(catalogTreeData.value, searchVal.value?.trim());
  //   // return catalogTreeData.value;
  // });

  watch(
    () => searchVal.value,
    (val) => {
      filterTree(catalogTreeData.value, val?.trim());
    },
  );

  const onSelectTree = (stedKeys, e) => {
    if (e.node?.type_ !== OutlineType.DOC) return;
    emit('on-select', stedKeys, e.node?.dataRef);
  };

  const onCheckTree = (chkedKeys, e) => {
    emit('on-check', chkedKeys.checked, e);
  };

  function filterTree(data, val) {
    data.forEach((e) => {
      // 先重置
      if (e.children?.length) filterTree(e.children, val);
      e.hidden = val
        ? !(val && e.name_?.includes(val)) && (!e.children || e.children.every((f) => f.hidden))
        : false;
    });
  }

  function init() {
    if (readonlySummary.value) return;
    const rows = document.querySelector(
      '.ant-tree-list .ant-tree-list-holder-inner',
    ) as HTMLElement;
    new Sortable(rows, {
      group: {
        name: 'edhrSummaryGroup',
        pull: false,
        put: true,
      },
      dataIdAttr: 'form_tmpl_id_',
      // sort: false,
      animation: 150,
      filter: '.no-drag',
      handle: '.ant-tree-treenode',
      ghostClass: 'inst-list-ghost',
      dragClass: 'inst-list-dragged',
      onStart: (e) => {
        const dragId = e.item?.querySelector('.node-title-item')?.getAttribute('data-id');
        const dragItem = findTreeNode(dragId);
        if (dragItem.children?.length) {
          curStatistics.value.expandedIds = curStatistics.value.expandedIds.filter(
            (e) => e !== dragId,
          );
        }
      },
      onMove: (e) => {
        // console.log('tree-move----', e)
        console.log(e.related?.classList);
        const relatedItem = e.related?.querySelector('.node-title-item');
        const sourceRoot = relatedItem?.getAttribute('data-sourceRoot');
        relateTreeId.value = relatedItem?.getAttribute('data-id');
        // const clsList = e?.related?.classList;
        isBefore.value = e.draggedRect?.top > e.relatedRect?.top;
        const sourceEdhr = relatedItem?.getAttribute('data-sourceEdhr');
        if (sourceRoot !== '1' && sourceEdhr && sourceEdhr !== edhrInfo.value.edhrInstId) {
          const rootNode = findTreeNode(
            '',
            (n) => sourceEdhr === n.source_edhr_inst_id_ && n.source_root_,
          );
          relateTreeId.value = rootNode?.id_;
          isBefore.value = false;
          curStatistics.value.expandedIds = curStatistics.value.expandedIds.filter(
            (e) => e !== relateTreeId.value,
          );
        }
        if (sourceRoot === '1') {
          curStatistics.value.expandedIds = curStatistics.value.expandedIds.filter(
            (e) => e !== relateTreeId.value,
          );
        }
      },
      onEnd: (e) => {
        // console.log('tree-end', e);
        const { newIndex, oldIndex } = e;
        if (newIndex === oldIndex) return;
        const dragId = e.item?.querySelector('.node-title-item')?.getAttribute('data-id');
        const dragItem = findTreeNode(dragId);
        updateTreeData(dragId);
        updateTreeData(relateTreeId.value, catalogTreeData.value, dragItem, isBefore.value);
      },
      onAdd: (e) => {
        // console.log('tree-onAdd', e);
      },
      onChange: (e) => {
        // console.log('tree-onAdd', e);
      },
    });
  }
</script>
<style lang="less" scoped>
  :deep(.gct-custom-tree.disabled) {
    .ant-tree-treenode {
      &::before {
        content: '' !important;
      }
    }
  }
  :deep(.ant-tree-treenode) {
    padding: 6px 16px 6px 8px;
    // margin-left: 8px;
    // margin-right: 8px;
    &::before {
      font-family: 'iconfont' !important;
      font-size: 16px;
      font-style: normal;
      -webkit-font-smoothing: antialiased;
      content: '\e8fb';
    }

    &.no-drag {
      &::before {
        content: ' ';
      }
    }

    &:has(.related-outline) {
      position: relative;
      overflow: hidden;
      background-color: #f9fafb;
      &::after {
        text-align: center;
        font-size: 10px;
        color: #fff;
        content: 'DHR';
        display: inline-block;
        background: linear-gradient(315deg, #2597ff 0%, #026ac8 100%);
        width: 50px;
        position: absolute;
        right: -14px;
        top: 3px;
        transform: rotate(45deg);
      }
    }

    &:has(.hidden) {
      display: none;
    }
    .ant-tree-switcher {
      // width: 16px;
      // margin-left: 8px;
      // margin-right: 8px;
    }
    .edit-icon {
      display: none;
    }
    &:hover {
      background-color: rgba(2, 106, 200, 0.03);
      .edit-icon {
        display: flex;
        align-content: center;
      }
    }

    &.ant-tree-treenode-selected {
      background: rgba(2, 106, 200, 0.08);
      border-radius: 4px;
    }

    .ant-tree-node-content-wrapper {
      flex: 1;
      overflow: hidden;
    }
  }
  :deep(.ant-tree-treenode:not(:has(.ant-tree-indent .ant-tree-indent-unit))) {
    position: relative;
    background-color: #f9fafb;
    border-top: 1px solid #e0e3eb;
  }

  :deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected),
  :deep(.ant-tree .ant-tree-node-content-wrapper:hover) {
    background-color: transparent;
  }
  :deep(.ant-tree) {
    .vxe-body--row:not(.inst-list-ghost) {
      display: none !important;
    }
  }
</style>
