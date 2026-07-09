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
    <template #footer v-if="isReadonly"> </template>
    <div class="info-box">
      <cropper-avatar
        :uploadApi="uploadApi"
        v-model:value="formState.avatar"
        :showBtn="false"
        width="80"
        :class="['ml-20px', 'mr-20px', { 'is-readonly': isReadonly }]"
      />
      <a-descriptions>
        <a-descriptions-item :label="t('sys.fullname')">{{
          formState.fullname
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.mobile')">{{ formState.mobile }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.userName')">{{
          formState.username
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.empNo')">{{ formState.empNo }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.registerTime')">{{
          formState.createTime
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.email')">{{ formState.email }}</a-descriptions-item>
      </a-descriptions>
    </div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <div class="header">
        <div class="title">{{ t('sys.org.userInfo') }}</div>
      </div>
      <a-row>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.fullname')"
            name="fullname"
            :rules="[{ required: !isReadonly }, { validator: validateIsModelName }]"
          >
            <span v-if="isReadonly">{{ formState.fullname }}</span>
            <a-input
              v-else
              v-model:value="formState.fullname"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.fullname'),
                })
              "
              :maxlength="32"
              show-count
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.empNo')"
            name="empNo"
            :rules="[
              { required: !isReadonly && getOrgRequiredFields?.includes('empNo') },
              { validator: validateIsModelName },
            ]"
          >
            <span v-if="isReadonly">{{ formState.empNo }}</span>
            <a-input
              v-else
              v-model:value="formState.empNo"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.empNo'),
                })
              "
              :maxlength="32"
              show-count
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.birthday')" name="birthday">
            <span v-if="isReadonly">{{ formState.birthday }}</span>
            <a-date-picker
              v-else
              v-model:value="formState.birthday"
              style="width: 100%"
              valueFormat="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.gender')" name="gender">
            <span v-if="isReadonly">{{ genderName }}</span>
            <a-select
              v-else
              v-model:value="formState.gender"
              :placeholder="
                t('sys.pleaseSelectSth', {
                  sth: t('sys.gender'),
                })
              "
            >
              <a-select-option v-for="options of genderOptions" :key="options.key">
                {{ options.value }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <div class="header">
        <div class="title">{{ t('sys.userNameInfo') }}</div>
      </div>
      <a-row>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.userName')"
            name="username"
            :rules="[{ required: !isReadonly }, { validator: validateIsModelName }]"
          >
            <span v-if="isReadonly">{{ formState.username }}</span>
            <a-input
              v-else
              v-model:value="formState.username"
              :disabled="isEdit"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.userName'),
                })
              "
              :maxlength="32"
              :show-count="isCreate"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.mobile')"
            name="mobile"
            :rules="[{ required: !isReadonly && getOrgRequiredFields?.includes('mobile') }]"
          >
            <span v-if="isReadonly">
              {{ formState.mobile ? formState.country + formState.mobile : '' }}
            </span>
            <div v-if="!isReadonly" class="phone-country">
              <VueCountryIntl v-model:value="formState.country" />
            </div>
            <a-input
              v-if="!isReadonly"
              v-model:value="formState.mobile"
              style="width: calc(100% - 84px); border-radius: 0 4px 4px 0"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.mobile'),
                })
              "
              :maxlength="11"
              show-count
            />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="isCreate">
          <a-form-item
            :label="t('sys.password')"
            name="password"
            :rules="[
              { required: true },
              { validator: checkPassword, trigger: 'change' },
              { pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/, message: t('sys.passwordFormatError') },
            ]"
          >
            <a-input-password
              v-model:value="formState.password"
              :disabled="useDefaultPwd"
              autocomplete="new-password"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.password'),
                })
              "
            />
            <a-form-item-rest
              ><a-checkbox v-model:checked="useDefaultPwd">{{
                t('sys.org.intialPassword', { intialPassword: getOrgInitialPassword })
              }}</a-checkbox></a-form-item-rest
            >
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="isCreate">
          <a-form-item
            :label="t('sys.confirmPassword')"
            name="confirmPassword"
            :rules="[
              { required: true },
              { validator: checkPassword, trigger: 'change' },
              { pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/, message: t('sys.passwordFormatError') },
            ]"
          >
            <a-input-password
              v-model:value="formState.confirmPassword"
              :disabled="useDefaultPwd"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.confirmPassword'),
                })
              "
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.telephone')" name="telephone">
            <span v-if="isReadonly">{{ formState.telephone }}</span>
            <a-input
              v-else
              v-model:value="formState.telephone"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.telephone'),
                })
              "
              :maxlength="32"
              show-count
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.email')"
            name="email"
            :rules="[
              { type: 'email' },
              { required: !isReadonly && getOrgRequiredFields?.includes('email') },
            ]"
          >
            <span v-if="isReadonly">{{ formState.email }}</span>
            <a-input
              v-else
              v-model:value="formState.email"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.email'),
                })
              "
              :maxlength="32"
              show-count
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.signatureImage')" name="signatureImage">
            <cropper-free
              :disabled="isReadonly"
              :uploadApi="uploadApi"
              v-model:value="formState.signatureImage"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="!inEDHRApp && isReadonly" :span="12">
          <a-form-item :label="t('sys.userIdentification')" name="userIdentification">
            <a-tag v-if="formState.platSeat" :bordered="false" color="success">
              {{ t('sys.org.plat') }}
            </a-tag>
            <a-tag v-if="formState.suiteSeat" :bordered="false" color="processing">
              {{ t('sys.org.kit') }}
            </a-tag>
          </a-form-item>
        </a-col>
      </a-row>
      <div class="header" v-if="isShowOrgExtFields">
        <div class="title">{{ t('sys.otherInfo') }}</div>
      </div>
      <a-row v-if="isShowOrgExtFields">
        <a-col v-for="field in getOrgExtFields" :key="field.id" :span="12">
          <a-form-item
            :label="field.fieldName"
            :name="field.relationField!"
            :rules="[
              { required: field.required === 1 },
              {
                validator: validateNUM(formState[field.relationField!], field.relationField!),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <span v-if="isReadonly">{{ formState[field.relationField!] }}</span>
            <template v-else>
              <a-input
                v-if="!field.encrypted"
                v-model:value="formState[field.relationField!]"
                :placeholder="
                  t('sys.pleaseInputSth', {
                    sth: field.fieldName,
                  })
                "
                :maxlength="32"
                show-count
              />
              <a-input-password
                v-else
                v-model:value="formState[field.relationField!]"
                :placeholder="t('sys.inputText')"
                autocomplete="new-password"
              />
            </template>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </BasicModal>
</template>
<script setup lang="ts" name="user-modal">
  import { ref, reactive, watch, toRaw, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CropperAvatar, CropperFree } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { isEmpty, omit } from 'lodash-es';
  import { VueCountryIntl } from '/@/components/VueCountryIntl';

  import { UserDto } from '/@/components/UserCmp/types/index.d';
  import { validateIsModelName } from '/@/utils/validate';

  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  interface IModalData {
    /** 弹框标题 */
    title: string;
    /** 弹框类型 */
    type: 'create' | 'edit' | 'readonly';
    /** 详情信息 */
    info?: UserDto;
  }

  const { t } = useI18n();

  const genderOptions = [
    {
      key: -1,
      value: t('sys.keepSecret'),
    },
    {
      key: 0,
      value: t('sys.female'),
    },
    {
      key: 1,
      value: t('sys.male'),
    },
  ];

  const { sha256 } = useSHA256();

  const { getOrgInitialPassword, getOrgRequiredFields, getOrgExtFields } = useRootSetting();

  // 获取默认头像
  const globSetting = useGlobSetting();

  const emit = defineEmits(['ok', 'register']);

  const title = ref<string>('');
  const type = ref<'create' | 'edit' | 'readonly'>('create');

  const useDefaultPwd = ref<boolean>(false);

  const formRef = ref<FormInstance>();

  const initData: UserDto = {
    id: undefined,
    avatar: globSetting.defaultAvatar,
    fullname: '',
    empNo: '',
    birthday: '',
    gender: -1,
    username: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    email: '',
    createTime: '',
    suiteSeat: true,
    platSeat: true,
    country: '+86',
  };

  const formState = reactive<UserDto>(Object.assign({}, initData));

  const isCreate = computed<boolean>(() => type.value === 'create');

  const isEdit = computed<boolean>(() => type.value === 'edit');

  const isReadonly = computed<boolean>(() => type.value === 'readonly');

  const genderName = computed(() => {
    return genderOptions.find((opt) => opt.key === formState.gender)?.value;
  });

  const isShowOrgExtFields = computed(() => {
    return getOrgExtFields.value && getOrgExtFields.value.length > 0;
  });

  watch(useDefaultPwd, (val) => {
    if (val) {
      formState.password = getOrgInitialPassword.value ?? '';
      formState.confirmPassword = getOrgInitialPassword.value ?? '';
      formRef.value?.clearValidate(['password', 'confirmPassword']);
    } else {
      formState.password = '';
      formState.confirmPassword = '';
    }
  });

  // 打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data: IModalData) => {
    if (data) {
      title.value = data.title;
      type.value = data.type;
      if (data.info) {
        onDataReceive(data.info);
      } else {
        const seat = {
          suiteSeat: true,
          platSeat: true,
        };
        getOrgExtFields.value?.forEach((field) => {
          formState[field.relationField!] = '';
        });
        onDataReceive(seat);
      }
    }
  });

  const onDataReceive = (data) => {
    Object.assign(formState, {
      ...omit(data, ['userOrgList', 'userId']),
      id: data.userId,
    });
  };

  const checkPassword = () => {
    const password = formState.password;
    const confirmPassword = formState.confirmPassword;
    if (isEmpty(password) || isEmpty(confirmPassword)) {
      return Promise.resolve();
    }
    if (password !== confirmPassword) {
      return Promise.reject(t('sys.portal.passwordNotSame'));
    }
    // 报红是antd方法类型定义的问题
    formRef.value?.clearValidate(['password', 'confirmPassword']);
    return Promise.resolve();
  };

  // 弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    console.warn('visible:', visible);
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    Object.assign(formState, initData);
    useDefaultPwd.value = false;
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const pwdParams = {};
      //有密码时需要加密
      if (formState.password) {
        const key = Math.random().toString(16).substring(2, 8);
        Object.assign(pwdParams, {
          password: sha256(formState.password, key),
          confirmPassword: sha256(formState.confirmPassword, key),
        });
      }
      emit('ok', {
        info: {
          ...omit(toRaw(formState), ['password', 'confirmPassword']),
          ...pwdParams,
        },
        type: type.value,
        callback: closeModal,
      });
    });
  };

  const validateNUM = (value: string, field: string) => {
    return async () => {
      const reg = /^[0-9]*$/;
      if (['ext5', 'ext6', 'ext7', 'ext8', 'ext9'].includes(field) && value && !reg.test(value)) {
        return Promise.reject(t('sys.numberPlaceholder'));
      }
      return Promise.resolve();
    };
  };
</script>
<style scoped lang="less">
  .header {
    display: flex;
    align-items: center;
    margin: 10px 0;
    // margin-bottom: 10px;
    padding: 5px 16px;
    background-color: #f5f5f5;

    .title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: bold;

      &::before {
        content: ' ';
        height: 12px;
        padding-right: 6px;
        border-left: 3px solid var(--ant-primary-color);
      }
    }
  }

  .info-box {
    display: flex;
    align-items: center;

    .is-readonly {
      pointer-events: none;
    }
  }

  .info-box:deep(.ant-descriptions-row:last-child > td) {
    padding-bottom: 0;
  }

  .phone-country {
    display: inline-block;
    width: 84px;
    margin-right: -1px;
  }

  :deep(.vue-country-intl-inputer .country-intl-input) {
    height: 31.6px;
  }

  :deep(.vue-country-intl-inputer .country-intl-label) {
    padding: 4px 8px;

    span {
      vertical-align: top;
    }
  }
</style>
