<template>
  <div class="org-select flex select-user-modal__waiting-area">
    <div class="flex">
      <div class="left-column pl-12px pr-12px">
        <a-input
          v-model:value="orgSearch"
          :placeholder="t('sys.appDesigner.userGroupPlaceholder')"
          class="mt-12px"
        >
          <template #suffix>
            <SearchOutlined style="color: #212528; cursor: pointer" />
          </template>
        </a-input>
      </div>
      <div class="flex items-center justify-between px-12px py-8px deep right-column">
        <a-checkbox
          v-if="props.multiple && orgUserData.length"
          v-model:checked="isCheckAll"
          @change="checkAllChange"
        >
          {{ t('sys.selectAll') }}
        </a-checkbox>
        <span v-else></span>
        <span class="flex items-center">
          {{ t('sys.appDesigner.displayAllGroupUser') }}
          <a-switch
            v-model:checked="displayDeep"
            style="margin-left: 8px"
            size="small"
            @change="changeDeep"
          />
        </span>
      </div>
    </div>
    <div class="flex h100%">
      <Scrollbar class="left-column pl-12px pr-12px org-data">
        <a-tree
          v-if="filterTreeData.length"
          class="waiting-area-custom-tree user-tree"
          :tree-data="filterTreeData"
          auto-expand-parent
          default-expand-all
          block-node
          :fieldNames="{
            title: 'name',
            key: 'id',
          }"
          :selectedKeys="selectedKeys"
          @select="onSelect"
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
      <Scrollbar class="px-4px py-8px right-column org-data">
        <user
          :userSource="orgUserData"
          v-model:selectUser="selctUserSource"
          :multiple="props.multiple"
        />
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { filterTree } from '/@/components/SelectUserModal/utils';
  import User from './user.vue';
  import { getDesignerCommonGetUserGroupUser } from '/@/apis/gct-apaas/DesignerCommonController';
  import { PickerUserDTO } from '/@/apis/gct-platform/model';

  const props = withDefaults(
    defineProps<{
      treeData: any;
      selectUser?: any[];
      multiple: boolean;
    }>(),
    {},
  );

  const emit = defineEmits(['update:selectUser']);

  const orgSearch = ref();

  const { t } = useI18n();

  const selctUserSource = ref([]);

  const orgUserList = ref<Array<string>>([]);

  /** 全选 */
  const isCheckAll = ref<boolean>(false);

  const currentNode = ref();

  watch(
    () => selctUserSource.value,
    (value) => {
      judgeCkeckAll(value);
      emit('update:selectUser', value);
    },
    { deep: true },
  );

  watch(
    () => props.selectUser,
    (value) => {
      selctUserSource.value = value;
    },
    { immediate: true },
  );

  const displayDeep = ref<boolean>(false);

  const changeDeep = () => {
    getUserDataByOrg(currentNode.value);
  };

  /** 全选方法 */
  const checkAllChange = () => {
    let selectList = selctUserSource.value ?? [];
    if (isCheckAll.value) {
      const arr = selctUserSource.value.concat(orgUserData.value);
      selectList = arr.reduce((accumulator, current) => {
        const duplicate = accumulator.find((item: any) => item.id === current.id);
        if (!duplicate) {
          return accumulator.concat([current]);
        }
        return accumulator;
      }, []);
    } else {
      const orgUserList = orgUserData.value.map((p) => p.id);
      selectList = selctUserSource.value.filter((i) => {
        return !orgUserList.includes(i.id);
      });
    }

    emit('update:selectUser', selectList);
  };

  const judgeCkeckAll = (value) => {
    if (props.multiple && orgUserData.value.length) {
      const slectList = value.map((p) => p.id);
      const newSet = slectList.filter((item) => orgUserList.value.includes(item));

      if (newSet.length === orgUserList.value.length) {
        isCheckAll.value = true;
      } else {
        isCheckAll.value = false;
      }
    }
  };

  const filterTreeData = computed(() => {
    if (!orgSearch.value) {
      return props.treeData;
    }
    return filterTree(props.treeData, orgSearch.value);
  });

  const selectedKeys = ref<string[]>([]);

  const orgUserData = ref<PickerUserDTO[]>([]);

  function onSelect(_, e: { node }) {
    const { dataRef } = e.node || {};
    if (selectedKeys.value.includes(dataRef.id)) {
      return;
    }
    selectedKeys.value = [dataRef.id];
    currentNode.value = e.node.id;
    getUserDataByOrg(e.node.id);
  }

  /** 查询用户组下的人员 */
  async function getUserDataByOrg(orgIds) {
    const res = await getDesignerCommonGetUserGroupUser({
      userGroupIds: orgIds,
      pageNo: 1,
      pageSize: 999999999,
      allUserOption: displayDeep.value === false ? 0 : 1,
    });
    orgUserData.value = res;
    orgUserList.value = orgUserData.value.map((p) => p.id) || [];
    judgeCkeckAll(selctUserSource.value);
  }
</script>

<style lang="less">
  @import url('./common.less');
</style>

<style lang="less" scoped>
  .org-select {
    height: 100%;

    .left-column {
      width: 50%;
      border-right: 1px solid #e8ebf0;

      :deep(.waiting-area-custom-tree.user-tree) {
        .ant-tree-treenode-selected {
          background: #e6eefe !important;
        }
      }
    }

    .org-data {
      min-height: calc(100% - 44px);
    }

    .right-column {
      width: 50%;
    }
    .deep {
      color: #666;
      padding: 12px;
    }
  }
</style>
