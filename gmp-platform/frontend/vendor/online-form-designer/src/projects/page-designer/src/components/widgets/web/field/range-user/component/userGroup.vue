<template>
  <a-row :gutter="[16, 0]">
    <a-col :span="12">
      <div class="select-wrap h100%">
        <div class="select-header">
          <div class="header-title">
            <a-checkbox
              v-model:checked="checkAll"
              :indeterminate="indeterminate"
              @change="onCheckAllChange"
            >
              {{ t('sys.pageDesigner.ToBeSelect') }}
            </a-checkbox>
          </div>
          <div>
            <span class="text-[#212528]">{{ value.length }}</span>
            /
            <span class="text-[#797A7D]">{{ userGroupData.length }}</span>
          </div>
        </div>
        <div class="select-main p12px">
          <div class="mb8px">
            <a-input v-model:value="searchValue" :placeholder="t('sys.searchText')" />
          </div>
          <a-tree
            v-model:checkedKeys="checkedKeys"
            checkable
            checkStrictly
            :expanded-keys="expandedKeys"
            :tree-data="treeData"
            :fieldNames="{
              title: 'name',
              key: 'formatId',
            }"
            @check="onTreeCheck"
            @expand="onExpand"
          />
        </div>
      </div>
    </a-col>
    <a-col :span="12">
      <div class="select-wrap h100%">
        <div class="select-header">
          <div class="header-title">
            {{ t('sys.selected') }}：
            <span class="text-[#797A7D] ml4px">{{ selectedOptions.length }}</span>
          </div>
          <div class="cursor-pointer primary-gct" @click="checkedKeys = []">
            {{ t('sys.pageDesigner.deleteAll') }}
          </div>
        </div>
        <div class="select-main pt8px pb16px">
          <div
            v-for="(el, i) in selectedOptions"
            :key="i"
            class="selected-item ks-row p2px pl16px pr16px mt8px"
          >
            <div class="gct-text-overflow ks-col">{{ el.name }}</div>
            <i
              class="iconfont icon-shanchu2 cursor-pointer error-gct-hover text-[#333333]"
              @click="checkedKeys = checkedKeys.filter((e) => e !== el.formatId)"
            ></i>
          </div>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script setup lang="ts" name="userGroup">
  import { ref, onMounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { cloneDeep } from 'lodash-es';

  const { t } = useI18n();
  const emit = defineEmits(['update:value']);

  const props = defineProps<{
    value: Array<any>;
  }>();

  const indeterminate = ref(false),
    checkAll = ref(false);
  const searchValue = ref();
  const userGroupData = ref<any[]>([]);
  const expandedKeys = ref<any[]>([]);

  onMounted(() => {
    getUserGroupData();
  });

  const checkedKeys = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  // tree数据的平铺结构
  const treeDataList = computed(() => {
    const list = searchValue.value?.trim()
      ? userGroupData.value.filter((e) => e.name.indexOf(searchValue.value.trim()) > -1)
      : cloneDeep(userGroupData.value);
    return list;
  });

  // tree绑定的数据
  const treeData = computed(() => {
    return list2Tree(treeDataList.value);
  });

  const selectedOptions = computed(() => {
    return userGroupData.value.filter((e) => props.value.includes(e.formatId));
  });

  // 全选
  const onCheckAllChange = (e) => {
    indeterminate.value = false;
    const list = cloneDeep(props.value);
    const ids = treeDataList.value.map((e: any) => e.formatId);
    const data = e.target.checked
      ? [...new Set([...list, ...ids])]
      : list.filter((e) => !ids.includes(e));
    emit('update:value', data);
  };

  const onTreeCheck = (checkedKeys) => {
    emit('update:value', checkedKeys.checked);
  };

  // tree 展开折叠
  const onExpand = (keys) => {
    expandedKeys.value = keys;
  };

  // 查询所有的用户组
  const getUserGroupData = async () => {
    userGroupData.value = ((await getUserGroupList()) ?? []).map((e) => {
      return { ...e, formatId: `USER_GROUP:${e.id}` };
    });
    expandedKeys.value = userGroupData.value.map((e) => e.formatId);
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
  .select-wrap {
    border-left: 1px solid #e8ebf0;
    border-right: 1px solid #e8ebf0;
    border-bottom: 1px solid #e8ebf0;
  }
  .select-header {
    padding: 10px 16px;
    border-top: 1px solid #e8ebf0;
    border-bottom: 1px solid #e8ebf0;
    background-color: #f2f4f7;
    display: flex;
    .header-title {
      flex: 1;
    }
  }
  .select-main {
    height: 400px;
    overflow: auto;
  }
</style>
