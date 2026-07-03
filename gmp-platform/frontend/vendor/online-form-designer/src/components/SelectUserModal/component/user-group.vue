<template>
  <div class="select-user-modal__waiting-area">
    <SearchInput v-model:search-value="userGroupSearchValue" />
    <div class="waiting-area-content">
      <Scrollbar class="px-12px py-8px">
        <a-tree
          v-if="filterTreeData.length"
          class="waiting-area-custom-tree"
          :tree-data="filterTreeData"
          v-model:checkedKeys="selectUgIds"
          auto-expand-parent
          default-expand-all
          block-node
          :checkable="!readonly"
          checkStrictly
          :fieldNames="{
            title: 'name',
            key: 'formatId',
          }"
          @check="onUgCheck"
        >
          <template #title="{ data }">
            <div class="tree-node">
              <span
                v-if="data.highlightName"
                class="tree-node__title gct-text-overflow ks-col"
                :title="data.name"
                :innerHTML="data.highlightName"
              ></span>
              <span v-else :title="data.name" class="tree-node__title gct-text-overflow ks-col">
                {{ data.name }}
              </span>
            </div>
          </template>
        </a-tree>
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="waiting-area-user-group">
  import { ref, watch, computed } from 'vue';
  import { pick } from 'lodash-es';
  import { Scrollbar } from '/@/components/Scrollbar';
  import SearchInput from './search-input.vue';
  import { filterTree } from '../utils/index';

  const props = defineProps<{
    treeData: any;
    selectUg: any;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:selectUg']);

  const userGroupSearchValue = ref();

  const filterTreeData = computed(() => {
    if (!userGroupSearchValue.value) {
      return props.treeData;
    }
    return filterTree(props.treeData, userGroupSearchValue.value);
  });

  const selectUgIds = computed<any>({
    get() {
      return props.selectUg?.map((item) => item.formatId);
    },
    set(value: string) {},
  });

  function onUgCheck(v, event) {
    const {
      checked,
      node: { dataRef },
    } = event;

    let selectList = props.selectUg ?? [];
    if (checked) {
      selectList?.push(pick(dataRef, ['formatId', 'id', 'name']));
    } else {
      selectList = selectList.filter((f) => f.formatId !== dataRef.formatId);
    }

    emit('update:selectUg', selectList);
  }
</script>

<style lang="less">
  @import url('../styles/common.less');
</style>

<style scoped lang="less"></style>
