<template>
  <div class="user-container">
    <query-select
      ref="queryRef"
      :class="[inEDHRApp ? 'bg-[#F7F8FA] !mb-16px  !pt-16px !px-16px ' : null]"
      :hideKeys="['email']"
      @on-notify="handleNotify"
    />
    <user-table
      ref="tableRef"
      primaryKey="fullname"
      :platformType="PlatformEnum.TENANT_MANAGE_USER"
      :columns="columns"
      :dataSource="tableData"
      :filterButton="filterButton"
      :matchRowTips="{
        [ButtonTypeEnum.ResetPwd]: 'fullname',
        [ButtonTypeEnum.Delete]: 'fullname',
      }"
      :matchShows="{
        [ButtonTypeEnum.Enable]: 'enabled',
        [ButtonTypeEnum.Disable]: 'enabled',
      }"
      :apiConfig="{
        resetPasswordToRecord: {
          api: postTenantManagementUserResetDefaultPwd,
        },
        resetSignPasswordToRecord: {
          api: postTenantManagementUserResetDefaultSignPwd,
        },
        deleteRecord: {
          api: deleteTenantManagementUser,
        },
        importInfo: {
          api: postUserTenantImport,
        },
        exportInfo: {
          api: postUserTenantTmpl,
          otherRequestParams: { ...getRequestParams() },
        },
        enableUser: {
          api: putTenantManagementUserEnable,
        },
        unEnableUser: {
          api: putTenantManagementUserDisable,
        },
      }"
      @on-notify="handleNotify"
      @on-primaryKey-click="handlePrimaryKeyClick"
    />
    <user-modal @register="userRegister" @ok="handleModalOk" />
  </div>
</template>
<script setup lang="ts" name="user-container">
  import { ref, onBeforeMount, onMounted, toRaw, unref, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { has } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { QuerySelect, UserTable } from '/@/components/UserCmp';
  import {
    ButtonTypeEnum,
    PlatformEnum,
    UserEnabledEnum,
  } from '/@/components/UserCmp/constant/interface';
  import { getTableButton, handleButtonListDataBack } from '/@/components/UserCmp/constant/config';
  import { columns } from '../constant/interface';
  import UserModal from '/@backend-management/views/user-manage/components/user-modal.vue';
  import { useModal } from '/@/components/Modal';
  import {
    getTenantManagementUserPageList,
    postTenantManagementUser,
    getTenantManagementUserInfoById,
    putTenantManagementUserEnable,
    putTenantManagementUserDisable,
    putTenantManagementUserById,
    postTenantManagementUserResetDefaultPwd,
    postTenantManagementUserResetDefaultSignPwd,
    deleteTenantManagementUser,
  } from '/@/apis/gct-platform/TenantManagementUserController';
  import { postUserTenantImport, postUserTenantTmpl } from '/@/apis/gct-platform/UserController';
  import type { IButtonProps } from '/@/components/UserCmp/types/index.d';
  import type { UserWithUserExtraDTO } from '/@/apis/gct-platform/model/index';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { useUserStore } from '/@/store/modules/user';

  const { t } = useI18n();
  const appInfoStore = useAppInfoStore();
  const userStore = useUserStore();

  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  /** 列表使用到的按钮key集合 */
  const BTN_KEYS = inEDHRApp.value
    ? [
        ButtonTypeEnum.Create,
        ButtonTypeEnum.Import,
        ButtonTypeEnum.Export,
        ButtonTypeEnum.Edit,
        ButtonTypeEnum.ResetPwd,
        ButtonTypeEnum.ResetSignPwd,
        ButtonTypeEnum.Enable,
        ButtonTypeEnum.Disable,
        ButtonTypeEnum.Delete,
      ]
    : [
        ButtonTypeEnum.Create,
        ButtonTypeEnum.Import,
        ButtonTypeEnum.Export,
        ButtonTypeEnum.Edit,
        ButtonTypeEnum.ResetPwd,
        ButtonTypeEnum.ResetSignPwd,
        ButtonTypeEnum.Enable,
        ButtonTypeEnum.Disable,
        ButtonTypeEnum.Delete,
      ];

  const queryRef = ref();
  const tableRef = ref();

  const filterButton = ref<IButtonProps[]>([]);
  const tableData = ref<Array<UserWithUserExtraDTO>>([]);

  const [userRegister, { openModal }] = useModal();

  onBeforeMount(() => {
    // 获取按钮组
    const buttons = getTableButton(BTN_KEYS);
    filterButton.value = handleButtonListDataBack(buttons);
  });

  onMounted(getUserTableData);

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
    };
  };

  async function getUserTableData() {
    const paginationInfo = unref(tableRef.value.pagination) || {};
    const result = await getTenantManagementUserPageList({
      ...getRequestParams(),
      pageNo: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    });
    tableRef.value.changePagination({
      current: result?.pageNo,
      total: result?.totalCount,
    });
    tableData.value = result?.data ?? [];
  }

  const handlePrimaryKeyClick = async (info) => {
    const data = await getTenantManagementUserInfoById({ id: info.id });
    openModal(true, {
      title: t('sys.component.userCmp.userDetailTitle'),
      type: 'readonly',
      info: data,
    });
  };

  const handleNotify = async ({ key, ...otherParams }) => {
    if (key === ButtonTypeEnum.Create) {
      openModal(true, {
        title: `${t('sys.new')}${t('sys.user')}`,
        type: 'create',
      });
    } else if (key === ButtonTypeEnum.Edit) {
      const data = await getTenantManagementUserInfoById({ id: otherParams.recordInfo.id });
      openModal(true, {
        title: `${t('sys.edit')}${t('sys.user')}`,
        type: 'edit',
        info: data,
      });
    } else if (key === 'request-data') {
      if (has(otherParams, 'status') && otherParams.status === 'search-data') {
        tableRef.value.resetCurrent();
      }

      await getUserTableData();
    }
  };

  const handleModalOk = async ({
    info,
    type,
    callback,
  }: {
    info: UserWithUserExtraDTO;
    type: 'create' | 'edit' | 'detail';
    callback: () => void;
  }) => {
    if (type === 'create') {
      await postTenantManagementUser(info);
      message.success(t('sys.component.userCmp.addUserSuccess'));
    } else if (type === 'edit') {
      await putTenantManagementUserById({ id: info.userId ?? '' }, info);
      if (info.userId === userStore.getUserInfo.userId) {
        userStore.setSomeUserInfo(info);
      }
      message.success(t('sys.component.userCmp.editUserSuccess'));
    }
    if (typeof callback === 'function') {
      callback();
    }
    await getUserTableData();
  };
</script>
<style scoped lang="less">
  .user-container {
    position: relative;
    height: 100%;
    padding: 16px;
    background-color: #fff;
  }
</style>
