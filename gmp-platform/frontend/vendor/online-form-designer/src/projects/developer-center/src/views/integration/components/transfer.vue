<template>
  <div class="transfer-wrap">
    <a-row :gutter="[16, 0]">
      <a-col :span="12">
        <div class="select-wrap h100%">
          <div class="select-header">
            <div class="header-title">
              <!-- <a-checkbox
                v-model:checked="checkAll"
                :indeterminate="indeterminate"
                @change="onCheckAllChange"
              >
                {{ t('sys.pageDesigner.ToBeSelect') }}
              </a-checkbox> -->
              {{ t('sys.pageDesigner.ToBeSelect') }}
            </div>
            <div>
              <span class="text-[#212528]">{{ value.length }}</span>
              /
              <span class="text-[#797A7D]">{{ tobeSelData.length }}</span>
            </div>
          </div>
          <div class="select-main">
            <!-- <div class="pl12px pr12px pt12px">
              <a-input v-model:value="searchValue" :placeholder="t('sys.searchText')" />
            </div> -->
            <template v-if="!isTree">
              <a-checkbox-group v-model:value="checkedList" style="width: 100%">
                <div v-for="(el, i) in tobeSelectOptions" :key="i" class="select-item">
                  <a-checkbox :value="el.id">
                    <div :title="el.name" class="gct-text-overflow ks-col">
                      {{ el.name }}
                    </div>
                  </a-checkbox>
                </div>
              </a-checkbox-group>
            </template>
            <template v-else>
              <a-tree
                v-model:checkedKeys="checkedList"
                v-model:expandedKeys="expandedKeys"
                checkable
                :tree-data="originData"
                :load-data="onLoadData"
                :fieldNames="{
                  title: 'name',
                  key: 'id',
                }"
                @check="onTreeCheck"
                @expand="onExpand"
              />
            </template>
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
            <div class="cursor-pointer primary-gct" @click="checkedList = []">
              {{ t('sys.pageDesigner.deleteAll') }}
            </div>
          </div>
          <div class="select-main pb16px">
            <div v-for="(el, i) in selectedOptions" :key="i" class="selected-item ks-row">
              <div class="gct-text-overflow ks-col">{{ el.name }}</div>
              <i
                class="iconfont icon-shanchu2 cursor-pointer error-gct-hover text-[#333333]"
                @click="checkedList = checkedList.filter((e) => e !== el.id)"
              ></i>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script setup lang="ts" name="transfer">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import type { TreeProps } from 'ant-design-vue';
  import {
    getOpenapiKeyGrantOpenapiList,
    getOpenapiKeyGrantOpenapiTenantList,
  } from '/@/apis/gct-platform/OpenapiKeyGrantController';
  import { getOpenapiGroupList } from '/@/apis/gct-platform/OpenapiGroupController';

  const emit = defineEmits(['update:value']);
  const { t } = useI18n();

  const props = defineProps<{
    value: Array<any>;
    env: string;
    isTree: boolean;
    options: Array<any>;
  }>();

  const indeterminate = ref(false);
  const checkAll = ref(false);
  const searchValue = ref();
  const originData = ref<any[]>([]);
  const expandedKeys = ref<any[]>([]);
  const tobeSelData = ref<any[]>([]);

  const checkedList = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  const onLoadData: TreeProps['loadData'] = async (treeNode) => {
    if (treeNode.appId && treeNode.env) {
      const children = await getOpenapiKeyGrantOpenapiList({
        appTag: treeNode.appId,
        env: treeNode.env,
      });
      treeNode.dataRef!.children = children?.map((i) => {
        let list = i.openapiAggregates || [];
        list = list.map((i) => ({
          ...i,
          appId: treeNode.appId,
          appName: treeNode.name,
          checkable: true,
          isLeaf: true,
        }));
        const keys = tobeSelData.value.map((i) => i.id);
        const arr = list.filter((i) => !keys.includes(i.id));
        tobeSelData.value = [...tobeSelData.value, ...arr];
        return {
          ...i,
          id: i.modelKey,
          name: i.modelName,
          children: list,
        };
      });
      originData.value = [...originData.value];
    }
  };

  const getGroupList = async () => {
    if (props.isTree) {
      const res = (await getOpenapiGroupList()) || [];
      originData.value = res
        .filter((i) => i.env == props.env)
        .map((v) => ({ ...v, checkable: false, disabled: true }));
    } else {
      const res = (await getOpenapiKeyGrantOpenapiTenantList()) || [];
      const list = res.map((i) => ({ ...i, id: i.key }));
      tobeSelData.value = list;
      originData.value = list;
    }
  };

  // 动态切换全选的选中状态
  watch(
    () => props.options,
    (val) => {
      const options = JSON.parse(JSON.stringify(val));
      tobeSelData.value = [...options];
    },
    {
      immediate: true,
    },
  );

  // 根据搜索内容过滤待选区数据
  const tobeSelectOptions = computed(() => {
    const list = searchValue.value?.trim()
      ? originData.value.filter((e) => e.name.indexOf(searchValue.value.trim()) > -1)
      : cloneDeep(originData.value);
    return list;
  });

  const selectedOptions = computed(() => {
    return tobeSelData.value.filter((e) => props.value.includes(e.id));
  });

  onMounted(() => {
    getGroupList();
    const options = JSON.parse(JSON.stringify(props.options));
    tobeSelData.value = [...options];
  });

  // 全选
  const onCheckAllChange = (e) => {
    indeterminate.value = false;
    const list = cloneDeep(props.value);
    const ids = tobeSelData.value.map((e: any) => e.id);
    const data = e.target.checked
      ? [...new Set([...list, ...ids])]
      : list.filter((e) => !ids.includes(e));
    emit('update:value', data);
  };

  const onTreeCheck = (keys) => {
    const checkedKeys = tobeSelData.value.filter((i) => keys.includes(i.id)).map((v) => v.id);
    emit('update:value', checkedKeys);
  };

  // tree 展开折叠
  const onExpand = (keys) => {
    expandedKeys.value = keys;
  };

  defineExpose({
    getCheckedOpts() {
      const list = tobeSelData.value.filter((i) => props.value.includes(i.id));
      return props.isTree ? list : list.map((i) => ({ key: i.key, name: i.name }));
    },
  });
</script>
<style lang="less" scoped>
  .transfer-wrap {
    padding: 12px;
  }
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
  .select-item {
    padding: 10px 16px;
    display: flex;
    & + .select-item {
      border-top: 1px solid #e0e3ea;
    }

    :deep(.ant-checkbox-wrapper) {
      width: 100%;
      overflow: hidden;

      & > span:last-child {
        flex: 1;
        overflow: hidden;
      }
    }
  }
  .selected-item {
    padding: 10px 16px;
    line-height: 22px;
    & + .selected-item {
      border-top: 1px solid #e0e3ea;
    }
  }
  :deep(.ant-tree .ant-tree-treenode-disabled .ant-tree-node-content-wrapper) {
    color: rgba(0, 0, 0, 0.85);
    cursor: pointer;
  }
</style>
