<template>
  <div class="member-list-wrap">
    <basic-table
      :striped="false"
      :bordered="true"
      :showIndexColumn="showIndex"
      :ellipsis="true"
      :dataSource="dataSource"
      :columns="detail.type != 'BI' ? memberListColumns : bIMemberListColumns"
      :pagination="false"
    >
      <template #headerTop>
        <div style="display: flex; padding: 16px">
          <a-form ref="formRef" :model="formState" autocomplete="off" style="flex: 1">
            <a-row :gutter="12">
              <a-col :span="6">
                <a-form-item name="name" :label="t('sys.fullname')">
                  <a-input v-model:value="formState.name" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item name="role" :label="t('sys.developer.appCenter.roleTitle')">
                  <a-select v-model:value="formState.role">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option
                      v-for="roles in UserRoleOptions"
                      :value="roles.value"
                      :key="roles.id"
                      >{{ roles.label }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-button @click="() => formRef?.resetFields()">
                  <template #icon>
                    <undo-outlined />
                  </template>
                  {{ t('sys.reset') }}
                </a-button>
                <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
                  <template #icon>
                    <search-outlined />
                  </template>
                  {{ t('sys.query') }}
                </a-button>
              </a-col>
              <a-col :span="4" style="text-align: right">
                <a-button
                  v-for="(btn, index) of headerButton"
                  :key="btn.key"
                  v-bind="btn.style"
                  :class="[index !== 0 ? 'ml-8px' : '']"
                  @click="() => handleBtnClick({ key: btn.key })"
                >
                  <template #icon v-if="btn.icon">
                    <component :is="icons[btn.icon ?? '']" />
                  </template>
                  {{ btn.name }}
                </a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.key === 'fullname'">
          {{ text }}
        </template>
        <template v-else-if="column.key === 'role'">
          <span
            v-if="
              record.role === UserRoleReqEnum.MAINTAINER || !hasActionRole || detail.type == 'BI'
            "
            >{{ Ch_UserRole[record.role] }}</span
          >
          <a-select
            v-else
            style="width: 100%"
            :placeholder="
              t('sys.pleaseSelectSth', {
                sth: t('sys.developer.appCenter.roleTitle'),
              })
            "
            :value="record.role"
            @select="(roleType) => handleBtnClick({ key: 'edit-role', roleType, record })"
          >
            <a-select-option
              v-for="roles in UserRoleOptions"
              :value="roles.value"
              :key="roles.id"
              >{{ roles.label }}</a-select-option
            >
          </a-select>
        </template>
        <template v-else-if="column.key === 'action'">
          <table-action-auto :actions="transformRowButton(record)" :stopButtonPropagation="true" />
        </template>
      </template>
    </basic-table>
    <add-user-modal @register="register" @ok="handleModalOk" />
    <transfer-user-modal @register="transferRegister" @ok="handleTransferModalOk" :appId="pid" />
  </div>
</template>
<script setup lang="ts" name="member-list">
  import { ref, computed, toRaw, onBeforeMount, onMounted, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import AddUserModal from '../modal/add-user-modal.vue';
  import TransferUserModal from '../modal/transfer-user-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  import {
    UserRoleReqEnum,
    Ch_UserRole,
    memberListColumns,
    bIMemberListColumns,
    AppDetailTabEnum,
    ButtonLocationTypeEnum,
    ButtonTypeEnum,
    UserRoleOptions,
    PlatformEnum,
  } from '../../constant/interface';
  import { getDropBtnPropsConfig } from '../../constant/config';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  import {
    getAppMemberList,
    postAppMember,
    putAppMemberByIdByRole,
    deleteAppMember,
    putAppMemberTransferByIdByTargetUserId,
  } from '/@/apis/gct-platform/AppMemberController';
  import { getTenantDeveloperList } from '/@/apis/gct-platform/TenantDeveloperController';
  import type { AppMemberResponse, AppResponse } from '/@/apis/gct-platform/model';
  import type { FormInstance } from 'ant-design-vue';
  import type { IButtonProps } from '../../types/index.d';

  const { t } = useI18n();
  const userStore = useUserStoreWithOut();

  interface Props {
    /** 应用id */
    pid?: string;
    /** 租户id */
    tenantId: string;
    tabActiveKey: AppDetailTabEnum;
    /** 应用详情信息 */
    detail: AppResponse;
    platformType: PlatformEnum;
  }

  const props = defineProps<Props>();

  const icons = {
    'add-user': PlusOutlined,
  };

  const matchShows = {
    [ButtonTypeEnum.Transfer]: 'role',
    [ButtonTypeEnum.Detach]: 'role',
  };

  const formRef = ref<FormInstance>();

  interface FormState {
    /** 姓名 */
    name?: string;
    /** 角色 */
    role?: UserRoleReqEnum | number;
  }

  const formState = reactive<FormState>({
    name: undefined,
    role: -1,
  });

  const showIndex = ref<boolean>(false);
  const filterButton = ref<IButtonProps[]>([]);
  const dataSource = ref<Array<AppMemberResponse>>([]);

  const [register, { openModal }] = useModal();
  const [transferRegister, { openModal: openTransferModal }] = useModal();

  onBeforeMount(() => {
    // 获取按钮组
    filterButton.value = getDropBtnPropsConfig({ tabType: AppDetailTabEnum.MemberList });
  });

  onMounted(() => {
    getMemberListData();
  });

  /** 是否有操作权限 */
  const hasActionRole = computed(() => {
    // 只能应用管理员和维护者有编辑权限
    return (
      userStore.getTenantUserInfo?.tenantDeveloperType === 'APPLICATION_ADMIN' ||
      props.detail?.appMember?.userId === userStore.getUserInfo.userId ||
      (props.platformType === PlatformEnum.PLATFORM_TENANT_CENTER &&
        userStore.getTenantUserInfo?.tenantManager === 1)
    );
  });

  const headerButton = computed(() => {
    return filterButton.value?.filter((btn) => {
      if (btn.locationType !== ButtonLocationTypeEnum.CardTileButton) {
        return false;
      }
      if (
        btn.isShow &&
        !btn.isShow({}, { appDetail: props.detail, platformType: props.platformType })
      ) {
        return false;
      }
      return true;
    });
  });

  const rowButton = computed(() =>
    filterButton.value?.filter((btn) => btn.locationType === ButtonLocationTypeEnum.CardDropButton),
  );

  const transformRowButton = computed(() => (record) => {
    return rowButton.value
      ?.filter((btn) => {
        if (
          btn.isShow &&
          !btn.isShow(record, {
            attr: matchShows[btn.key],
            appDetail: props.detail,
            platformType: props.platformType,
          })
        ) {
          return false;
        }
        return true;
      })
      .map((btn) => {
        const actionProps = {};
        if (btn?.tips) {
          Object.assign(actionProps, {
            popConfirm: {
              title: typeof btn.tips.row === 'function' ? btn.tips.row?.('') : btn.tips.row,
              arrowPointAtCenter: true,
              placement: 'topRight',
              overlayStyle: {
                maxWidth: '240px',
              },
              confirm: handleBtnClick.bind(null, {
                key: btn.key,
                btnInfo: toRaw(btn),
                recordInfo: toRaw(record),
              }),
            },
          });
        } else {
          Object.assign(actionProps, {
            onClick: handleBtnClick.bind(null, {
              key: btn.key,
              btnInfo: toRaw(btn),
              recordInfo: toRaw(record),
            }),
          });
        }
        return {
          label: btn?.name,
          ...btn?.style,
          ...actionProps,
        };
      });
  });

  async function getMemberListData() {
    console.log('props', props);
    showIndex.value = props.detail.type == 'BI' ? true : false;
    if (props.pid) {
      const list = await getAppMemberList({
        appId: props.pid,
        fullname: formState.name,
        appMemberRole: formState.role === -1 ? undefined : formState.role,
      });
      dataSource.value = list ?? [];
    }
  }

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      await getMemberListData();
    });
  };

  const handleBtnClick = async (btnInfo) => {
    if (btnInfo.key === ButtonTypeEnum.Add) {
      openModal(true, {
        appId: props.pid,
        tenantId: props.tenantId,
        filterUserIds: dataSource.value.map((item) => item.userId),
        detail: props.detail,
      });
    } else if (btnInfo.key === ButtonTypeEnum.Transfer) {
      openTransferModal(true, {
        id: btnInfo.recordInfo.id,
        userId: btnInfo.recordInfo.userId,
      });
    } else if (btnInfo.key === ButtonTypeEnum.Detach) {
      await deleteAppMember({ id: btnInfo.recordInfo.id });
      message.success(t('sys.developer.appCenter.deleteUserSuccess'));
      await getMemberListData();
    } else if (btnInfo.key === 'edit-role') {
      // 当前列表是测试人员，需要判断是否在开发人员列表里
      if (btnInfo.record.role === UserRoleReqEnum.TESTER) {
        const list = await getTenantDeveloperList();
        const userIds = (list ?? []).map((item) => item.userId);
        // 不存在中开发人员列表中
        if (!userIds.includes(btnInfo.record.userId)) {
          message.error('该人员不在开发人员列表中，不能切换角色');
          return;
        }
      }

      await putAppMemberByIdByRole({
        id: btnInfo.record.id,
        role: btnInfo.roleType,
      });
      message.success(t('sys.developer.appCenter.editRoleSuccess'));
      await getMemberListData();
    }
  };

  const handleModalOk = async (info) => {
    await postAppMember(info);
    message.success(t('sys.developer.appCenter.addUserSuccess'));
    await getMemberListData();
  };

  const handleTransferModalOk = async (info) => {
    await putAppMemberTransferByIdByTargetUserId(info);
    message.success(t('sys.developer.appCenter.transferAppSuccess'));
    await getMemberListData();
  };
</script>
<style lang="less" scoped>
  .member-list-wrap {
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }

    :deep(.ant-table-container) {
      border-right: none;
      border-bottom: none;
      border-left: none;
    }
  }
</style>
