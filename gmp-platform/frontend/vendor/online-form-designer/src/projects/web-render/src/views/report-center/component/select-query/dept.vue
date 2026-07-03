<template>
  <div class="select-main p12px">
    <div class="mb8px">
      <a-input v-model:value="searchValue" :placeholder="t('sys.searchText')" />
    </div>
    <div class="dept-tree">
      <a-tree
        v-model:selectedKeys="selectedKeys"
        checkStrictly
        :expanded-keys="expandedKeys"
        :tree-data="treeData"
        :fieldNames="{
          title: 'name',
          key: 'formatId',
        }"
        @select="onTreeSelect"
        @expand="onExpand"
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
    </div>
  </div>
</template>

<script setup lang="ts" name="dept">
  import { ref, onMounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { getDesignerCommonGetVisibleOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { filterTree } from '/@/components/SelectUserModal/utils';

  const props = defineProps<{
    value: string;
  }>();

  const { t } = useI18n();
  const emit = defineEmits(['update:value', 'changeOptions']);
  const searchValue = ref();
  const expandedKeys = ref<any[]>([]);
  const userGroupData = ref<any[]>([]);

  onMounted(() => {
    getUserGroupData();
  });

  const selectedKeys = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  // tree 展开折叠
  const onExpand = (keys) => {
    expandedKeys.value = keys;
  };

  // 查询所有的用户组
  const getUserGroupData = async () => {
    userGroupData.value = ((await getDesignerCommonGetVisibleOrg()) ?? []).map((e) => {
      return { ...e, formatId: `ORG:${e.id}` };
    });
    expandedKeys.value = userGroupData.value.map((e) => e.formatId);
  };

  // tree绑定的数据
  const treeData = computed(() => {
    if (!searchValue.value?.trim()) {
      return list2Tree(treeDataList.value);
    }
    return filterTree(list2Tree(treeDataList.value), searchValue.value);
  });

  // tree数据的平铺结构
  const treeDataList = computed(() => {
    const list = cloneDeep(userGroupData.value);
    return list;
  });

  const onTreeSelect = (selectedKeys, e) => {
    emit('changeOptions', e.node);

    emit('update:value', selectedKeys[0]);
  };

  function list2Tree(list) {
    let treeOptions = [];
    const arrClone: any = cloneDeep(list);
    const mapInfo = arrClone.reduce((obj: any, item: any) => {
      item.children = [];
      obj[item.id] = item;
      return obj;
    }, {});
    // 转树
    arrClone.forEach((i: any) => {
      const parent = mapInfo[i.parentId];
      // 如果父节点存在，push到父级的children数组中
      // 如果父级不存在，直接push到treeData数组
      parent ? parent.children.push(i) : treeOptions.push(i);
    });
    return treeOptions;
  }
</script>
<style lang="less" scoped>
  .dept-tree {
    max-height: 300px;
    overflow-y: scroll;
  }
</style>
<style lang="less">
  .is-highlight {
    color: var(--ant-primary-color);
  }
  .ant-tree .ant-tree-treenode {
    width: 100%;
    &:hover {
      background-color: #f5f5f5;
    }
  }
</style>
