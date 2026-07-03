<template>
  <BasicModal
    v-bind="$attrs"
    class="application-management"
    @register="registerInner"
    :title="t('sys.developer.appCenter.appRest')"
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
        :label="t('sys.developer.appCenter.maintainer')"
        name="userId"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.userId"
          style="width: 100%"
          :placeholder="
            t('sys.pleaseSelectSth', {
              sth: t('sys.developer.appCenter.user'),
            })
          "
        >
          <a-select-option v-for="user in userList" :value="user.userId" :key="user.userId">{{
            user.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="app-rest-modal">
  import { reactive, ref, toRaw } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UserRoleReqEnum } from '../../constant/interface';
  import { getTenantDeveloperList } from '/@/apis/gct-platform/TenantDeveloperController';
  import type { TenantDeveloperDTO } from '/@/apis/gct-platform/model/index';

  const { t } = useI18n();

  interface FormState {
    /** 应用appid */
    appId?: string;
    /** 维护者id */
    userId?: string;
  }

  interface ModalState {
    /** 应用id */
    pid: string;
  }

  const emit = defineEmits(['ok']);

  const userList = ref<Array<TenantDeveloperDTO>>([]);

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    appId: undefined,
    userId: undefined,
  });

  const [registerInner, { closeModal }] = useModalInner((data: ModalState) => {
    if (data) {
      formState.appId = data.pid;
      onRequest(data);
    }
  });

  const onRequest = async (data) => {
    userList.value = (await getTenantDeveloperList()) ?? [];
  };

  const handleShow = async (visible: boolean) => {};

  const handleClose = () => {
    formRef.value?.resetFields();
    userList.value = [];
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      emit('ok', { ...toRaw(formState) });
      closeModal();
    });
  };
</script>

<style lang="less" scoped></style>
