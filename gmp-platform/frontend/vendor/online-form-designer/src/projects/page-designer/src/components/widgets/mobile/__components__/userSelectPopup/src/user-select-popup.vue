<template>
  <div class="user-select-popup">
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      closeable
      :style="{ height: '100%', overflow: 'hidden' }"
    >
      <div class="pt50px flex flex-col h-full">
        <div class="text-16px font-bold p12px absolute text-center title">
          <van-icon class="back-icon" name="arrow-left" @click="backPreview" />
          {{ props.title || t('sys.appDesigner.approval.approvalUserSelect') }}
        </div>
        <van-search
          v-model="searchValue"
          :class="['border-b', { 'border-all': searchValue }]"
          @update:model-value="onSearch"
          @clear="onSearch"
          placeholder="请搜索"
        />
        <div class="overflow-hidden flex-1 mx-14px">
          <van-tabs v-if="!isSearch" v-model:active="activeKey" class="flex h100% user-tab">
            <van-tab v-if="props.showTabs.includes('User')" :title="t('sys.user')" name="User">
              <div class="overflow-y-auto h100%">
                <user
                  :userSource="userData"
                  :multiple="props.multiple"
                  v-model:selectUser="selectUser"
                />
              </div>
            </van-tab>
            <van-tab
              v-if="props.showTabs.includes('Org')"
              :title="t('sys.pageDesigner.dept')"
              name="Org"
            >
              <org
                ref="orgRef"
                :treeData="orgTreeData"
                :multiple="props.multiple"
                v-model:selectUser="selectUser"
              />
            </van-tab>
            <van-tab
              v-if="props.showTabs.includes('UserGroup')"
              :title="t('sys.appDesigner.userGroup')"
              name="UserGroup"
            >
              <user-group
                ref="userGroupRef"
                :treeData="userGroupTreeData"
                :multiple="props.multiple"
                v-model:selectUser="selectUser"
              />
            </van-tab>
          </van-tabs>
          <user
            v-else
            :userSource="userData"
            :multiple="props.multiple"
            v-model:selectUser="selectUser"
          />
        </div>
        <div
          v-if="props.multiple"
          class="overflow-y-auto mt-12px"
          :class="selectUser.length ? 'shadow-top' : ''"
        >
          <div class="mb-12px w-full flex-1 overflow-y-auto">
            <div
              class="mb-12px w-full flex-1 overflow-y-auto px-14px py-10px"
              :class="{ 'toggle-box': isExpand }"
              v-if="selectUser.length"
            >
              <span class="pr-8px text-sm mr-8px border-r">
                已选
                <span style="color: var(--van-primary-color)" v-if="props.multiple">
                  {{ selectUser.length }}
                  <van-icon @click="toggle" :name="isExpand ? 'arrow-up' : 'arrow-down'" />
                </span>
              </span>
              <van-tag
                v-for="(item, index) in selectUser"
                :key="item?.fullname + '_' + index"
                class="mx-2px px-2px tag-wrap"
                size="medium"
                color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
                text-color="var(--van-primary-color)"
                closeable
                @close="close(item)"
                >{{ item?.fullname }}</van-tag
              >
            </div>
          </div>
          <div class="px-12px py-8px button-area">
            <van-button class="w-35% px-4px mr-16px" @click="closeModal">取消</van-button>
            <van-button class="w-60% px-4px" type="primary" @click="setMulVal">确定</van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup name="userSelectPopup" lang="ts">
  import { computed, onBeforeMount, provide, ref } from 'vue';
  import User from './user.vue';
  import Org from './org.vue';
  import UserGroup from './user-group.vue';
  import {
    getDesignerCommonGetVisibleOrg,
    getDesignerCommonGetVisibleUserAndVisibleOrgUser,
  } from '/@/apis/gct-apaas/DesignerCommonController';
  import { PickerOrgDTO } from '/@/apis/gct-apaas/model';
  import { getSelectedUser } from '..';
  import { i18n } from '@mobile/locales/setupI18n';
  import { list2Tree } from '/@/components/SelectUserModal/utils';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';

  const props = defineProps<{
    title: string;
    showTabs: Array<'User' | 'Org' | 'UserGroup'>;
    selectValues: Array<string>;
    multiple: boolean;
    selectOptions: Array<any>;
  }>();

  const { t } = i18n.global;

  const orgRef = ref();

  const userGroupRef = ref();

  const showPopup = ref<boolean>(false);

  const selectUser = ref<Array<any>>([]);

  const activeKey = ref(props.showTabs[0]);

  /** 是否展示搜索 */
  const isSearch = ref(false);

  /** 搜索参数 */
  const searchValue = ref('');

  const isExpand = ref<Boolean>(false);

  /** 部门信息 */
  const orgData = ref<PickerOrgDTO[]>([]);

  /** 人员信息 */
  const userData = ref();

  /** 所有部门id */
  const getOrgList = ref<Array<string>>([]);

  /** 用户组树信息 */
  const userGroupData = ref<any[]>([]);

  /** 是否是初次变化 */
  const isOrign = ref(true);

  const handleOk = ref<Function>(() => {});

  const selectIds = ref();

  const open = async ({ ids, callback }: any) => {
    selectIds.value = ids;
    showPopup.value = true;
    handleOk.value = callback;
  };

  /** 获取所有的部门 */
  async function getOrgData() {
    const data = (await getDesignerCommonGetVisibleOrg()) ?? [];
    orgData.value = data;
    getOrgList.value = data.map((e) => {
      return e.id;
    });
  }

  /** 获取所有的用户组 */
  async function getUserGroupData() {
    userGroupData.value = ((await getUserGroupList()) ?? []).map((e) => {
      return { ...e };
    });
  }

  // 部门转成树结构
  const orgTreeData = computed(() => {
    return list2Tree(orgData.value);
  });

  /** 用户组转成树结构 */
  const userGroupTreeData = computed(() => {
    return list2Tree(userGroupData.value);
  });

  const onSearch = async () => {
    if (searchValue.value) {
      isSearch.value = true;
    } else {
      isSearch.value = false;
    }
    const res = await getDesignerCommonGetVisibleUserAndVisibleOrgUser({
      orgIds: getOrgList.value.join(','),
      userName: searchValue.value,
      pageNo: 1,
      pageSize: 999999999,
    });
    userData.value = res || [];
  };

  const toggle = () => {
    isExpand.value = !isExpand.value;
  };

  const getSelectedOption = async () => {
    if (selectIds.value && selectIds.value.length) {
      selectUser.value = await getSelectedUser(selectIds.value);
      isOrign.value = false;
    } else {
      isOrign.value = false;
    }
  };

  const backPreview = () => {
    if (isSearch.value) {
      showPopup.value = false;
      return;
    }
    if (activeKey.value === 'UserGroup' && userGroupRef.value.breadList.length > 1) {
      userGroupRef.value.backPreview();
    } else if (activeKey.value === 'Org' && orgRef.value.breadList.length > 1) {
      orgRef.value.backPreview();
    } else {
      showPopup.value = false;
    }
  };

  const close = (item) => {
    selectUser.value = selectUser.value.filter((i) => i.id !== item.id);
  };

  onBeforeMount(async () => {
    await getUserGroupData();
    await getOrgData();
    await onSearch();
    await getSelectedOption();
  });

  function setMulVal() {
    handleOk.value({
      a: props.multiple
        ? selectUser.value.length
          ? selectUser.value.map((i) => i.id)
          : []
        : selectUser.value.length
        ? selectUser.value[0].id
        : '',
      checkOptions: selectUser.value || [],
    });
    showPopup.value = false;
  }

  provide('ok', setMulVal);

  const closeModal = () => {
    showPopup.value = false;
  };

  defineExpose({ open });
</script>

<style lang="less">
  .user-select-popup > .van-popup > .van-popup__close-icon {
    position: absolute;
    right: 12px;
    color: #c3c3c3;
    font-size: 16px;
  }
</style>
<style scoped lang="less">
  .title {
    z-index: 1;
    top: 0;
    width: 100%;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
    .back-icon {
      position: absolute;
      left: 16px;
      top: 18px;
      color: #212528;
    }
  }
  .toggle-box {
    height: 115px;
    overflow: hidden;
  }
  .shadow-top {
    box-shadow: 0 -1px 4px 0 rgb(0 0 0 / 12%);
  }
  :deep(.van-cell-group--inset) {
    margin: 0;
  }
  .button-area {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e0e3ea;
  }
  .user-tab {
    flex-direction: column;
  }
  :deep(.van-tabs__wrap) {
    overflow: visible;
  }
  :deep(.van-tabs__content) {
    height: calc(100% - 38px);
    // overflow-y: scroll;
  }

  :deep(.van-tab__panel) {
    height: 100%;
  }
</style>
