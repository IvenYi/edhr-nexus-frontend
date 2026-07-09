<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.tenantName')"
        name="name"
        :rules="[
          { required: isEdit, message: t('sys.tenantNamePlaceholder') },
          {
            validator: validateSpecialCharacters,
            message: t('sys.tenant.validateTenantNameErrorMsg', {
              character: '[!@#$%^&*(),.?:{}|<>]',
            }),
          },
        ]"
      >
        <span v-if="isDetail">{{ formState.name }}</span>
        <a-input
          v-else
          v-model:value.trim="formState.name"
          :placeholder="t('sys.tenantNamePlaceholder')"
          :maxlength="32"
          show-count
        />
      </a-form-item>

      <a-form-item :label="t('sys.associatedOrg')" name="orgName" :rules="[{ required: isEdit }]">
        <span>{{ formState.orgName }}</span>
      </a-form-item>

      <a-form-item
        :label="t('sys.administratorAccount')"
        name="managerIds"
        :rules="[{ required: isEdit, message: t('sys.tenant.selectedAdministratorAccount') }]"
      >
        <span v-if="isDetail">{{ formState.managerNames }}</span>
        <a-tree-select
          v-else
          v-model:value="formState.managerIds"
          :show-search="true"
          :tree-data="managerTreeData"
          :showArrow="true"
          :fieldNames="{ children: 'children', label: 'fullname', value: 'id' }"
          tree-checkable
          allow-clear
          :show-checked-strategy="TreeSelect.SHOW_PARENT"
          :placeholder="t('sys.tenant.selectedAdministratorAccount')"
          tree-node-filter-prop="fullname"
        />
      </a-form-item>

      <!-- <a-form-item
        :label="t('sys.tenantDomains')"
        name="domainPrefix"
        :rules="[{ required: false }]"
      >
        <span v-if="isDetail">{{
          formState.domainPrefix ? `Http://${formState.domainPrefix}gct.china.com` : '-'
        }}</span>
        <a-input
          v-else
          v-model:value="formState.domainPrefix"
          addon-before="Http://"
          addon-after="gct.china.com"
        />
      </a-form-item> -->
    </a-form>
  </BasicModal>
</template>
<script setup lang="ts" name="tenant-modal">
  import { reactive, ref, computed, toRaw } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { omit } from 'lodash-es';
  import type { FormInstance } from 'ant-design-vue';
  import { getUserList } from '/@/apis/gct-platform/UserController';

  const { t } = useI18n();

  interface FormState {
    /** id */
    id: string;
    /** 租户名称 */
    name: string;
    /** 关联组织 */
    orgName: string;
    /** 管理员账号id */
    managerIds: string[];
    /** 管理员账号 */
    managerNames: string;
    /** 租户域名 */
    // domainPrefix: string;
  }

  const emit = defineEmits(['ok', 'register']);

  const type = ref<'edit' | 'detail' | ''>();

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    id: '',
    name: '',
    orgName: '',
    managerIds: [],
    managerNames: '',
    // domainPrefix: '',
  });

  const managerTreeData = ref<Array<any>>([]);

  const isEdit = computed<boolean>(() => type.value === 'edit');

  const isDetail = computed<boolean>(() => type.value === 'detail');

  const title = computed<string>(() => {
    if (isEdit.value) {
      return t('sys.modifyTenant');
    }
    if (isDetail.value) {
      return t('sys.readyOnlyTenantInfo');
    }
    return '';
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      type.value = data.type;
      if (data.info) {
        onDataReceive(data.info);
      }
    }
  });

  const onDataReceive = (data) => {
    formState.id = data.id;
    formState.name = data.name;
    formState.orgName = data.orgName;
    // formState.domainPrefix = data.domainPrefix;
    formState.managerIds = data.managerList.map((item) => item.id);
    formState.managerNames = data.managerList.map((item) => item.fullname).join(',');
  };

  const handleShow = async (visible: boolean) => {
    console.warn('visible:', visible);
    if (visible) {
      type.value = '';
      managerTreeData.value = (await getUserList()) ?? [];
    }
  };

  // 校验特殊字符
  const validateSpecialCharacters = (_, value: string) => {
    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharactersRegex.test(value)) {
      return Promise.reject();
    }
    return Promise.resolve();
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.id = '';
    formState.managerNames = '';
    type.value = '';
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      emit('ok', { info: { ...omit(toRaw(formState), 'managerNames') }, type: type.value });
      closeModal();
    });
  };
</script>
