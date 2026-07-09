<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${t(`sys.platform.${mode?.label}`)}${t('sys.config')}`"
    centered
    width="640px"
    :minHeight="40"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <template v-if="mode.type && mode.value !== LoginTypeEnum.CARD">
        <a-form-item
          :label="`${t(`sys.platform.${mode?.label}`)}${t('sys.model.refField')}`"
          name="relationField"
          :rules="[{ required: true }]"
        >
          <a-select
            v-model:value="formState.relationField"
            :placeholder="t('sys.pleaseSelectSth')"
            showSearch
            :filter-option="filterOption"
            style="width: 70%"
            :options="orgRelationFields"
          />
        </a-form-item>
      </template>

      <template v-else>
        <template v-if="mode.value !== LoginTypeEnum.ACCOUNT && mode.value !== LoginTypeEnum.CARD">
          <a-form-item
            :label="`${t(`sys.platform.${mode.label}`)}${t('sys.platform.serviceAddress')}`"
            name="address"
            :rules="[{ required: true }, maxValidate]"
          >
            <a-input
              v-model:value="formState.address"
              :placeholder="t('sys.pleaseInputSth')"
              style="width: 70%"
            />
          </a-form-item>
        </template>

        <template v-if="mode.value === LoginTypeEnum.DOMAIN_ACCOUNT">
          <a-form-item
            name="host"
            :label="t('sys.component.dataConnection.host')"
            :rules="[{ required: true }]"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="formState.host"
              :min="0"
              :max="65535"
              :placeholder="t('sys.pleaseInputSth')"
              style="width: 70% !important"
            />
          </a-form-item>
          <a-form-item
            name="domainSuffix"
            :label="t('sys.platform.domainAfter')"
            :rules="[{ required: true }, maxValidate]"
          >
            <a-input
              v-model:value="formState.domainSuffix"
              :placeholder="t('sys.pleaseInputSth')"
              style="width: 70%"
            />
          </a-form-item>
          <a-form-item :label="t('sys.platform.supportLoginFields')" name="domainSuffix">
            <a-select
              v-model:value="formState.relationField"
              style="width: 70%"
              :placeholder="t('sys.pleaseSelectSth')"
              showSearch
              :filter-option="filterOption"
              :options="userLoginFieldOptions"
              @change="loginFieldChange"
            />
          </a-form-item>
          <a-form-item name="boolLdaps" :label="t('sys.platform.securityType')">
            <a-checkbox
              v-model:checked="formState.boolLdaps"
              class="mt4px"
              @change="changeBoolLdaps"
            >
              {{ t('sys.platform.sslSecurity') }}
            </a-checkbox>

            <a-upload
              v-if="formState.boolLdaps"
              :file-list="fileList"
              class="certificate-upload ml8px"
              accept=".cer"
              :max-count="1"
              :beforeUpload="handleBeforeUpload"
              :customRequest="uploadLogo"
              @remove="handleRemove"
            >
              <a class="required"> 上传证书 </a>
              <a-tooltip color="#ffffff">
                <template #title>
                  <div style="color: #1a1d23">
                    请上传有效期不小于30天的证书。目前只支持PEM格式，其他格式请进行
                    <a class="transform-text" @click="toTransform">格式转化</a>
                  </div>
                </template>
                <QuestionCircleOutlined style="color: #8b8b8b" />
              </a-tooltip>
            </a-upload>
            <div v-if="needCert" class="ant-form-item-explain-error"> 请上传证书 </div>
          </a-form-item>
        </template>

        <template v-if="mode.value == LoginTypeEnum.CARD">
          <a-form-item :label="t('sys.platform.supportLoginFields')" name="relationField">
            <a-select
              v-model:value="formState.relationField"
              style="width: 70%"
              :placeholder="t('sys.pleaseSelectSth')"
              showSearch
              :filter-option="filterOption"
              :options="userLoginFieldOptions"
              @change="loginFieldChange"
            />
          </a-form-item>
        </template>

        <a-form-item name="boolDefaultLoginMethod" :label="t('sys.SignType')">
          <a-checkbox v-model:checked="formState.boolDefaultLoginMethod" :disabled="mode.isCurrent">
            {{ t('sys.platform.setDefaultLoginMethod') }}
          </a-checkbox>
        </a-form-item>
      </template>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { FormInstance, message } from 'ant-design-vue';
  import { reactive, ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  import { LoginTypeEnum, SystemLoginKeys, OtherLoginKeys } from '/@/hooks/platform/constants';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postLdapUploadCertificate } from '/@/apis/gct-platform/LdapController';
  import { cloneDeep } from 'lodash-es';
  import { maxValidate } from '/@/utils/validate';

  const emit = defineEmits(['change']);

  const { orgSetting } = useOrgSetting();

  const { loginModeConfig, loginSetting, loginModeAuthTypes, openIDOAuthAuthTypes } =
    useLoginSetting();
  const { t } = useI18n();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const formRef = ref<FormInstance>();
  const mode = reactive({
    label: '',
    value: '',
    icon: '',
    isCurrent: false,
    type: '',
  });
  const formState = reactive({
    relationField: 'username_',
    address: '',
    domainSuffix: '',
    authType: '',
    boolLdaps: false,
    certificate: '',
    boolDefaultLoginMethod: false,
    host: '',
    relationFieldName: '',
  });
  const needCert = ref(false);
  const isRelationFieldNotExist = ref(false);
  const relationFields = ref([
    {
      label: t('sys.userName'),
      value: 'username_',
    },
    {
      label: t('sys.empNo'),
      value: 'emp_no_',
    },
    {
      label: t('sys.mobile'),
      value: 'mobile_',
    },
  ]);

  const fileList = ref<any>([]);

  const orgRelationFields = ref([]);
  // 获取扩展的字段拼接到用户登录字段
  const userLoginFieldOptions = computed(() => {
    const extendsFields = (orgSetting?.orgExtFieldConfigs ?? []).map((item: any) => {
      return {
        label: item.fieldName,
        value: item.relationField + '_',
      };
    });
    const filter = [...relationFields.value, ...extendsFields].filter((i) => {
      return i.value === formState.relationField;
    });
    if (!filter.length) {
      isRelationFieldNotExist.value = true;
      formState.relationField = formState.relationFieldName;
    } else {
      formState.relationFieldName = filter[0].label;
    }
    return [...relationFields.value, ...extendsFields];
  });

  /** 地址处理 */
  function splitAtLastColon(str) {
    const lastColonIndex = str.lastIndexOf(':');
    if (lastColonIndex === -1) {
      return { before: str, after: '' };
    }
    return {
      before: str.substring(0, lastColonIndex),
      after: str.substring(lastColonIndex + 1),
    };
  }

  const toTransform = () => {
    window.open('https://myssl.com/cert_convert.html', '_blank');
  };

  const onDeactivated = (data) => {
    const { label, icon, value, type } = data;
    if (type === 'org') {
      const _relationFields = cloneDeep(relationFields.value);
      const extFieldConfigs = orgSetting.extFieldConfigs
        .map((n) => {
          return {
            value: n.relationField,
            label: n.fieldName,
            type: n.type,
          };
        })
        .filter((i) => {
          return i.type;
        });

      orgRelationFields.value = [..._relationFields, ...extFieldConfigs];
    }
    mode.type = type || '';
    mode.value = value;
    mode.label = label;
    mode.icon = icon;
    formState.address = data.address ? splitAtLastColon(data.address).before : '';
    formState.host = data.address ? splitAtLastColon(data.address).after : '';
    formState.certificate = data.certificate;
    formState.relationField = data.relationField ? data.relationField : 'username_';
    if (data.domainSuffix) {
      formState.domainSuffix = data.domainSuffix;
    }
    if (value === LoginTypeEnum.DOMAIN_ACCOUNT) {
      formState.boolLdaps = Boolean(data.ldaps);

      if (data.certificate) {
        fileList.value.push({
          status: 'done',
          url: data.certificate,
          name: data.certificate,
        });
      }
    }

    formState.boolDefaultLoginMethod = data.defaultAuthType === value;
    mode.isCurrent = data.isCurrent;
    formState.relationFieldName = data.relationFieldName;
  };

  //上传图片
  const handleBeforeUpload = async (file) => {
    const fileType = ['application/x-x509-ca-cert'];
    if (!fileType.includes(file.type)) {
      message.error(`【${file.name}】支持的扩展名为.cer`);
      return false;
    }

    return true;
  };

  const handleRemove = () => {
    fileList.value = [];
    formState.certificate = '';
    formRef.value?.validate(['certificate']);
  };

  const uploadLogo = async (data) => {
    let formData: any = new FormData();
    formData.append('file', data.file);
    data.onProgress();
    const res: any = await postLdapUploadCertificate(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });

    formState.certificate = res;
    needCert.value = false;
    fileList.value = [
      {
        status: 'done',
        url: res,
        name: res,
      },
    ];
    formRef.value?.clearValidate(['certificate']);
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    fileList.value = [];
    closeModal();
    needCert.value = false;
  };
  const changeBoolLdaps = (event) => {
    needCert.value = false;
  };

  const handleOk = async () => {
    if (formState.boolLdaps && !fileList.value.length && mode.value === 'DOMAIN_ACCOUNT') {
      needCert.value = true;
    }
    formRef.value?.validate().then(async () => {
      if (needCert.value) {
        return;
      }
      if (mode.type === 'org') {
        emit('change', { appType: mode.label, relationField: formState.relationField });
      } else if (loginModeConfig && loginModeConfig.get(mode.value) && mode.value) {
        if (mode.value !== LoginTypeEnum.ACCOUNT) {
          loginModeConfig.get(mode.value).address = formState.address + ':' + formState.host;
          if (!isRelationFieldNotExist.value) {
            loginModeConfig.get(mode.value).relationField = formState.relationField;
            loginModeConfig.get(mode.value).relationFieldName = formState.relationFieldName;
          }
        }

        if (loginModeConfig.get(mode.value).authType === LoginTypeEnum.DOMAIN_ACCOUNT) {
          loginModeConfig.get(mode.value).domainSuffix = formState.domainSuffix;
          loginModeConfig.get(mode.value).ldaps = Number(formState.boolLdaps);
          loginModeConfig.get(mode.value).certificate = formState.certificate;
        }

        if (formState.boolDefaultLoginMethod && !mode.isCurrent) {
          loginSetting.defaultAuthType = mode.value;
          if (
            SystemLoginKeys.includes(mode.value) &&
            !loginModeAuthTypes.value.includes(mode.value)
          ) {
            loginModeAuthTypes.value.push(mode.value);
          } else if (
            OtherLoginKeys.includes(mode.value) &&
            !openIDOAuthAuthTypes.value.includes(mode.value)
          ) {
            openIDOAuthAuthTypes.value.push(mode.value);
          }
        }
      }
      isRelationFieldNotExist.value = false;
      needCert.value = false;
      closeModal();
    });
  };

  const loginFieldChange = (value, option) => {
    isRelationFieldNotExist.value = false;
    formState.relationFieldName = option.label;
  };

  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
  };
</script>

<style lang="less" scoped>
  .certificate-upload {
    :deep(.ant-upload-list-item) {
      margin-top: 0;
    }
  }

  .required::before {
    content: '*';
    display: inline-block;
    color: #ff4d4f;
    font-family: SimSun, sans-serif;
    font-size: 14px;
    line-height: 1;
  }

  .transform-text {
    &:hover {
      text-decoration: underline;
    }
  }

  :deep(.ant-upload-list-text-container) {
    width: 70%;
    margin-top: 4px;
    padding: 8px 0;
    border-radius: 4px;
    background: #f6fafd;

    .ant-upload-text-icon {
      display: none;
    }

    .ant-upload-list-item-name {
      color: #474747;

      &:hover {
        color: var(--ant-primary-color);
      }
    }
  }

  :deep(.ant-upload-list-item:hover .ant-upload-list-item-info) {
    background: #f6fafd;
  }
</style>
