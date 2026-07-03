<template>
  <div class="pl-40px pr-40px pt-12px pb-16px">
    <a-input
      v-model:value="searchParam"
      :placeholder="t('请搜索')"
      class="mt-12px mb-12px"
      @pressEnter="getUserDataByOrg"
    >
      <template #suffix>
        <SearchOutlined style="color: #212528; cursor: pointer" @click="getUserDataByOrg" />
      </template>
    </a-input>
    <div v-if="!isSearch">
      <a-tabs v-model:activeKey="activeKey" class="waiting-area-tabs">
        <a-tab-pane key="User" :tab="t('sys.user')" v-if="baseProps.showTabs.includes('User')">
          <user
            style="padding: 8px 12px"
            :userSource="userData"
            v-model:selectUser="selectUser"
            :multiple="baseProps.multiple"
          />
        </a-tab-pane>
        <a-tab-pane
          key="Org"
          :tab="t('sys.pageDesigner.dept')"
          v-if="baseProps.showTabs.includes('Org')"
        >
          <org
            v-model:selectUser="selectUser"
            :treeData="orgTreeData"
            :multiple="baseProps.multiple"
          />
        </a-tab-pane>
        <a-tab-pane
          key="UserGroup"
          :tab="t('sys.appDesigner.userGroup')"
          v-if="baseProps.showTabs.includes('UserGroup')"
        >
          <user-group
            v-model:selectUser="selectUser"
            :treeData="userGroupTreeData"
            :multiple="baseProps.multiple"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
    <div v-else class="search-area">
      <user
        style="padding: 8px 12px"
        :userSource="userData"
        v-model:selectUser="selectUser"
        :multiple="baseProps.multiple"
      />
    </div>
    <div class="select-user">
      <span v-if="!props.baseProps.multiple">
        {{ t('单选，已选择') }}：{{ selectUser.length ? selectUser[0].fullname : '' }}
      </span>
      <div v-else>
        <div class="mb-8px">
          {{ t('sys.org.selectUserTotal', { sth: selectUser.length }) }}
          <a-tag
            v-for="item in selectUser"
            :key="item.id"
            class="mb-8px"
            :bordered="false"
            closable
            @close="close(item)"
          >
            {{ item.fullname }}
          </a-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="user-select-modal">
  import { computed, onBeforeMount, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import User from './components/user.vue';
  import Org from './components/org.vue';
  import UserGroup from './components/user-group.vue';
  import { list2Tree } from '/@/components/SelectUserModal/utils';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import {
    getDesignerCommonGetVisibleOrg,
    getDesignerCommonGetVisibleUserAndVisibleOrgUser,
  } from '/@/apis/gct-apaas/DesignerCommonController';
  import { PickerOrgDTO } from '/@/apis/gct-apaas/model';
  import { getSelectedUser } from '.';

  const { t } = useI18n();

  const props = defineProps<{
    modal: any;
    baseProps: {
      selectValues: Array<string>;
      showTabs: Array<'User' | 'Org' | 'UserGroup'>;
      multiple: boolean;
      selectOptions: Array<any>;
    };
  }>();

  const activeKey = ref(props.baseProps.showTabs[0]);

  const selectUser = ref<Array<any>>([]);

  /** 用户组树信息 */
  const userGroupData = ref<any[]>([]);

  /** 部门树信息 */
  const orgData = ref<PickerOrgDTO[]>([]);

  /** 人员信息 */
  const userData = ref();

  /** 搜索参数 */
  const searchParam = ref();

  /** 是否展示搜索 */
  const isSearch = ref(false);

  /** 所有部门id */
  const getOrgList = ref<Array<string>>([]);

  // 部门转成树结构
  const orgTreeData = computed(() => {
    return list2Tree(orgData.value);
  });

  /** 用户组转成树结构 */
  const userGroupTreeData = computed(() => {
    return list2Tree(userGroupData.value);
  });

  const close = (item) => {
    selectUser.value = selectUser.value.filter((i) => i.id !== item.id);
  };

  /** 获取所有的用户组 */
  async function getUserGroupData() {
    userGroupData.value = ((await getUserGroupList()) ?? []).map((e) => {
      return { ...e };
    });
  }

  async function getUserDataByOrg() {
    if (searchParam.value) {
      isSearch.value = true;
    } else {
      isSearch.value = false;
    }
    const res = await getDesignerCommonGetVisibleUserAndVisibleOrgUser({
      orgIds: getOrgList.value.join(','),
      userName: searchParam.value,
      pageNo: 1,
      pageSize: 999999999,
    });
    userData.value = res || [];
  }

  /** 获取所有的部门 */
  async function getOrgData() {
    const data = (await getDesignerCommonGetVisibleOrg()) ?? [];
    orgData.value = data;
    getOrgList.value = data.map((e) => {
      return e.id;
    });
  }

  props.modal.ok = () => {
    return {
      ok: true,
      data: {
        selectOptions: selectUser.value || [],
        selectKeys: props.baseProps.multiple
          ? selectUser.value.length
            ? selectUser.value.map((i) => i.id)
            : []
          : selectUser.value.length
          ? selectUser.value[0].id
          : '',
      },
    };
  };

  const getSelectedOption = async () => {
    if (props.baseProps.selectValues && props.baseProps.selectValues.length) {
      selectUser.value = await getSelectedUser(props.baseProps.selectValues);
    }
  };

  onBeforeMount(async () => {
    await getUserGroupData();
    await getOrgData();
    await getUserDataByOrg();
    await getSelectedOption();
  });
</script>

<style lang="less" scoped>
  .select-user {
    height: 10vh;
    margin: 16px 0;
    overflow: scroll;
  }
  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin-bottom: 0;
    border: 1px solid #e8ebf0;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    padding: 0 16px;
  }
  :deep(.ant-tabs-content) {
    height: 43vh;
    overflow: scroll;
    border: 1px solid #e8ebf0;
    border-top: none;
    border-radius: 0 0 4px 4px;
  }
  .search-area {
    height: 43vh;
    overflow: scroll;
    border: 1px solid #e8ebf0;
    border-radius: 4px;
  }
</style>
