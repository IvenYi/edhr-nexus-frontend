<template>
  <div class="login-activate pl-40px pr-40px">
    <h2 class="text-24px pt-45px font-bold enter-x">
      {{ t('sys.activateTitle') }}
    </h2>
    <div class="flex flex-none items-center pr-36px pb-30px tab">
      <div
        :class="{
          'change-env-item': true,
          'change-env-item-active': authorizationType === authorizationTypeEnum.Online,
        }"
        @click="changeAppEnv(authorizationTypeEnum.Online)"
      >
        {{ t('sys.license.online') }}
      </div>
      <a-divider type="vertical" />
      <div
        :class="{
          'change-env-item': true,
          'change-env-item-active': authorizationType === authorizationTypeEnum.Offline,
        }"
        @click="changeAppEnv(authorizationTypeEnum.Offline)"
      >
        {{ t('sys.license.offline') }}
      </div>
    </div>
    <div v-if="authorizationType === authorizationTypeEnum.Online">
      <h2 class="text-16px mb-32px font-bold enter-x color-primary">
        {{ t('sys.inputLicense') }}
      </h2>

      <Form
        class="enter-x"
        :model="formData"
        :rules="rules"
        ref="formRef"
        @keypress.enter="handleActivate"
      >
        <FormItem name="authorizationCode" class="enter-x">
          <Input
            size="large"
            v-model:value.trim="formData.authorizationCode"
            :placeholder="t('sys.licensePlaceholder')"
            class="fix-auto-fill"
          />
        </FormItem>
        <FormItem class="enter-x">
          <Button
            class="login-btn mb-0"
            type="primary"
            size="large"
            block
            @click="handleActivate"
            :loading="loading"
          >
            {{ t('sys.activate') }}
          </Button>
        </FormItem>
      </Form>
    </div>
    <div v-else>
      <offline-activate @reload="reload" />
    </div>

    <div class="login-activate-footer">
      <div class="download mb-10px">
        <span>{{ t('sys.recommended') }}</span>
        <a class="browser" href="https://www.google.cn/chrome/">{{ t('sys.googleBrowser') }}</a>
      </div>
      <div class="version mb-10px">{{ t('sys.platformVersion') + getPlatfromVersion }}</div>
      <div class="copyright mb-16px" v-html="copyright"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, watch } from 'vue';
  import { Form, Input, Button, message } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';
  import { useFormValid } from '../useLogin';
  import { getLicenseActivate } from '/@/apis/gct-platform/LicenseController';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import { authorizationTypeEnum } from '../constant/interface';
  import OfflineActivate from './offline-activate.vue';

  const emit = defineEmits(['reload']);

  const FormItem = Form.Item;
  const { t } = useI18n();

  const copyright = ref();
  const { getPlatfromVersion, getPlatformCopyright } = useRootSetting();

  const formRef = ref();

  /** 授权方式 */
  const authorizationType = ref<string>(authorizationTypeEnum.Online);

  const rules: Record<string, Rule[]> = {
    authorizationCode: [{ required: true, message: t('sys.licensePlaceholder'), trigger: 'blur' }],
  };

  const { basicSetting } = useBasicSetting();

  const loading = ref(false);

  const formData = reactive({
    authorizationCode: '',
    suiteKey: 'PLATFORM',
    version: basicSetting.version,
    increment: true,
  });

  const { validForm } = useFormValid(formRef);

  const handleActivate = async () => {
    const data = await validForm();
    if (!data) return;
    const params = formData;
    getLicenseActivate(params).then(() => {
      message.success(t('sys.activateSuccess'));
      emit('reload');
    });
  };
  watch(
    getPlatformCopyright,
    (value) => {
      if (value && value.includes('<span class="ownInput">${当前年份}</span>')) {
        copyright.value = value.replaceAll(
          '<span class="ownInput">${当前年份}</span>',
          new Date().getFullYear(),
        );
      } else {
        copyright.value = value;
      }
    },
    { immediate: true },
  );
  const reload = () => {
    emit('reload');
  };
  const changeAppEnv = (type) => {
    authorizationType.value = type;
  };
</script>

<style lang="less" scoped>
  @primary-theme-color: var(--ant-primary-color);
  .color-primary {
    color: @primary-theme-color;
  }
  .login-activate {
    position: relative;
    height: 100%;

    .login-activate-footer {
      position: absolute;
      bottom: 0;
      width: calc(100% - 80px);
      text-align: center;

      .browser {
        color: @primary-theme-color;
      }
    }
  }

  .change-env-item {
    font-weight: 400;
    font-size: 14px;
    color: #797a7d;
    padding: 0 12px;
    cursor: pointer;

    &:first-child {
      padding-left: 0;
    }

    &-active {
      color: var(--ant-primary-color);
    }
  }
  .tab {
    margin-top: 6%;
  }
</style>
