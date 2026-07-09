<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.appDesigner.addRole')"
    centered
    width="640px"
    :minHeight="30"
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
        :label="t('sys.appDesigner.AssociatedRole')"
        name="roleId"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.roleId"
          style="width: 100%"
          :placeholder="t('sys.chooseText')"
        >
          <a-select-option v-for="role in filterRoleList" :value="role.id" :key="role.id">{{
            role.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="add-role-modal">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RelationTypeEnum } from '../../constant/interface';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { postUserGroupRelation } from '/@/apis/gct-apaas/UserGroupRelationController';
  import type { RoleResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  interface FormState {
    /** 用户组id */
    userGroupId?: string;
    /** 角色id */
    roleId?: string;
    /** 已经添加过的角色 */
    selectRoleIds?: string[];
  }

  const emit = defineEmits(['refresh']);

  const roleList = ref<Array<RoleResponse>>([]);

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    userGroupId: undefined,
    roleId: undefined,
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.userGroupId = data.userGroupId;
      formState.selectRoleIds = data.selectRoleIds || [];
    }
  });

  const handleShow = async (visible: boolean) => {
    if (visible) {
      // 初始化
      roleList.value = ((await getRoleList()) ?? []).filter((item) => {
        return item.enabled;
      });
    }
  };

  const filterRoleList = computed(() => {
    return roleList.value.filter((item) => !formState.selectRoleIds?.includes(item.id ?? ''));
  });

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.userGroupId = undefined;
    roleList.value = [];
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      await postUserGroupRelation({
        relationId: formState.roleId,
        relationType: RelationTypeEnum.ROLE,
        userGroupId: formState.userGroupId,
      });
      closeModal();
      emit('refresh');
    });
  };
</script>

<style lang="less" scoped></style>
