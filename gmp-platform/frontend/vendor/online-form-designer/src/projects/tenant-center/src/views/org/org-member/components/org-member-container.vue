<template>
  <div>
    <!-- <a-breadcrumb style="margin-bottom: 20px; min-height: 22px">
      <a-breadcrumb-item v-for="item in getTreeNamePathArr(selectTreeNode.node.id)" :key="item">{{
        item
      }}</a-breadcrumb-item>
    </a-breadcrumb>-->
    <query-select
      ref="queryRef"
      :class="[inEDHRApp ? 'bg-[#F7F8FA] !mb-16px  !pt-16px !px-16px ' : null]"
      :hideKeys="['email']"
      @on-notify="handleNotify"
    />
    <user-table
      ref="tableRef"
      primaryKey="fullname"
      :platformType="PlatformEnum.TENANT_MANAGE_ORG_USER"
      :columns="columns"
      :dataSource="tableData"
      :filterButton="filterButton"
      v-model:displayDeep="displayDeep"
      :matchRowTips="{
        [ButtonTypeEnum.Detach]: 'fullname',
      }"
      :apiConfig="{
        deleteRecord: {
          api: postTenantManagementOrgUserRemove,
          otherRequestParams: { orgId: selectTreeNode.node.id },
        },
        importInfo: {
          api: postUserOrgTenantImport,
          otherRequestParams: { orgId: selectTreeNode.node.id },
        },
        exportInfo: {
          api: postUserOrgTenantTmpl,
          otherRequestParams: { ...getRequestParams() },
        },
      }"
      @on-notify="handleNotify"
      @on-primaryKey-click="handlePrimaryKeyClick"
    />
    <org-user-modal @register="userRegister" @ok="handleModalOk" />
    <user-move-modal @register="userUserMoveRegister" @ok="handleUserMoveModalOk" />
  </div>
</template>
<script setup lang="ts" name="org-member-container">
  import { ref, onBeforeMount, toRaw, unref, watch, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { QuerySelect, UserTable } from '/@/components/UserCmp';
  import OrgUserModal from '/@/components/UserCmp/components/modal/org-user-modal.vue';
  import UserMoveModal from '/@/components/UserCmp/components/modal/user-move-modal.vue';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    ButtonTypeEnum,
    UserEnabledEnum,
    PlatformEnum,
  } from '/@/components/UserCmp/constant/interface';
  import { useEmitter } from '/@/components/UserCmp/hooks/useEmitter';
  import {
    getTableButton,
    handleButtonListDataBack,
    getUserIdList,
  } from '/@/components/UserCmp/constant/config';
  import { useModal } from '/@/components/Modal';
  import { columns } from '../constant/interface';
  import { has } from 'lodash-es';

  import {
    getTenantManagementOrgUserPageList,
    getTenantManagementOrgUserInfo,
    postTenantManagementOrgUserRemove,
    postTenantManagementOrgUserCreateAndAdd,
    postTenantManagementOrgUserAdd,
    postTenantManagementOrgUserUpdate,
    postTenantManagementOrgUserMove,
  } from '/@/apis/gct-platform/TenantManagementOrgController';

  import {
    postUserOrgTenantImport,
    postUserOrgTenantTmpl,
  } from '/@/apis/gct-platform/UserController';

  import type { IButtonProps } from '/@/components/UserCmp/types/index.d';
  import type { OrgUserResponse } from '/@/apis/gct-platform/model/index';
  import { useUserStore } from '/@/store/modules/user';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const { t } = useI18n();

  const { emitter, EmitterEnum } = useEmitter();
  const userStore = useUserStore();

  /** 列表使用到的按钮key集合 */
  const BTN_KEYS = inEDHRApp.value
    ? [
        ButtonTypeEnum.Add,
        ButtonTypeEnum.Import,
        ButtonTypeEnum.Export,
        ButtonTypeEnum.Edit,
        ButtonTypeEnum.Move,
      ]
    : [
        ButtonTypeEnum.Add,
        ButtonTypeEnum.Import,
        ButtonTypeEnum.Export,
        ButtonTypeEnum.Edit,
        ButtonTypeEnum.Move,
        // ButtonTypeEnum.Detach,
      ];

  const { selectTreeNode, getTreeNamePathArr, setOrgsExistUser } = useTreeList();

  const queryRef = ref();
  const tableRef = ref();

  const displayDeep = ref(true);

  const filterButton = ref<IButtonProps[]>([]);
  const tableData = ref<Array<OrgUserResponse>>([]);

  const [userRegister, { openModal }] = useModal();
  const [userUserMoveRegister, { openModal: openUserMoveModal }] = useModal();

  onBeforeMount(() => {
    // 获取按钮组
    const buttons = getTableButton(BTN_KEYS);
    filterButton.value = handleButtonListDataBack(buttons);
  });

  watch(
    () => selectTreeNode.node,
    () => {
      getOrgUserTableData(1);
      tableRef.value.clearSelect();
    },
    { deep: true },
  );

  watch(
    () => displayDeep.value,
    () => {
      getOrgUserTableData(1);
    },
    { deep: true },
  );

  const getRequestParams = () => {
    const params = toRaw(queryRef.value?.formState) || {};
    return {
      fullname: params.fullname,
      mobile: params.mobile,
      username: params.username,
      enabled: params.enabled === UserEnabledEnum.ALL ? undefined : params.enabled,
      startTime: params.createTime?.[0]
        ? dayjs(params.createTime[0]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      endTime: params.createTime?.[1]
        ? dayjs(params.createTime[1]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      orgId: selectTreeNode.node.id,
    };
  };

  async function getOrgUserTableData() {
    const paginationInfo = unref(tableRef.value.pagination) || {};
    const result = await getTenantManagementOrgUserPageList({
      ...getRequestParams(),
      allUserOption: displayDeep.value === false ? 0 : 1,
      pageNo: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
    tableRef.value.changePagination({
      current: result?.pageNo,
      total: result?.totalCount,
    });
    tableData.value = (result?.data ?? []).map((i) => {
      return {
        ...i,
        id: i.userId,
      };
    });

    setOrgsExistUser(result?.data ?? []);
  }

  const handlePrimaryKeyClick = async (info) => {
    const data = await getTenantManagementOrgUserInfo({
      orgId: selectTreeNode.node.id,
      userId: info.userId,
    });
    openModal(true, {
      title: t('sys.component.userCmp.userDetailTitle'),
      type: 'detail',
      info: data,
    });
  };

  const handleNotify = async ({ key, ...otherParams }) => {
    if (key === ButtonTypeEnum.Add) {
      openModal(true, {
        title: t('sys.component.userCmp.addUser'),
        type: 'create',
        api: getTenantManagementOrgUserInfo,
      });
    } else if (key === ButtonTypeEnum.Edit) {
      const data = await getTenantManagementOrgUserInfo({
        orgId: selectTreeNode.node.id,
        userId: otherParams.recordInfo.userId,
      });
      openModal(true, {
        title: `${t('sys.edit')}${t('sys.user')}`,
        type: 'edit',
        info: data,
      });
    } else if (key === ButtonTypeEnum.Move) {
      openUserMoveModal(true, {
        userIds: getUserIdList(otherParams.recordInfo, 'userId'),
      });
    } else if (key === 'request-data') {
      if (has(otherParams, 'status') && otherParams.status === 'search-data') {
        tableRef.value.resetCurrent();
      }

      await getOrgUserTableData();
      if (has(otherParams, 'status') && otherParams.status === 'export-success') {
        emitter.emit(EmitterEnum.on_refresh_tree_list);
      }
    }
  };

  const handleModalOk = async ({
    info,
    type,
    isAddUser,
    callback,
  }: {
    info: OrgUserResponse;
    type: 'create' | 'edit' | 'detail';
    isAddUser: boolean;
    callback: () => void;
  }) => {
    if (type === 'create') {
      if (isAddUser) {
        await postTenantManagementOrgUserAdd(info);
      } else {
        await postTenantManagementOrgUserCreateAndAdd(info);
      }
      message.success(t('sys.component.userCmp.addUserSuccess'));
    } else if (type === 'edit') {
      await postTenantManagementOrgUserUpdate(info);
      if (info.userId === userStore.getUserInfo.userId) {
        userStore.setSomeUserInfo(info);
      }
      message.success(t('sys.component.userCmp.editUserSuccess'));
    }
    if (typeof callback === 'function') {
      callback();
    }
    await getOrgUserTableData();
  };

  const handleUserMoveModalOk = async (res) => {
    await postTenantManagementOrgUserMove(res);
    message.success(t('sys.component.userCmp.moveUserSuccess'));
    tableRef.value.clearSelect();
    await getOrgUserTableData();
  };
</script>
