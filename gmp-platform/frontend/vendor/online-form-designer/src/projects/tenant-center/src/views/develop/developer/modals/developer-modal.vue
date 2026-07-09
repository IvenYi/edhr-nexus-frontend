<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit
        ? t('sys.editSth', { sth: t('sys.developer.index') })
        : t('sys.addSth', { sth: t('sys.developer.index') })
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item :label="t('sys.user')" name="userId" :rules="[{ required: true }]">
        <a-select
          :disabled="isEdit"
          ref="select"
          v-model:value="formState.userId"
          :showSearch="true"
          :filter-option="(input: string, option: any) => {
                return option.fullname.indexOf(input) >= 0;
              }"
        >
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
      <a-form-item :label="t('sys.type')" name="type" :rules="[{ required: true }]">
        <a-select ref="select" v-model:value="formState.type">
          <a-select-option
            v-for="item in DeveloperTypeOptions"
            :value="item.value"
            :key="item.value"
          >
            {{ t(item.i18nKey) }}
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
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getTenantManagementUserPageList } from '/@/apis/gct-platform/TenantManagementUserController';
  import {
    postTenantDeveloper,
    putTenantDeveloperById,
  } from '/@/apis/gct-platform/TenantDeveloperController';
  import type { TenantDeveloperRequest, UserWithUserExtraDTO } from '/@/apis/gct-platform/model';
  import { DeveloperTypeOptions } from '/@tenant-center/types';
  import { pick } from 'lodash-es';

  const emit = defineEmits(['refresh']);

  const userList = ref<UserWithUserExtraDTO[]>([]);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    getTenantManagementUserPageList({ pageNo: 1, pageSize: 9999 }).then(
      (res) => (userList.value = res!.data),
    );
    const { edit, record } = data;
    isEdit.value = !!edit;
    isEdit.value && Object.assign(formState, record);
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const formState: TenantDeveloperRequest = reactive({
    userId: '',
    type: '',
    description: '',
  });

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const data = pick(formState, ['userId', 'type', 'description']);
      if (isEdit.value) {
        await putTenantDeveloperById({ id: formState.id }, data);
      } else {
        await postTenantDeveloper(data);
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
