<template>
  <div class="h100%" style=" overflow: hidden auto">
    <div class="flex flex-col items-center pt-40px pb-32px">
      <CropperAvatar
        :uploadApi="uploadApi"
        v-model:value="formState.avatar"
        :showBtn="false"
        width="102"
      />
      <!-- <div class="user-info__account">{{ userStore.getUserInfo.username }}</div>
      <div v-if="userStore.getUserInfo.dept" class="user-info__dept">{{
        userStore.getUserInfo.dept
      }}</div> -->
    </div>
    <a-form ref="formRef" layout="vertical" :model="formState" autocomplete="off">
      <a-row class="mt-20px" :gutter="48">
        <a-col :span="12">
          <a-form-item
            :label="t('sys.fullname')"
            name="fullname"
            :rules="[
              { required: true },
              { validator: validateIsModelName },
              { max: 100, message: t('sys.max100') },
            ]"
          >
            <a-input
              v-model:value="formState.fullname"
              :placeholder="t('sys.inputText')"
            /> </a-form-item
        ></a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.gender')" name="gender">
            <a-radio-group
              v-model:value="formState.gender"
              :options="genderOptions"
            /> </a-form-item
        ></a-col>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.mobile')"
            name="mobile"
            :rules="[
              { required: getOrgRequiredFields?.includes('mobile') },
              {
                validator: () => checkPhone(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <div class="phone-country">
              <VueCountryIntl v-model:value="formState.country" :placeholder="t('sys.inputText')" />
            </div>
            <a-input
              style="width: calc(100% - 84px); border-radius: 0 4px 4px 0"
              v-model:value="formState.mobile"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.email')"
            name="email"
            :rules="[
              { required: getOrgRequiredFields?.includes('email') },
              { type: 'email', message: t('sys.phoneError') },
            ]"
          >
            <a-input v-model:value="formState.email" :placeholder="t('sys.inputText')" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item name="signatureImage" class="flex items-center">
            <span style="margin-right: 10px">{{ t('sys.signatureImage') }}</span>
            <a-radio-group v-model:value="formState.signType" class="ml-2">
              <a-radio :value="signTypeEnum.UPLOAD">
                {{ $t('sys.upload') }}
              </a-radio>
              <a-radio :value="signTypeEnum.WRITE">
                {{ $t('sys.write') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <cropper-free
            v-if="formState.signType === signTypeEnum.UPLOAD"
            :disabled="false"
            :modalTitle="t('sys.upload') + t('sys.signaturePic')"
            :uploadApi="uploadApi"
            v-model:value="formState.signatureImage"
          />
          <div v-if="formState.signType === signTypeEnum.UPLOAD" class="text-[#8F8F8F]">
            {{ t('sys.org.uploadType') }}</div
          >
          <div
            v-else
            class="defult-img flex w200px h120px items-center justify-center cursor-pointer"
            @click="openWacomModal"
          >
            <div
              v-if="!formState.signatureImageWrite"
              class="flex flex-col justify-center items-center color-[#434855] cursor-pointer"
            >
              <i class="iconfont icon-qianming1"></i>

              <span>{{ t('sys.add') }}{{ t('sys.signatureImage') }}</span>
            </div>
            <div v-else>
              <img class="w100% h100%" :src="'/minio/' + formState.signatureImageWrite" />
              <div class="mask">
                <Icon icon="ant-design:edit-outlined" :size="24" color="#ffffff" />
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>

    <div class="absolute right-24px top-19px">
      <a-button type="primary" @click="handleOk">{{ t('sys.saveText') }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance } from 'ant-design-vue';
  import { CropperFree, CropperAvatar } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { useUserStore } from '/@/store/modules/user';
  import { getUserInfo, postUserSettings } from '/@/apis/gct-platform/UserController';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { UserSettingsDTO } from '/@/apis/gct-platform/model';
  // import UserCenterLayout from '../component/user-center-layout.vue';
  import { VueCountryIntl } from '/@/components/VueCountryIntl';
  import { validateIsModelName } from '/@/utils/validate';
  import { metadata, PhoneNumberUtil } from 'google-libphonenumber';
  import WacomModal from '../component/wacom-modal.vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import Icon from '@/components/Icon/Icon.vue';

  import { useModal } from '/@/components/Modal';

  const { t } = useI18n();
  const userStore = useUserStore();
  const formRef = ref<FormInstance>();
  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const {
    getOrgInitialPassword,
    getOrgRequiredFields,
    getOrgExtFields,
    getSecurityConfig,
    getOrgInitialSignPassword,
  } = useRootSetting();
  const genderOptions = [
    {
      value: 1,
      label: t('sys.male'),
    },
    {
      value: 0,
      label: t('sys.female'),
    },
  ];

  const signTypeEnum = {
    UPLOAD: 'UPLOAD',
    WRITE: 'WRITE',
  };
  const formState = reactive<UserSettingsDTO>({
    avatar: userStore.getUserInfo.avatar,
    fullname: userStore.getUserInfo.fullname,
    mobile: userStore.getUserInfo.mobile,
    email: userStore.getUserInfo.email,
    signatureImage: userStore.getUserInfo.signatureImage,
    signatureImageWrite: userStore.getUserInfo.signatureImageWrite,
    country: userStore.getUserInfo.country || '+86',
    gender: userStore.getUserInfo.gender,
    signType: userStore.getUserInfo.signType || 'UPLOAD',
  });

  const phoneUtil = PhoneNumberUtil.getInstance();
  onMounted(() => {
    getUserInfo().then((res) => {
      if (res) {
        Object.assign(formState, {
          ...res,
          country: res.country || '+86',
          signType: res.signType || 'UPLOAD',
        });
      }
    });
  });
  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      await postUserSettings({
        ...formState,
      });
      createMessage.success(t('sys.saveSuccess'));
      userStore.setSomeUserInfo(formState);
    });
  };

  const openWacomModal = async () => {
    const res = await gct.openUtil.modal(
      WacomModal,
      {
        resetText: $t('sys.developer.appCenter.clear'),
        style: 'z-index: 9',
        widget: { style: { width: '530', height: '312' } },
        url: formState.signatureImageWrite ? '/minio/' + formState.signatureImageWrite : '',
        username: formState.fullname,
      },
      {
        title: $t('sys.pleaseSign'),
        width: '640px',
        height: '500px',
        showFooter: false,
        canFullscreen: false,
      },
    );
    if (res && res.ok) {
      formState.signatureImageWrite = res.params.url;
    }
  };

  const checkPhone = () => {
    if (!formState.mobile) {
      return Promise.resolve();
    }
    if (
      !Number.isFinite(+formState.mobile) ||
      formState.mobile.length === 1 ||
      formState.mobile.length >= 17
    ) {
      return Promise.reject(t('sys.phoneError'));
    }

    if (!metadata.countryCodeToRegionCodeMap[+formState.country?.replace('+', '')]) {
      return Promise.resolve();
    }
    const number = phoneUtil.parseAndKeepRawInput(
      formState.mobile,
      metadata.countryCodeToRegionCodeMap[+formState.country?.replace('+', '')][0],
    );
    const isValite = phoneUtil.isValidNumber(number);

    if (!isValite) {
      return Promise.reject(t('sys.phoneError'));
    }
    return Promise.resolve();
  };
</script>

<style lang="less" scoped>
  .user-info {
    &__account {
      margin-top: 10px;
      color: #333;
      font-size: 20px;
      font-weight: 500;
    }

    &__dept {
      margin-top: 10px;
      color: #7f8695;
      font-size: 14px;
    }
  }

  .title {
    display: flex;
    flex: none;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
    font-size: 16px;
    font-weight: 500;

    &::before {
      content: '';
      width: 4px;
      height: 13px;
      margin-right: 8px;
      border-radius: 2px;
      background-color: var(--ant-primary-color);
    }
  }

  .phone-country {
    display: inline-block;
    width: 68px;
    height: 31.6px;
  }

  :deep(.vue-country-intl-inputer .country-intl-input) {
    height: 31.6px;
  }

  :deep(.vue-country-intl-inputer .country-intl-label) {
    padding: 4px 10px;

    span {
      vertical-align: top;
    }
  }

  .defult-img {
    position: absolute;
    z-index: 2;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    background: #fafafa;
  }

  .mask {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition: all 0.3s;
    border-radius: 4px;
    opacity: 0;
    background: rgb(0 0 0 / 40%);

    .anticon {
      margin-right: 20px;
    }

    .anticon:last-child {
      margin-right: 0;
    }

    &:hover {
      opacity: 40;
    }
  }
</style>
