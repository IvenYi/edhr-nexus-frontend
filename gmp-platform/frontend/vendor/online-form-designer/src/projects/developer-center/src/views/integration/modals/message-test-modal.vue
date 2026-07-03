<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.integration.messageTestOfSth', { sth: optName })"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <template v-if="formState.type === MessageTemplateEnum.EMAIL">
        <!-- <a-form-item
          :label="t('sys.integration.receiveMailBox')"
          name="receiveEmail"
          :rules="[
            { required: true },
            {
              type: 'email',
              message: t('sys.pleaseInputValidSth', {
                sth: t('sys.mailBox'),
              }),
            },
          ]"
        >
          <a-input v-model:value="formState.receiveEmail" show-count :maxlength="32" />
        </a-form-item> -->
        <a-form-item
          :label="t('sys.integration.receiveUser')"
          name="receiveUserId"
          :rules="[{ required: true }]"
        >
          <a-select
            v-model:value="formState.receiveUserId"
            show-search
            :filter-option="handleFilterOption"
          >
            <a-select-option
              v-for="d in tenantUsers"
              :key="d.id"
              :value="d.id"
              :disabled="d.disabled"
              :name="d.name"
              :email="d.email"
            >
              {{ d.name }}【{{ d.email || t('sys.integration.userWithNoMailBox') }}】
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :label="t('sys.titleOfSth', { sth: t('sys.mail') })"
          name="title"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-input v-model:value="formState.title" show-count :maxlength="32" />
        </a-form-item>
      </template>

      <template v-else>
        <a-form-item :label="t('sys.user')" name="receiveUser" :rules="[{ required: true }]">
          <!-- <a-select v-model:value="formState.receiveUser">
            <a-select-option v-for="d in developers" :key="d.id">{{ d.name }}</a-select-option>
          </a-select> -->
          <a-input v-model:value="formState.receiveUser" show-count :maxlength="128" />
        </a-form-item>
      </template>

      <a-form-item :label="t('sys.content')" name="content" :rules="[{ required: true }]">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.content"
          show-count
          :rows="5"
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type {
    SendEmailMessageRequest,
    SendMessageRequest,
    TenantDeveloperDTO,
  } from '/@/apis/gct-platform/model';
  import {
    postMessageSettingSendEmailMessage,
    postMessageSettingSendMessage,
  } from '/@/apis/gct-platform/MessageSettingController';
  import { MessageTemplateEnum, MessageTemplateOptions } from '../enum';
  import { pick } from 'lodash-es';
  // import { getTenantDeveloperPageList } from '/@/apis/gct-platform/TenantDeveloperController';
  import { getTenantManagementUserPageList } from '/@/apis/gct-platform/TenantManagementUserController';

  interface ITenantUser {
    id: string;
    name: string;
    email: string;
    title: string;
    disabled: boolean;
  }

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
    // if (data.type !== MessageTemplateEnum.EMAIL && developers.value.length === 0) {
    //   getTenantDeveloperPageList({
    //     pageNo: 1,
    //     pageSize: 9999,
    //   }).then((res) => {
    //     developers.value = res?.data ?? [];
    //   });
    // }
    if (data.type === MessageTemplateEnum.EMAIL && developers.value.length === 0) {
      getTenantManagementUserPageList({
        pageNo: 1,
        pageSize: 9999,
      }).then((res) => {
        tenantUsers.value = (res?.data ?? []).map((item) => {
          return {
            id: item.id,
            name: item.fullname ?? '',
            email: item.email ?? '',
            title: item.fullname + (item.email ? `(${item.email})` : ''),
            disabled: !item.email,
          } as ITenantUser;
        });
      });
    }
  });

  const handleFilterOption = (inputValue, option) => {
    const key = inputValue.trim().toLowerCase();
    if (!key) return true;
    return option.name.toLowerCase().includes(key) || option.email.toLowerCase().includes(key);
  };

  const optName = computed(() => {
    const opt = MessageTemplateOptions.find((item) => item.value === formState.type);
    if (opt) {
      return t(opt.i18n);
    } else {
      return '';
    }
  });

  const formRef = ref<FormInstance>();
  const formState: SendEmailMessageRequest & SendMessageRequest = reactive({
    id: undefined,
    receiveUserId: '',
    title: '',
    receiveUser: '',
    type: '',
    content: '',
  });
  const developers = ref<TenantDeveloperDTO[]>([]);
  const tenantUsers = ref<ITenantUser[]>([]);

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      if (formState.type === MessageTemplateEnum.EMAIL) {
        await postMessageSettingSendEmailMessage(
          pick(formState, ['id', 'receiveUserId', 'title', 'content']),
        );
      } else {
        await postMessageSettingSendMessage(
          pick(formState, ['id', 'receiveUser', 'type', 'content']),
        );
      }
      message.success(t('sys.operationSuccess'));
      closeModal();
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
