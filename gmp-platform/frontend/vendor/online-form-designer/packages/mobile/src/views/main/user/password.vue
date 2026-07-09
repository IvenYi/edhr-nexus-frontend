<template>
  <div>
    <van-tabs v-model:active="active" v-if="securitySettingConfig.enableSignPassword">
      <van-tab :title="$t('sys.platform.loginPassword')">
        <van-form class="mt60px" ref="form" label-align="top">
          <van-field
            v-no-copy-paste
            required
            v-model="formData.oldPassword"
            name="oldPassword"
            :label="$t('sys.platform.currentLoginPassword')"
            :type="passsWordIsVisible.oldPassword ? 'text' : 'password'"
            :placeholder="$t('sys.inputText') + $t('sys.platform.currentLoginPassword')"
            :rules="[
              {
                required: true,
                message: $t('sys.inputText') + $t('sys.platform.currentLoginPassword'),
                trigger: ['onChange', 'onBlur'],
              },
            ]"
          >
            <template #right-icon>
              <i
                v-if="passsWordIsVisible.oldPassword"
                class="iconfont icon-chakan1"
                @click="updatePasssWordIsVisible('oldPassword')"
              ></i>
              <i
                v-else
                class="iconfont icon-a-baomi1"
                @click="updatePasssWordIsVisible('oldPassword')"
              ></i>
            </template>
          </van-field>
          <van-field
            v-no-copy-paste
            v-model="formData.newPassword"
            required
            :type="passsWordIsVisible.newPassword ? 'text' : 'password'"
            name="newPassword"
            :label="$t('sys.platform.newLoginPassword')"
            :placeholder="$t('sys.inputText') + $t('sys.platform.newLoginPassword')"
            :rules="[
              {
                required: true,
                message: $t('sys.inputText') + $t('sys.platform.newLoginPassword'),
                trigger: ['onChange', 'onBlur'],
              },
              {
                validator: () => rulevalidator('newPassword', formData.newPassword),
                trigger: ['onChange', 'onBlur'],
              },
            ]"
          >
            <template #right-icon>
              <i
                v-if="passsWordIsVisible.newPassword"
                class="iconfont icon-chakan1"
                @click="updatePasssWordIsVisible('newPassword')"
              ></i>
              <i
                v-else
                class="iconfont icon-a-baomi1"
                @click="updatePasssWordIsVisible('newPassword')"
              ></i>
            </template>
          </van-field>
          <van-field
            v-no-copy-paste
            required
            v-model="formData.confirm"
            :type="passsWordIsVisible.confirm ? 'text' : 'password'"
            name="confirm"
            :label="$t('sys.platform.confirmLoginPassword')"
            :placeholder="$t('sys.inputText') + $t('sys.platform.confirmLoginPassword')"
            :rules="[
              {
                required: true,
                message: $t('sys.inputText') + $t('sys.platform.confirmLoginPassword'),
                trigger: ['onChange', 'onBlur'],
              },
              {
                validator: () => rulevalidator('confirm', formData.confirm),
                trigger: ['onChange', 'onBlur'],
              },
            ]"
          >
            <template #right-icon>
              <i
                v-if="passsWordIsVisible.confirm"
                class="iconfont icon-chakan1"
                @click="updatePasssWordIsVisible('confirm')"
              ></i>
              <i
                v-else
                class="iconfont icon-a-baomi1"
                @click="updatePasssWordIsVisible('confirm')"
              ></i>
            </template>
          </van-field>
        </van-form>
        <div class="pb40px mt20px pl30px pr30px">
          <van-button
            @click="onSubmit"
            block
            type="primary"
            native-type="submit"
            :disabled="disabled"
            :loading="loading"
            >保 存</van-button
          >
        </div>
      </van-tab>
      <van-tab :title="$t('sys.platform.signaturePassword')">
        <van-form class="mt60px" ref="signForm" label-align="top">
          <van-field
            v-no-copy-paste
            required
            v-model="signFormData.oldPassword"
            name="oldPassword"
            :label="$t('sys.platform.currentSignPassword')"
            :placeholder="$t('sys.inputText') + $t('sys.platform.currentSignPassword')"
            :type="passsWordIsVisible.oldSignPassword ? 'text' : 'password'"
            :rules="[
              {
                required: true,
                message: $t('sys.inputText') + $t('sys.platform.currentSignPassword'),
                trigger: ['onChange', 'onBlur'],
              },
            ]"
          >
            <template #right-icon>
              <i
                v-if="passsWordIsVisible.oldSignPassword"
                class="iconfont icon-chakan1"
                @click="updatePasssWordIsVisible('oldSignPassword')"
              ></i>
              <i
                v-else
                class="iconfont icon-a-baomi1"
                @click="updatePasssWordIsVisible('oldSignPassword')"
              ></i>
            </template>
          </van-field>
          <van-field
            v-no-copy-paste
            required
            v-model="signFormData.newPassword"
            :type="passsWordIsVisible.newSignPassword ? 'text' : 'password'"
            name="newPassword"
            :label="$t('sys.platform.newSignPassword')"
            :placeholder="$t('sys.inputText') + $t('sys.platform.newSignPassword')"
            :rules="[
              {
                required: true,
                message: $t('sys.inputText') + $t('sys.platform.newSignPassword'),
                trigger: ['onChange', 'onBlur'],
              },
              {
                validator: () => signRulevalidator('newPassword', signFormData.newPassword),
                trigger: ['onChange', 'onBlur'],
              },
            ]"
          >
            <template #right-icon>
              <i
                v-if="passsWordIsVisible.newSignPassword"
                class="iconfont icon-chakan1"
                @click="updatePasssWordIsVisible('newSignPassword')"
              ></i>
              <i
                v-else
                class="iconfont icon-a-baomi1"
                @click="updatePasssWordIsVisible('newSignPassword')"
              ></i>
            </template>
          </van-field>
          <van-field
            v-no-copy-paste
            required
            v-model="signFormData.confirm"
            :type="passsWordIsVisible.confirmSign ? 'text' : 'password'"
            name="confirm"
            :label="$t('sys.platform.confirmSignPassword')"
            :placeholder="$t('sys.inputText') + $t('sys.platform.confirmSignPassword')"
            :rules="[
              {
                required: true,
                message: $t('sys.inputText') + $t('sys.platform.confirmSignPassword'),
                trigger: ['onChange', 'onBlur'],
              },
              {
                validator: () => signRulevalidator('confirm', signFormData.confirm),
                trigger: ['onChange', 'onBlur'],
              },
            ]"
          >
            <template #right-icon>
              <i
                v-if="passsWordIsVisible.confirmSign"
                class="iconfont icon-chakan1"
                @click="updatePasssWordIsVisible('confirmSign')"
              ></i>
              <i
                v-else
                class="iconfont icon-a-baomi1"
                @click="updatePasssWordIsVisible('confirmSign')"
              ></i>
            </template>
          </van-field>
        </van-form>
        <div class="pb40px mt20px pl30px pr30px">
          <van-button
            @click="onSubmit"
            block
            type="primary"
            native-type="submit"
            :disabled="signDisabled"
            :loading="loading"
            >保 存</van-button
          >
        </div>
      </van-tab>
    </van-tabs>
    <van-form v-else class="mt60px" ref="form" label-align="top">
      <van-field
        v-no-copy-paste
        required
        v-model="formData.oldPassword"
        name="oldPassword"
        :label="$t('sys.platform.currentLoginPassword')"
        :placeholder="$t('sys.inputText') + $t('sys.platform.currentLoginPassword')"
        :type="passsWordIsVisible.oldPassword ? 'text' : 'password'"
        :rules="[
          {
            required: true,
            message: $t('sys.inputText') + $t('sys.platform.currentLoginPassword'),
            trigger: ['onChange', 'onBlur'],
          },
        ]"
      >
        <template #right-icon>
          <i
            v-if="passsWordIsVisible.oldPassword"
            class="iconfont icon-chakan1"
            @click="updatePasssWordIsVisible('oldPassword')"
          ></i>
          <i
            v-else
            class="iconfont icon-a-baomi1"
            @click="updatePasssWordIsVisible('oldPassword')"
          ></i>
        </template>
      </van-field>
      <van-field
        v-no-copy-paste
        required
        v-model="formData.newPassword"
        :type="passsWordIsVisible.newPassword ? 'text' : 'password'"
        name="newPassword"
        :label="$t('sys.platform.newLoginPassword')"
        :placeholder="$t('sys.inputText') + $t('sys.platform.newLoginPassword')"
        :rules="[
          {
            required: true,
            message: $t('sys.inputText') + $t('sys.platform.newLoginPassword'),
            trigger: ['onChange', 'onBlur'],
          },
          {
            validator: () => rulevalidator('newPassword', formData.newPassword),
            trigger: ['onChange', 'onBlur'],
          },
        ]"
      >
        <template #right-icon>
          <i
            v-if="passsWordIsVisible.newPassword"
            class="iconfont icon-chakan1"
            @click="updatePasssWordIsVisible('newPassword')"
          ></i>
          <i
            v-else
            class="iconfont icon-a-baomi1"
            @click="updatePasssWordIsVisible('newPassword')"
          ></i>
        </template>
      </van-field>
      <van-field
        v-no-copy-paste
        required
        v-model="formData.confirm"
        :type="passsWordIsVisible.confirm ? 'text' : 'password'"
        name="confirm"
        :label="$t('sys.platform.confirmLoginPassword')"
        :placeholder="$t('sys.inputText') + $t('sys.platform.confirmLoginPassword')"
        :rules="[
          {
            required: true,
            message: $t('sys.inputText') + $t('sys.platform.confirmLoginPassword'),
            trigger: ['onChange', 'onBlur'],
          },
          {
            validator: () => rulevalidator('confirm', formData.confirm),
            trigger: ['onChange', 'onBlur'],
          },
        ]"
      >
        <template #right-icon>
          <i
            v-if="passsWordIsVisible.confirm"
            class="iconfont icon-chakan1"
            @click="updatePasssWordIsVisible('confirm')"
          ></i>
          <i v-else class="iconfont icon-a-baomi1" @click="updatePasssWordIsVisible('confirm')"></i>
        </template>
      </van-field>
      <div class="pb40px mt20px pl30px pr30px">
        <van-button
          @click="onSubmit"
          block
          type="primary"
          native-type="submit"
          :disabled="disabled"
          :loading="loading"
          >保 存</van-button
        >
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
  import { UserData, appLoginOut } from '@mobile/stores/loginHooks';
  import CryptoJS from 'crypto-js';
  import { postUserResetPwd } from '/@/apis/gct-platform/UserController';
  import type { FormInstance } from 'vant';
  import { getPlatInfo } from '/@/apis/gct-platform/PlatformConfigController';
  import type { SecurityConfig } from '/@/apis/gct-platform/model';
  import { PlatformSettingEnum } from '@mobile/type';
  import { isEmpty } from 'lodash-es';
  import { showToast } from 'vant';

  const loading = ref(false);
  const securitySettingConfig: SecurityConfig = reactive({
    enableKickOut: 1,
    enableChangePassword: 1,
    signEnablePassphrase: 1,
    expiryDate: 30,
    timeUnit: 'DAYS',
    enablePassphrase: 1,
    enableSignPassword: 0,
    passRule: ['NUMBER'],
    signPassRule: ['NUMBER'],
    passMinLength: 6,
    signPassMinLength: 6,
    enableLockAccount: 1,
    maxErrorTimes: 2,
    lockTimeout: 100,
  });

  const active = ref(0);

  const passsWordIsVisible = ref({
    oldPassword: false,
    newPassword: false,
    confirm: false,
    oldSignPassword: false,
    newSignPassword: false,
    confirmSign: false,
  });

  const PassRule = {
    NUMBER: 'NUMBER',
    LOWERCASE: 'LOWERCASE',
    UPPERCASE: 'UPPERCASE',
    SPECHARS: 'SPECHARS',
  };

  const passOptions = ref([
    {
      label: $t('sys.number'),
      value: PassRule.NUMBER,
    },
    {
      label: $t('sys.lowercase'),
      value: PassRule.LOWERCASE,
    },
    {
      label: $t('sys.uppercase'),
      value: PassRule.UPPERCASE,
    },
    {
      label: $t('sys.spechars'),
      value: PassRule.SPECHARS,
    },
    {
      label: $t('sys.lowercaseAndUppercase'),
      value: 'LOWERCASE_UPPERCASE',
    },
  ]);

  const updatePasssWordIsVisible = (type) => {
    passsWordIsVisible.value[type] = !passsWordIsVisible.value[type];
  };

  const getSecurityConfig = async () => {
    const config = await getPlatInfo({ configEnum: PlatformSettingEnum.SECURITY });
    if (config && config.value) {
      const value = JSON.parse(config.value);
      for (let k in value) {
        securitySettingConfig[<keyof SecurityConfig>k] = value[k];
      }
    }
  };
  getSecurityConfig();
  const form = ref<FormInstance>();
  const signForm = ref<FormInstance>();
  const formData = reactive({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  });

  const signFormData = reactive({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  });
  const disabled = computed(() => {
    let { oldPassword, newPassword, confirm } = formData;
    return !oldPassword || !newPassword || !confirm;
  });
  const signDisabled = computed(() => {
    let { oldPassword, newPassword, confirm } = signFormData;
    return !oldPassword || !newPassword || !confirm;
  });
  async function onSubmit() {
    if (!active.value) {
      if (!form.value) return;
      await form.value.validate();
      const formdata = {
        userId: UserData.value.userId,
        newPassword: CryptoJS.SHA256(formData.newPassword).toString(CryptoJS.enc.Hex),
        oldPassword: CryptoJS.SHA256(formData.oldPassword).toString(CryptoJS.enc.Hex),
        type: 'LOGIN',
      };
      loading.value = true;
      try {
        await postUserResetPwd(formdata);
        await appLoginOut();
      } catch (error) {
        loading.value = false;
      }
    } else {
      if (!signForm.value) return;
      await signForm.value.validate();
      const formdata = {
        userId: UserData.value.userId,
        newPassword: CryptoJS.SHA256(signFormData.newPassword).toString(CryptoJS.enc.Hex),
        oldPassword: CryptoJS.SHA256(signFormData.oldPassword).toString(CryptoJS.enc.Hex),
        type: 'SIGN',
      };
      loading.value = true;
      try {
        await postUserResetPwd(formdata);
        showToast('修改成功');
        setTimeout(() => {
          history.back();
        }, 1000)
      } catch (error) {
        loading.value = false;
      }
    }
  }

  function rulevalidator(type: string, password: any) {
    const newPassword = formData.newPassword;
    const confirmPassword = formData.confirm;
    let flag = true;
    const passRuleStr = getPassLabel('passRule');
    if (securitySettingConfig.enablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'passRule');
      if (!flag && password) {
        return passRuleStr;
      }
      if (
        (securitySettingConfig.passMinLength &&
          securitySettingConfig.passMinLength > formData[type].length &&
          formData[type]) ||
        formData[type].length > 16
      ) {
        return passRuleStr;
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(formData[type])) {
        return passRuleStr;
      }
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return true;
    }
    if (confirmPassword !== newPassword) {
      return $t('sys.portal.signPasswordNotSame');
    }
    form.value?.resetValidation(['confirm', 'newPassword']);
    return true;
  }

  function signRulevalidator(type: string, password: any) {
    const newPassword = signFormData.newPassword;
    const confirmPassword = signFormData.confirm;
    let flag = true;
    const passRuleStr = getPassLabel('signPassRule');
    if (securitySettingConfig.signEnablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'signPassRule');
      if (!flag && password) {
        return passRuleStr;
      }
      if (
        (securitySettingConfig.signPassMinLength &&
          securitySettingConfig.signPassMinLength > signFormData[type].length &&
          signFormData[type]) ||
        signFormData[type].length > 16
      ) {
        return passRuleStr;
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(signFormData[type])) {
        return passRuleStr;
      }
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return true;
    }
    if (confirmPassword !== newPassword) {
      return $t('sys.portal.signPasswordNotSame');
    }
    signForm.value?.resetValidation(['confirm', 'newPassword']);
    return true;
  }
  const getPassLabel = (rule) => {
    if (!securitySettingConfig[rule === 'passRule' ? 'enablePassphrase' : 'signEnablePassphrase']) {
      return $t('sys.passwordErrorTip', {
        len: 6,
        text: '数字/大小写字母',
      });
    }
    const passRule = securitySettingConfig[rule];
    if (passRule?.length) {
      const lowAndUpperArr: string[] = [PassRule.LOWERCASE, PassRule.UPPERCASE];
      const hasLowAndUpper = lowAndUpperArr.every((e) => passRule?.includes(e));
      let passLabels = passRule?.map((val: string) => {
        let passItem = passOptions.value.find((item) => {
          if (hasLowAndUpper && lowAndUpperArr.includes(val)) {
            return 'LOWERCASE_UPPERCASE' === item.value;
          }
          return val == item.value;
        });
        return passItem?.label;
      });
      passLabels = [...new Set(passLabels)];
      return securitySettingConfig[rule === 'passRule' ? 'passMinLength' : 'signPassMinLength'] ==
        16
        ? $t('sys.password16ErrorTip', {
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? $t('sys.group') : '',
          })
        : $t('sys.passwordErrorTip', {
            len: securitySettingConfig[rule === 'passRule' ? 'passMinLength' : 'signPassMinLength'],
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? $t('sys.group') : '',
          });
    } else {
      return $t('sys.passLenTip', {
        text: securitySettingConfig[rule === 'passRule' ? 'passMinLength' : 'signPassMinLength'],
      });
    }
  };
  // 验证规则
  const validatePassRule = (newPassword, confirmPassword, rule) => {
    const regexPatterns: RegExp[] = [];
    if (securitySettingConfig[rule]?.includes('NUMBER')) {
      regexPatterns.push(/\d/);
    }
    if (securitySettingConfig[rule]?.includes('LOWERCASE')) {
      regexPatterns.push(/[a-z]/);
    }
    if (securitySettingConfig[rule]?.includes('UPPERCASE')) {
      regexPatterns.push(/[A-Z]/);
    }
    if (securitySettingConfig[rule]?.includes('SPECHARS')) {
      regexPatterns.push(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/);
    }
    if (
      confirmPassword &&
      newPassword &&
      regexPatterns.every((pattern) => pattern.test(confirmPassword)) &&
      regexPatterns.every((pattern) => pattern.test(newPassword))
    ) {
      return true;
    } else if (
      confirmPassword &&
      !newPassword &&
      regexPatterns.every((pattern) => pattern.test(confirmPassword))
    ) {
      return true;
    } else if (
      newPassword &&
      !confirmPassword &&
      regexPatterns.every((pattern) => pattern.test(newPassword))
    ) {
      return true;
    } else {
      return false;
    }
  };
</script>
<style scoped lang="less"></style>
