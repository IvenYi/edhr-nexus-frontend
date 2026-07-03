<template>
  <SelectLayout
    class="export-category"
    :title="$t('sys.onlineForm.mySelectedCategories')"
    :is-empty="!selectedData.length"
  >
    <template #left>
      <div class="export-category__search">
        <a-input
          v-model:value="searchKey"
          :placeholder="$t('sys.onlineForm.pleaseEnterCategoryNameToSearch')"
        >
          <template #prefix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>
      <div :class="['export-category__tree']">
        <template v-if="filteredTreeData.length">
          <a-checkbox v-if="!searchKey" :checked="isSelectedAll" @update:checked="onSelectAll">
            {{ $t('sys.selectAll') }}
          </a-checkbox>
          <TreeEx
            ref="treeExRef"
            checkable
            multiple
            :selected-keys="tree_selectedKeys"
            v-model:checked-keys="checkedKeys"
            :data="filteredTreeData"
            :showLine="true"
            :defaultExpandAll="true"
          >
            <template #title="{ node }">
              <HightLight :title="node.title" class="ell" :text="node.title" :keyword="searchKey" />
            </template>
          </TreeEx>
        </template>
        <a-empty
          v-else
          :description="$t('sys.component.fieldTransfer.noSearchData')"
          :image="EmptyImg"
        />
      </div>
    </template>
    <template #right>
      <div class="export-category__list">
        <div class="export-category__list-item" v-for="item in selectedData" :key="item.id">
          <span class="name ell" :title="item.name">{{ item.name }}</span>
          <i
            class="gct-iconfont icon-guanbi-danchuang export-category__remove-icon"
            @click="onRemove(item)"
          ></i>
        </div>
      </div>
    </template>
  </SelectLayout>
</template>

<script lang="ts" setup name="export-category">
  import { useCategory } from '../..';
  import { CategoryModuleEnum } from '../../constant';
  import SelectLayout from './select-layout.vue';
  import { ref, watch, computed, onMounted, watchEffect } from 'vue';
  import { ITreeNode, TreeEx } from '/@/components/TreeEx';
  import { filterTreeData, recursiveTransfer } from '/@/utils/recursive';
  import { cloneDeep, isEqual } from 'lodash-es';
  import EmptyImg from '@/assets/svg/pic_noresult.svg';
  import { HightLight } from '/@/components/ui';

  const props = withDefaults(
    defineProps<{
      hasSelected: boolean;
    }>(),
    {
      hasSelected: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:hasSelected', val: boolean): void;
  }>();

  const searchKey = ref('');
  const tree_selectedKeys = ref<string[]>([]);
  const checkedKeys = ref<string[]>([]);
  const selectedData = ref<Array<{ id: string; name: string }>>([]);
  const { load, categoryTreeData, getCategoryById } = useCategory({
    module: CategoryModuleEnum.ONLINE_FORM,
  });

  // 抛出是否选中数据
  watchEffect(() => {
    emit('update:hasSelected', !!selectedData.value.length);
  });

  /** 所有的节点标识集合 */
  const allKeySet = ref<string[]>([]);
  /** 子节点和父节点标识标识映射集合 */
  const child2ParentMap = new Map<string, string>();
  /** 是否全选 */
  const isSelectedAll = computed(() =>
    isEqual(checkedKeys.value.slice().sort(), allKeySet.value.slice().sort()),
  );

  const treeData = ref<ITreeNode[]>([]);

  watchEffect(() => {
    allKeySet.value = [];
    child2ParentMap.clear();
    treeData.value = recursiveTransfer(categoryTreeData.value || [], (item, resolveChild) => {
      allKeySet.value.push(item.id!);
      // 名称映射
      const node: ITreeNode = {
        key: item.id!,
        title: item.name!,
        sortNum: item.sortNum!,
      };
      if (item.child) {
        item.child.forEach((child) => {
          child2ParentMap.set(child.id!, item.id!);
        });
        node.children = resolveChild(item.child);
      }
      return node;
    });
  });

  /** 过滤完的树节点的数据 */
  const filteredTreeData = computed(() => {
    if (searchKey.value) {
      const cloneData = cloneDeep(treeData.value);
      const filterData = filterTreeData(cloneData, (item) => {
        console.log(
          'item.title.includes(searchKey.value!)',
          item.title,
          item.title.includes(searchKey.value!),
        );
        return item.title.includes(searchKey.value!);
      });
      return filterData;
    } else {
      return treeData.value;
    }
  });

  onMounted(async () => {
    await load();
  });

  /**
   * 计算实际需要的选中节点
   * 子全选中的时候只要父，没全选中不需要父
   * @param arr 选中的节点标识集合
   */
  function calcSelectedKeys(arr: string[]) {
    const newArr: string[] = [];
    arr.forEach((key) => {
      const parentKey = child2ParentMap.get(key);
      // 没有父,或者父没有被选中则返回自己
      if (!parentKey || !arr.includes(parentKey)) {
        newArr.push(key);
      }
    });
    console.log('calcSelectedKeys', newArr);
    return newArr;
  }

  watch(
    () => checkedKeys.value,
    (val) => {
      selectedData.value = calcSelectedKeys(val).map((key) => {
        const node = getCategoryById(key)!;
        return {
          id: node.id!,
          name: node.name!,
        };
      });
    },
  );

  /** 全选 */
  const onSelectAll = (isSelectAll: boolean) => {
    if (isSelectAll) {
      console.log('全选');
      checkedKeys.value = [...allKeySet.value];
    } else {
      checkedKeys.value = [];
    }
  };

  /** 删除选中的分类 */
  const onRemove = (item: { id: string; name: string }) => {
    const removeKeys: string[] = [];
    recursiveTransfer([getCategoryById(item.id)!], (item, resolveChild) => {
      removeKeys.push(item.id!);
      if (item.child) {
        resolveChild(item.child);
      }
    });
    // 删除的时候把这个节点和其子孙节点对应的标识都删除掉
    checkedKeys.value = checkedKeys.value.filter((key) => !removeKeys.includes(key));
  };

  /** 获取选中的标识集合 */
  function getSelectedIds() {
    return selectedData.value.map((item) => item.id);
  }

  defineExpose({
    getSelectedIds,
  });
</script>

<style lang="less" scoped>
  .export-category {
    &__search {
      padding: 16px;
    }

    &__tree {
      height: calc(100% - 68px);
      overflow: auto;
      padding: 0 16px;
      :deep(.ant-tree.gct-tree-ex) {
        .ant-tree-node-content-wrapper:hover {
          // background-color: transparent;
        }
      }
    }

    &__list {
      padding: 16px;
      &-item {
        display: flex;
        justify-content: space-between;
        font-weight: 400;
        font-size: 14px;
        color: #1a1d23;
        & ~ & {
          margin-top: 16px;
        }
      }
    }

    &__remove-icon {
      cursor: pointer;
      font-size: 16px;
      color: #a6a6a6;
    }

    :deep(.ant-empty .ant-empty-image) {
      height: 85px;
    }
  }
</style>
