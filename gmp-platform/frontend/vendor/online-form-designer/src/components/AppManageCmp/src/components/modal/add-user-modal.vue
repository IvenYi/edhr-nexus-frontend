<template>
  <BasicModal
    v-bind="$attrs"
    class="application-management"
    @register="registerInner"
    :title="`${t('sys.developer.appCenter.add')}${t('sys.developer.appCenter.user')}`"
    centered
    width="640px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      :model="formState"
      autocomplete="off"
      ref="formRef"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 12 }"
    >
      <a-form-item
        :label="
          detail?.type == 'BI'
            ? t('sys.developer.appCenter.roleName')
            : t('sys.developer.appCenter.roleTitle')
        "
        name="role"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.role"
          style="width: 100%"
          :disabled="detail?.type == 'BI'"
          :placeholder="
            t('sys.pleaseSelectSth', {
              sth: t('sys.developer.appCenter.roleTitle'),
            })
          "
        >
          <a-select-option v-for="roles in UserRoleOptions" :value="roles.value" :key="roles.id">{{
            roles.label
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.developer.appCenter.user')"
        name="userId"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.userId"
          style="width: 100%"
          :showSearch="true"
          :placeholder="
            t('sys.pleaseSelectSth', {
              sth: t('sys.developer.appCenter.user'),
            })
          "
          @select="handleSelect"
          :options="userList"
          :filter-option="(input: string, option: any) => {
                return option.label.indexOf(input.toLowerCase()) >= 0;
              }"
        />
      </a-form-item>
      <a-form-item v-if="detail?.type !== 'BI'" :label="t('sys.userName')" name="username">
        <span>{{ formState.username ?? '-' }}</span>
      </a-form-item>
      <a-form-item
        v-if="detail?.type !== 'BI'"
        :label="t('sys.developer.appCenter.affOrg')"
        name="orgName"
      >
        <span>{{ formState.orgName ?? '-' }}</span>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="add-user-modal">
  import { reactive, ref, toRaw, watch } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UserRoleOptions, UserRoleReqEnum } from '../../constant/interface';

  import { getTenantDeveloperList } from '/@/apis/gct-platform/TenantDeveloperController';
  import { getOrgUserListCurrentTenantUser } from '/@/apis/gct-platform/OrgController';
  import type { SelectProps } from 'ant-design-vue';

  import { omit } from 'lodash-es';

  const { t } = useI18n();

  interface FormState {
    /**id */
    appId?: string;
    /** 所属租户id  */
    tenantId?: string;
    /** 角色 */
    role?: UserRoleReqEnum;
    /** 成员 */
    userId?: string;
    /** 账号 */
    username?: string;
    /** 所属组织 */
    orgName?: string;
  }

  interface ModalInfo {
    appId: string;
    tenantId: string;
    filterUserIds: string[];
    detail?: any;
  }

  const emit = defineEmits(['ok']);

  const userList = ref<SelectProps['options']>([]);

  const filterUsers = ref<string[]>([]);

  const detail = ref<any>({});
  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    appId: undefined,
    role: undefined,
    userId: undefined,
    username: undefined,
    orgName: undefined,
  });

  watch(
    () => formState.role,
    () => {
      userList.value = [];
      formState.userId = undefined;
      requestUserList();
    },
    { deep: true },
  );

  async function requestUserList() {
    if (!formState.role) {
      return;
    }

    if ([UserRoleReqEnum.DEVELOPER, UserRoleReqEnum.VIEWER].includes(formState.role)) {
      // 开发人员和查看人员，从开发者列表中选择
      const list = await getTenantDeveloperList();
      userList.value = (list ?? [])
        .map((item) => {
          return {
            label: item.name,
            value: item.userId,
            account: item.account,
            orgName: item.orgNames?.join(','),
          };
        })
        .filter((item) => !filterUsers.value.includes(item.value as string));
    } else if (formState.role === UserRoleReqEnum.TESTER) {
      // 测试人员，从租户组织中选择
      const data = await getOrgUserListCurrentTenantUser({ orgId: formState.tenantId as string });
      userList.value = (data ?? [])
        .map((item) => {
          return {
            label: item.fullname,
            value: item.userId,
            account: item.username,
            orgName: item.orgNames?.join(','),
          };
        })
        .filter((item) => !filterUsers.value.includes(item.value as string));
    }
  }

  const [registerInner, { closeModal }] = useModalInner((data: ModalInfo) => {
    if (data) {
      formState.appId = data.appId;
      formState.tenantId = data.tenantId;
      filterUsers.value = data.filterUserIds;
      detail.value = data?.detail;
      detail.value.type == 'BI' ? (formState.role = UserRoleReqEnum.DEVELOPER) : null;
    }
  });

  const handleSelect = (id) => {
    const info = userList.value?.find((item) => item.value === id);
    formState.username = info?.account;
    formState.orgName = info?.orgName;
  };

  const handleShow = () => {};

  const handleClose = () => {
    formRef.value?.resetFields();
    userList.value = [];
    filterUsers.value = [];
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      emit('ok', { ...omit(toRaw(formState), ['username', 'orgName']) });
      closeModal();
    });
  };
</script>

<style lang="less" scoped></style>
