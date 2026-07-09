<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit ? t('sys.editSth', { sth: t('sys.admin') }) : t('sys.addSth', { sth: t('sys.admin') })
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <!-- 编辑时为单选 -->
      <a-form-item
        v-if="isEdit"
        :label="t('sys.admin')"
        name="userId"
        :rules="[{ required: true }]"
      >
        <a-select :disabled="isEdit" ref="select" v-model:value="formState.userId">
          <a-select-option v-for="item in userList" :value="item.id" :key="item.id">
            {{ item.fullname }}11
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 新建时为多选 -->
      <a-form-item v-else :label="t('sys.admin')" name="userIds" :rules="[{ required: true }]">
        <a-select
          mode="multiple"
          :disabled="isEdit"
          ref="select"
          v-model:value="formState.userIds"
          show-search
          :maxTagCount="5"
          :maxTagTextLength="6"
          @search="handleSearch"
          @blur="handleBlur"
          :filter-option="false"
        >
          <!-- :filter-option="(input: string, option: any) => {
            if(!input || !input.trim())  return true;
            return option.fullname.toLowerCase().includes(input.trim().toLowerCase());
          }" -->
          <a-select-option
            v-for="item in userList"
            :value="item.id"
            :key="item.id"
            :fullname="item.fullname"
          >
            {{ item.fullname }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('sys.role')" name="roleIds" :rules="[{ required: true }]">
        <a-select
          mode="multiple"
          ref="select"
          v-model:value="formState.roleIds"
          :maxTagCount="5"
          :maxTagTextLength="6"
          :filter-option="(input: string, option: any) => {
            if(!input || !input.trim())  return true;
            return option.name.toLowerCase().includes(input.trim().toLowerCase());
          }"
        >
          <a-select-option
            v-for="item in roleList"
            :value="item.id"
            :key="item.id"
            :name="item.name"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.notes')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getTenantManagementUserPageList } from '/@/apis/gct-platform/TenantManagementUserController';
  import {
    postTenantDeveloper,
    putTenantDeveloperById,
  } from '/@/apis/gct-platform/TenantDeveloperController';
  import type {
    // TenantDeveloperRequest,
    UserWithUserExtraDTO,
    RoleResponse,
    UserRoleRequest,
    UserRoles4Update,
  } from '/@/apis/gct-platform/model';
  import { DeveloperTypeOptions } from '/@tenant-center/types';
  import { pick, cloneDeep, debounce } from 'lodash-es';
  import { useRoleApis, useAdminApis, useUserApis } from '/@/views/permission/hooks/useModule';

  const emit = defineEmits(['refresh']);

  // const userList = ref<UserWithUserExtraDTO[]>([]);
  const roleList = ref<RoleResponse[]>([]);

  const { getRolePageList } = useRoleApis();
  const { postUserRole, postUserRoleReset } = useAdminApis();
  const { getUserPageList } = useUserApis();
  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    initOptions();
    const { edit, record } = data;
    isEdit.value = !!edit;
    console.log(record);
    isEdit.value && Object.assign(formState, record);
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const formState = reactive({
    userIds: [],
    userId: '',
    roleIds: [],
    description: '',
  });
  const userOptions = ref<UserWithUserExtraDTO[]>([]);
  const queryData = ref<UserWithUserExtraDTO[]>([]);
  const keyword = ref('');

  const initOptions = async () => {
    const res: any = (await getUserPageList({ pageNo: 1, pageSize: 9999 })) || {};
    userOptions.value = res.data?.filter((i) => i.fullname) || [];
    getRolePageList({ pageNo: 1, pageSize: 9999, enabled: 1 }).then(
      (res) => (roleList.value = res!.data!),
    );
  };

  const userList = computed(() => {
    const list = keyword.value.trim()
      ? [...userOptions.value, ...queryData.value].filter((e) =>
          e.fullname?.toLowerCase().includes(keyword.value.trim().toLowerCase()),
        )
      : cloneDeep(userOptions.value);
    return list;
  });

  const handleSearch = debounce(async (val) => {
    keyword.value = val;
    await nextTick();
    if (keyword.value && !userList.value.length) {
      console.log(val);
      const res: any = await getUserPageList({ pageNo: 1, pageSize: 9999, fullname: val });
      queryData.value = res.data?.filter((i) => i.fullname) || [];
    }
  }, 200);

  const handleBlur = () => {
    keyword.value = '';
    queryData.value = [];
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  const filterOption = (input: string, option: any) => {
    if (!input || !input.trim()) return true;
    return option.fullname.toLowerCase().includes(input.trim().toLowerCase());
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      if (isEdit.value) {
        const data = pick(formState, ['userId', 'roleIds', 'description']);
        await postUserRoleReset(data);
      } else {
        const data = pick(formState, ['userIds', 'roleIds', 'description']);
        await postUserRole(data);
      }
      message.success(t('sys.operationSuccess'));
      closeModal();
      emit('refresh');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
