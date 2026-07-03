<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="popupProps"
    title="请选择"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="flex flex-col h-full w-full tree-select-popup">
      <van-search
        class="search"
        v-model="searchValue"
        :class="{ 'border-all': searchValue }"
        shape="round"
        :left-icon="searchValue ? '' : 'search'"
        @update:model-value="onSearch"
        placeholder="请输入"
      />
      <OnlyTree
        :nodes="controller.state.nodes"
        :selectedIds="selectedIds"
        @nodeCheckChange="onNodeCheckChange"
        :multiple="multiple"
        class="overflow-y-auto flex-grow-1"
      >
        <template v-for="(slot, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps"></slot>
        </template>
        <template v-if="!controller.state.isLoadEnd" #bottom>
          <van-loading v-if="controller.state.isLoading" type="spinner" />
          <LoadMore v-else @more="onMore" />
        </template>
      </OnlyTree>
    </div>
    <template #footer>
      <SelectedTags v-if="multiple" :nodes="localSelectedNodes" @remove="onRemove" />
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="tree-select-popup">
  import { ref, onMounted, computed } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import OnlyTree from './only-tree/only-tree';
  import { TreeSelectController } from '../hooks/tree-select-controller';
  import { SelectTreeNode } from '../types/tree-select-popup';
  import SelectedTags from './selected-tags.vue';
  import LoadMore from './load-more.vue';
  import { debounce } from 'lodash-es';

  const show = ref(true);
  const searchValue = ref('');

  const props = withDefaults(
    defineProps<{
      controller: TreeSelectController;
      selectedNodes: SelectTreeNode[];
      multiple?: boolean;
      popupProps?: any; // 组件属性
      onOk: (newSelected?: SelectTreeNode[]) => void;
    }>(),
    {},
  );

  onMounted(() => {
    props.controller.init();
  });

  const onSearch = debounce((val: any) => {
    searchValue.value = val.trim();
    props.controller.setQuery(searchValue.value);
    // 把tree的滚动条重置回顶部
  }, 500);

  /** 选中的树节点的id集合 */
  const localSelectedNodes = ref<SelectTreeNode[]>([...props.selectedNodes]);
  const selectedIds = computed(() => {
    return localSelectedNodes.value.map((i) => i.id);
  });

  const onNodeCheckChange = (check: boolean, node: SelectTreeNode) => {
    if (props.multiple) {
      if (check) {
        localSelectedNodes.value.push(node);
      } else {
        localSelectedNodes.value = localSelectedNodes.value.filter((i) => i.id !== node.id);
      }
    } else {
      localSelectedNodes.value = check ? [node] : [];
    }
  };

  /** 执行关闭操作 */
  const doClose = () => {
    show.value = false;
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    props.onOk([...localSelectedNodes.value]);
    doClose();
  };

  const onRemove = (node: SelectTreeNode) => {
    localSelectedNodes.value = localSelectedNodes.value.filter((i) => i.id !== node.id);
  };

  const onMore = () => {
    console.log('onMore');
    props.controller.loadMore();
  };
</script>

<style lang="less" scoped>
  .tree-select-popup {
  }
</style>
