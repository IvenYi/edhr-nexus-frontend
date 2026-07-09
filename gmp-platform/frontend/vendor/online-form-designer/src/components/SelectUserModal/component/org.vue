<template>
  <div class="select-user-modal__waiting-area">
    <SearchInput v-model:search-value="orgSearchValue" />
    <div class="waiting-area-content">
      <Scrollbar class="px-12px py-8px">
        <a-tree
          v-if="filterTreeData.length"
          class="waiting-area-custom-tree"
          :tree-data="filterTreeData"
          v-model:checkedKeys="selectOrgIds"
          auto-expand-parent
          default-expand-all
          block-node
          :checkable="!readonly"
          checkStrictly
          :fieldNames="{
            title: 'name',
            key: 'formatId',
          }"
          @check="onOrgCheck"
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

<script setup lang="ts" name="waiting-area-org">
  import { ref, watch, computed } from 'vue';
  import { pick } from 'lodash-es';
  import { Scrollbar } from '/@/components/Scrollbar';
  import SearchInput from './search-input.vue';
  import { filterTree } from '../utils/index';

  const props = defineProps<{
    treeData: any;
    selectOrgs?: any[];
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:selectOrgs']);

  const orgSearchValue = ref();

  const filterTreeData = computed(() => {
    if (!orgSearchValue.value) {
      return props.treeData;
    }
    return filterTree(props.treeData, orgSearchValue.value);
  });

  const selectOrgIds = computed<any>({
    get() {
      return props.selectOrgs?.map((item) => item.formatId);
    },
    set(value: string) {},
  });

  function onOrgCheck(v, event) {
    const {
      checked,
      node: { dataRef },
    } = event;

    let selectList = props.selectOrgs ?? [];
    if (checked) {
      selectList?.push(pick(dataRef, ['formatId', 'id', 'name']));
    } else {
      selectList = selectList.filter((f) => f.formatId !== dataRef.formatId);
    }

    emit('update:selectOrgs', selectList);
  }
</script>

<style lang="less">
  @import url('../styles/common.less');
</style>

<style scoped lang="less"></style>
