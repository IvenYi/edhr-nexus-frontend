<template>
  <div class="h-full ks-column">
    <div v-if="!readonlySummary" class="ks-row items-center px16px pt12px">
      <div class="primary-gct cursor-pointer" @click="onAdd()">
        <i class="iconfont icon-a-btn_add1 mr6px ml2px lh-13px h-16px vertical-middle"></i>
        {{ $t('sys.newSth', { sth: $t('sys.edhr.catalog') }) }}
      </div>
      <a-divider type="vertical" style="background-color: #e0e3eb" />
      <i
        class="iconfont icon-shanchu3"
        :class="[
          checkedTreeNodes?.length <= 0
            ? 'cursor-not-allowed text-[#C6C6C6]'
            : 'cursor-pointer text-[#1A1D23]',
        ]"
        @click="onDelete"
      ></i>
      <!-- <div class="ks-col primary-gct text-right cursor-pointer">退出编辑模型</div> -->
    </div>
    <!-- <div v-if="false" class="ks-row items-center px16px">
      <div class="primary-gct cursor-pointer">全部折叠/展开</div>
      <div class="primary-gct ks-col text-right cursor-pointer">编辑信息</div>
    </div> -->
    <DraggableTree
      v-if="catalogTreeData?.length"
      @on-check="onCheckTree"
      @on-select="onSelectTree"
    />
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import DraggableTree from './draggable-tree.vue';
  import { useEdhrSummary } from '../hook/useEdhrSummary';
  import { Modal } from 'ant-design-vue';

  const {
    edhrInfo,
    newOutLine,
    catalogTreeData,
    getFormInstDataById,
    selectedTreeId,
    setSelectedTreeNode,
    findTreeNode,
    formInstData,
    loadingMiddle,
    deleteTreeNode,
    readonlySummary,
    curStatistics,
  } = useEdhrSummary();

  const checkedTreeNodes = ref([]);

  const rootParentId = computed(() => {
    const tmplIdArr = edhrInfo.value?.tmplId?.split(':') || [];
    return tmplIdArr.length > 1 ? tmplIdArr[1] : tmplIdArr[0];
  });

  const onAdd = () => {
    const emptyNode = findTreeNode('', (n) => n.isEdit);
    if (emptyNode) return;
    const obj = newOutLine({
      parent_id_: rootParentId.value,
    });
    if (!obj) return;
    catalogTreeData.value.push(obj);
    if (!curStatistics.value.expandedIds.includes(rootParentId.value)) {
      curStatistics.value.expandedIds.push(rootParentId.value);
    }
  };

  const onDelete = () => {
    if (!checkedTreeNodes.value?.length) return;
    Modal.confirm({
      title: $t('sys.edhr.confirmToDelete'),
      // content: '是否确认删除？',
      okText: $t('sys.okText'),
      onOk: () => {
        deleteTreeNode(checkedTreeNodes.value);
      },
    });
  };

  const onCheckTree = async (keys, e) => {
    const { checkedNodes } = e;
    checkedTreeNodes.value = checkedNodes;
    // deleteTreeNode(checkedNodes);
  };

  const onSelectTree = async (keys) => {
    if (keys[0] && keys[0] !== selectedTreeId.value[0]) {
      loadingMiddle.value = true;
      const id = keys[0];
      if (!id) formInstData.value = [];
      else {
        const treeNode = findTreeNode(id);
        // try {
        // } catch (error) {
        // if (!treeNode.instData) {
        //   treeNode.instData = (await getFormInstDataById(id)) || [];
        // }
        // formInstData.value = treeNode.instData;
        try {
          setSelectedTreeNode(treeNode);
          loadingMiddle.value = false;
        } catch (error) {
          loadingMiddle.value = false;
        }
      }
    }
  };
</script>
<style lang="less" scoped></style>
