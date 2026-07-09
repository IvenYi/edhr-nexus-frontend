<template>
  <div class="user-container">
    <query-select ref="queryRef" :hideKeys="['email', 'enabled']" @on-notify="handleNotify" />
    <user-table
      ref="tableRef"
      primaryKey="fullname"
      :platformType="PlatformEnum.PLATFORM_MANAGE_USER"
      :columns="columns"
      :dataSource="tableData"
      :filterButton="filterButton"
      :matchRowTips="{
        [ButtonTypeEnum.ResetPwd]: 'fullname',
        [ButtonTypeEnum.Delete]: 'fullname',
      }"
      :apiConfig="{
        resetPasswordToRecord: {
          api: postUserResetDefaultPwd,
        },
        resetSignPasswordToRecord: {
          api: postUserResetDefaultSignPwd,
        },
        deleteRecord: {
          api: deleteUser,
        },
        importInfo: {
          api: postUserPlatImport,
        },
        exportInfo: {
          api: postUserPlatTmpl,
          otherRequestParams: { ...getRequestParams() },
        },
      }"
      @on-notify="handleNotify"
      @on-primaryKey-click="handlePrimaryKeyClick"
      @on-trace="handleTrace"
    />
    <user-modal @register="userRegister" @ok="handleModalOk" />
    <data-template @register="register" />
  </div>
</template>
<script setup lang="ts" name="user-container">
  import { ref, onBeforeMount, onMounted, toRaw, unref } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { has } from 'lodash-es';
  import UserModal from './user-modal.vue';
  import DataTemplate from './data_template.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { QuerySelect, UserTable } from '/@/components/UserCmp';
  import { ButtonTypeEnum, PlatformEnum } from '/@/components/UserCmp/constant/interface';
  import { getTableButton, handleButtonListDataBack } from '/@/components/UserCmp/constant/config';
  // import { columns } from '../constant/interface';
  import { useModal } from '/@/components/Modal';
  import {
    postUser,
    getUserPageList,
    getUserInfoById,
    putUserById,
    postUserPlatImport,
    postUserPlatTmpl,
    postUserResetDefaultPwd,
    postUserResetDefaultSignPwd,
    deleteUser,
  } from '/@/apis/gct-platform/UserController';
  import type { IButtonProps, UserDto } from '/@/components/UserCmp/types/index.d';
  import type { UserResponse } from '/@/apis/gct-platform/model/index';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { BasicColumn } from '/@/components/Table/src/types/table';
  import { useUserStore } from '/@/store/modules/user';

  const { t } = useI18n();

  /** 列表使用到的按钮key集合 */
  const BTN_KEYS = [
    ButtonTypeEnum.Create,
    ButtonTypeEnum.Import,
    ButtonTypeEnum.Export,
    ButtonTypeEnum.Edit,
    ButtonTypeEnum.ResetPwd,
    ButtonTypeEnum.ResetSignPwd,
    // ButtonTypeEnum.Trace,
    ButtonTypeEnum.Delete,
  ];

  const queryRef = ref();
  const tableRef = ref();
  const { getSecurityConfig } = useRootSetting();
  const userStore = useUserStore();
  const columns = ref<Array<BasicColumn | null>>([
    {
      title: t('sys.index'),
      dataIndex: 'no',
      fixed: 'left',
      width: 72,
    },
    {
      title: t('sys.fullname'),
      dataIndex: 'fullname',
      fixed: 'left',
    },
    {
      title: t('sys.userName'),
      dataIndex: 'username',
    },
    {
      title: t('sys.mobile'),
      dataIndex: 'mobile',
      width: 136,
    },
    {
      title: t('sys.affTenant'),
      dataIndex: 'tenantNames',
    },
    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: getSecurityConfig.value.enableSignPassword == 1 ? 255 : 150,
      align: 'left',
      fixed: 'right',
    },
  ]);

  const filterButton = ref<IButtonProps[]>([]);
  const tableData = ref<Array<UserResponse>>([]);

  const [userRegister, { openModal }] = useModal();
  const [register, { openModal: openTraceModal }] = useModal();

  onBeforeMount(() => {
    // 获取按钮组
    const buttons = getTableButton(BTN_KEYS);
    filterButton.value = handleButtonListDataBack(buttons);
  });

  onMounted(getUserTableData);

  const handleTrace = (info) => {
    openTraceModal(true, {
      id: info.recordInfo.id,
    });
  };

  const getRequestParams = () => {
    const params = toRaw(queryRef.value?.formState) || {};
    return {
      fullname: params.fullname,
      mobile: params.mobile,
      username: params.username,
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
    const result = await getUserPageList({
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
    const data = await getUserInfoById({ id: info.id });
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
      const data = await getUserInfoById({ id: otherParams.recordInfo.id });
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
    info: UserDto;
    type: 'create' | 'edit' | 'readonly';
    callback: () => void;
  }) => {
    if (type === 'create') {
      await postUser(info);
      message.success(t('sys.createSuccess'));
    } else if (type === 'edit') {
      await putUserById({ id: info.id as string }, info);
      if (info.id === userStore.getUserInfo.userId) {
        userStore.setSomeUserInfo(info);
      }
      message.success(t('sys.developer.appCenter.editSuccess'));
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
