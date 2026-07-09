<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      t(isEdit ? 'sys.editSth' : 'sys.newSth', {
        sth: t('sys.tenant.assetCenter.sealManagement.seal'),
      })
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="pr-56px">
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 24 }"
        class="new-form"
      >
        <a-collapse v-model:activeKey="activePanel" ghost class="partial-interaction">
          <!-- 基本信息 -->
          <a-collapse-panel key="1" :header="t('sys.tenant.assetCenter.sealManagement.basicInfo')">
            <a-form-item
              :label="t('sys.nameOfSth', { sth: t('sys.tenant.assetCenter.sealManagement.seal') })"
              name="name"
              :rules="[
                { required: true, whitespace: true },
                { validator: nameValidator, trigger: 'blur' },
                { max: 100, message: t('sys.tenant.assetCenter.sealManagement.max100') },
              ]"
            >
              <!-- show-count :maxlength="100" -->
              <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
            </a-form-item>

            <a-form-item :label="t('sys.tenant.assetCenter.sealManagement.sealType')" name="type">
              <a-select v-model:value="formState.type">
                <a-select-option
                  v-for="item in sealTypeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ t(item.label) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-collapse-panel>

          <!-- 制章内容 -->
          <a-collapse-panel
            key="2"
            :header="t('sys.tenant.assetCenter.sealManagement.sealContent')"
          >
            <a-form-item
              :label="t('sys.tenant.assetCenter.sealManagement.localUpload')"
              name="sealImage"
              :rules="[
                {
                  required: true,
                  message: t('sys.tenant.assetCenter.sealManagement.uploadSealImagePlease'),
                  trigger: 'submit',
                },
              ]"
            >
              <a-upload
                accept="image/png"
                class="block w-40 h-40 cursor-pointer select-none"
                :show-upload-list="false"
                :before-upload="beforeUpload"
                :customRequest="handleCustomRequest"
              >
                <div
                  class="flex justify-center items-center relative z-0 w-40 h-40 rounded-md overflow-hidden border-1 border-[#C6C6C6]"
                  :class="
                    formState.sealImage
                      ? 'border-solid bg-transparent-grid'
                      : 'border-dashed bg-[#F9FAFB]'
                  "
                >
                  <template v-if="formState.sealImage">
                    <img
                      class="max-w-full max-h-full"
                      :src="getSealImageUrl(formState.sealImage)"
                      alt="seal"
                    />
                    <div
                      class="flex justify-center items-center absolute z-10 top-1 right-1 w-5 h-5 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-50 active:bg-opacity-70"
                      @click.stop="formState.sealImage = ''"
                    >
                      <i class="icon gct-iconfont icon-del_pic" style="font-size: 10px"></i>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      v-if="uploading"
                      class="absolute z-10 inset-0 flex justify-center items-center bg-black bg-opacity-30 text-lg text-white"
                    >
                      <loading-outlined />
                    </div>
                    <div v-else class="text-center text-[#5a5e66]">
                      <i class="icon gct-iconfont icon-icon_uplpoadpic" style="font-size: 32px"></i>
                      <div class="mt-2">
                        {{ t('sys.tenant.assetCenter.sealManagement.uploadSealImage') }}
                      </div>
                    </div>
                  </template>
                </div>
              </a-upload>
              <div class="mt-3 text-xs text-zinc-400">
                {{ t('sys.tenant.assetCenter.sealManagement.uploadSealImage1') }}
              </div>
              <div class="mt-1 text-xs text-zinc-400">
                {{ t('sys.tenant.assetCenter.sealManagement.uploadSealImage2') }}
              </div>
            </a-form-item>
          </a-collapse-panel>

          <!-- 印章密码 -->
          <a-collapse-panel
            v-if="!isEdit"
            key="3"
            :header="t('sys.tenant.assetCenter.sealManagement.sealPassword')"
          >
            <a-form-item
              :label="t('sys.password')"
              name="password"
              :rules="
                [
                  { required: true, trigger: ['change', 'blur', 'submit'] },
                  useDefaultPassword
                    ? undefined
                    : {
                        validator: () => checkPassword(formState.password),
                        trigger: ['blur', 'change'],
                      },
                ].filter(Boolean)
              "
            >
              <a-input-password
                v-model:value="formState.password"
                :readonly="useDefaultPassword"
                :placeholder="getPasswordPlaceholder()"
                :class="useDefaultPassword ? 'fake-disabled-password-input' : undefined"
              />
            </a-form-item>
            <div class="ml-[80px] select-none">
              <a-checkbox
                v-model:checked="useDefaultPassword"
                @change="handleUseDefaultPasswordChange"
              >
                {{ t('sys.tenant.assetCenter.sealManagement.useDefaultPassword') }}
                {{ orgSetting.initialSealPassword }}
              </a-checkbox>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { SealManagementRequest } from '/@/apis/gct-platform/model';
  import {
    getSealManagementCheckName,
    postSealManagement,
    putSealManagementById,
  } from '/@/apis/gct-platform/SealManagementController';
  import { postFileUploadImage } from '/@/apis/gct-platform/UserController';
  import { SealType, sealTypeOptions, getSealImageUrl } from './util';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { PassRule } from '/@/hooks/platform/types';
  import { isEmpty } from 'lodash-es';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const { orgSetting } = useOrgSetting();
  const { getSecurityConfig } = useRootSetting();

  const activePanel = ref(['1', '2', '3']);
  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const uploading = ref(false);
  const useDefaultPassword = ref(false);
  const nameCache = ref('');

  const formState: Partial<SealManagementRequest> = reactive({
    name: '',
    type: SealType.COMMON,
    sealImage: '',
    password: '',
  });

  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    useDefaultPassword.value = false;
    if (!data) return;
    const { edit, record } = data;
    isEdit.value = !!edit;
    if (isEdit.value) {
      Object.assign(formState, {
        ...record,
      });
      nameCache.value = record.name;
    } else {
      Object.assign(formState, {
        name: '',
        type: SealType.COMMON,
        sealImage: '',
        password: '',
      });
      nameCache.value = '';
    }
  });

  const nameValidator = async (rule, value, callback) => {
    if (!value.trim()) {
      callback();
      return;
    }

    if (nameCache.value && value === nameCache.value) {
      callback();
      return;
    }

    return new Promise((resolve, reject) => {
      getSealManagementCheckName({ name: value })
        .then((isNotExist) => {
          if (isNotExist) {
            resolve(true);
          } else {
            reject(t('sys.tenant.assetCenter.sealManagement.sealNameRepeat'));
          }
        })
        .catch(() => {
          reject(t('sys.tenant.assetCenter.sealManagement.sealNameRepeatError'));
        });
    });
  };

  const beforeUpload = async (file) => {
    const fileSize = file.size / 1024;
    if (fileSize / 1024 > 4) {
      message.error(t('sys.tenant.assetCenter.sealManagement.sealImageSizeLimit'));
      return false;
    }
    return true;
  };

  const handleCustomRequest = async ({ file }) => {
    uploading.value = true;

    const formData: any = new FormData();
    formData.append('file', file);

    const path = await postFileUploadImage(
      formData,
      {
        bucket: 'IMAGE',
      },
      {
        transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
      },
    ).finally(() => {
      uploading.value = false;
    });
    formState.sealImage = `/${path}`;
    formRef.value?.validateFields(['sealImage']);
  };

  const passOptions = ref([
    {
      label: t('sys.number'),
      value: PassRule.NUMBER,
    },
    {
      label: t('sys.lowercase'),
      value: PassRule.LOWERCASE,
    },
    {
      label: t('sys.uppercase'),
      value: PassRule.UPPERCASE,
    },
    {
      label: t('sys.spechars'),
      value: PassRule.SPECHARS,
    },
    {
      label: t('sys.lowercaseAndUppercase'),
      value: 'LOWERCASE_UPPERCASE',
    },
  ]);

  const validatePassRule = (password) => {
    const regexPatterns: RegExp[] = [];
    const rules = getSecurityConfig.value.sealPassRule;
    if (rules?.includes('NUMBER')) {
      regexPatterns.push(/\d/);
    }
    if (rules?.includes('LOWERCASE')) {
      regexPatterns.push(/[a-z]/);
    }
    if (rules?.includes('UPPERCASE')) {
      regexPatterns.push(/[A-Z]/);
    }
    if (rules?.includes('SPECHARS')) {
      regexPatterns.push(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/);
    }
    if (password && regexPatterns.every((pattern) => pattern.test(password))) {
      return true;
    } else {
      return false;
    }
  };

  const getPasswordPlaceholder = () => {
    if (!getSecurityConfig.value.sealEnablePassphrase) {
      return t('sys.passwordErrorTip', {
        len: 6,
        text: t('sys.tenant.assetCenter.sealManagement.invalidTip'),
      });
    }
    const rules = getSecurityConfig.value.sealPassRule;
    if (rules?.length) {
      const lowAndUpperArr: string[] = [PassRule.LOWERCASE, PassRule.UPPERCASE];
      const hasLowAndUpper = lowAndUpperArr.every((e) => rules?.includes(e));
      let passLabels = rules?.map((val: string) => {
        const passItem = passOptions.value.find((item) => {
          if (hasLowAndUpper && lowAndUpperArr.includes(val)) {
            return 'LOWERCASE_UPPERCASE' === item.value;
          }
          return val == item.value;
        });
        return passItem?.label;
      });
      passLabels = [...new Set(passLabels)];
      return getSecurityConfig.value.sealPassMinLength === 16
        ? t('sys.password16ErrorTip', {
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          })
        : t('sys.passwordErrorTip', {
            len: getSecurityConfig.value.sealPassMinLength,
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          });
    } else {
      return t('sys.passLenTip', {
        text: getSecurityConfig.value.sealPassMinLength,
      });
    }
  };

  const checkPassword = (password: any) => {
    if (!password) return Promise.resolve();

    let isValid = false;
    const placeholder = getPasswordPlaceholder();
    if (getSecurityConfig.value.sealEnablePassphrase) {
      isValid = validatePassRule(password);
      if (!isValid) {
        return Promise.reject(placeholder);
      }
      if (
        (getSecurityConfig.value.sealPassMinLength &&
          getSecurityConfig.value.sealPassMinLength > password.length &&
          password) ||
        password.length > 16
      ) {
        return Promise.reject(placeholder);
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(password)) {
        return Promise.reject(placeholder);
      }
    }
    if (isEmpty(password)) {
      return Promise.resolve();
    }

    formRef.value?.clearValidate(['password']);
    return Promise.resolve();
  };

  const handleUseDefaultPasswordChange = (e) => {
    formState.password = e.target.checked ? orgSetting.initialSealPassword : '';
    setTimeout(() => {
      formRef.value?.validate('password');
    }, 1);
  };

  const handleClose = () => {
    isEdit.value = false;
    activePanel.value = ['1', '2', '3'];
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      if (isEdit.value) {
        await putSealManagementById(formState);
        message.success(t('sys.editSuccess'));
      } else {
        await postSealManagement(formState);
        message.success(t('sys.createSuccess2'));
      }
      closeModal();
      emit('ok');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>
<style scoped lang="less">
  .bg-transparent-grid {
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23fff' d='M0 0h10v10H0zM10 10h10v10H10z'/%3E%3Cpath fill='%23EDF2F7' d='M10 0h10v10H10zM0 10h10v10H0z'/%3E%3C/svg%3E");
  }

  .ant-form-item.ant-form-item-has-error .border-dashed {
    border-color: var(--ant-error-color);
  }

  .fake-disabled-password-input,
  :deep(.fake-disabled-password-input .ant-input) {
    color: #c3c3c3 !important;
    background-color: #f7f8fa !important;
    cursor: not-allowed;
  }
  :deep(.ant-collapse-content-box){
    padding-left: 56px;
  }
</style>
