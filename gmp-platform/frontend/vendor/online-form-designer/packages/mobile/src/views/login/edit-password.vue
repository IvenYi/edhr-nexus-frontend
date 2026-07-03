<template>
  <div class="p16px h100%">
    <div class="text-24px font-bold mb6px mt50px">
      {{ type === 'ADD' ? '设置签名密码' : '修改密码' }}
    </div>
    <div class="password">
      <van-form class="mt24px" label-align="top" ref="form">
        <van-tabs v-if="type === 'BOTH'" v-model:active="active" :lazy-render="false">
          <van-tab :title="$t('sys.platform.loginPassword')">
            <van-field
              v-no-copy-paste
              v-model="formData.oldPassword"
              name="oldPassword"
              :type="passsWordIsVisible.oldPassword ? 'text' : 'password'"
              required
              :label="$t('sys.platform.currentLoginPassword')"
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
              :type="passsWordIsVisible.newPassword ? 'text' : 'password'"
              name="newPassword"
              required
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
              v-model="formData.confirm"
              :type="passsWordIsVisible.confirm ? 'text' : 'password'"
              name="confirm"
              required
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
          </van-tab>
          <van-tab :title="$t('sys.platform.signaturePassword')">
            <van-field
              v-no-copy-paste
              v-model="formData.oldSignPassword"
              name="oldSignPassword"
              :type="passsWordIsVisible.oldSignPassword ? 'text' : 'password'"
              required
              :label="$t('sys.platform.currentSignPassword')"
              :placeholder="$t('sys.inputText') + $t('sys.platform.currentSignPassword')"
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
              v-model="formData.newSignPassword"
              :type="passsWordIsVisible.newSignPassword ? 'text' : 'password'"
              name="newSignPassword"
              required
              :label="$t('sys.platform.newSignPassword')"
              :placeholder="$t('sys.inputText') + $t('sys.platform.newSignPassword')"
              :rules="[
                {
                  required: true,
                  message: $t('sys.inputText') + $t('sys.platform.newSignPassword'),
                  trigger: ['onChange', 'onBlur'],
                },
                {
                  validator: () => signRulevalidator('newSignPassword', formData.newSignPassword),
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
              v-model="formData.confirmSign"
              :type="passsWordIsVisible.confirmSign ? 'text' : 'password'"
              name="confirmSign"
              required
              :label="$t('sys.platform.confirmSignPassword')"
              :placeholder="$t('sys.inputText') + $t('sys.platform.confirmSignPassword')"
              :rules="[
                {
                  required: true,
                  message: $t('sys.inputText') + $t('sys.platform.confirmSignPassword'),
                  trigger: ['onChange', 'onBlur'],
                },
                {
                  validator: () => signRulevalidator('confirmSign', formData.confirmSign),
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
          </van-tab>
        </van-tabs>
        <template v-if="type === 'LOGIN'">
          <van-field
            v-no-copy-paste
            v-model="formData.oldPassword"
            name="oldPassword"
            :type="passsWordIsVisible.oldPassword ? 'text' : 'password'"
            required
            :label="$t('sys.platform.currentLoginPassword')"
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
            :type="passsWordIsVisible.newPassword ? 'text' : 'password'"
            name="newPassword"
            required
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
            v-model="formData.confirm"
            :type="passsWordIsVisible.confirm ? 'text' : 'password'"
            name="confirm"
            required
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
        </template>

        <van-field
          v-if="type === 'SIGN'"
          v-no-copy-paste
          v-model="formData.oldSignPassword"
          name="oldSignPassword"
          :type="passsWordIsVisible.oldSignPassword ? 'text' : 'password'"
          required
          :label="$t('sys.platform.currentSignPassword')"
          :placeholder="$t('sys.inputText') + $t('sys.platform.currentSignPassword')"
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
          v-if="type === 'SIGN' || type === 'ADD'"
          v-model="formData.newSignPassword"
          :type="passsWordIsVisible.newSignPassword ? 'text' : 'password'"
          name="newSignPassword"
          required
          :label="
            type === 'ADD'
              ? $t('sys.platform.signaturePassword')
              : $t('sys.platform.newSignPassword')
          "
          :placeholder="
            $t('sys.inputText') +
            (type === 'ADD'
              ? $t('sys.platform.signaturePassword')
              : $t('sys.platform.newSignPassword'))
          "
          :rules="[
            {
              required: true,
              message:
                $t('sys.inputText') +
                (type === 'ADD'
                  ? $t('sys.platform.signaturePassword')
                  : $t('sys.platform.newSignPassword')),
              trigger: ['onChange', 'onBlur'],
            },
            {
              validator: () => signRulevalidator('newSignPassword', formData.newSignPassword),
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
          v-if="type === 'SIGN' || type === 'ADD'"
          v-model="formData.confirmSign"
          :type="passsWordIsVisible.confirmSign ? 'text' : 'password'"
          name="confirmSign"
          required
          :label="$t('sys.platform.confirmSignPassword')"
          :placeholder="$t('sys.inputText') + $t('sys.platform.confirmSignPassword')"
          :rules="[
            {
              required: true,
              message: $t('sys.inputText') + $t('sys.platform.confirmSignPassword'),
              trigger: ['onChange', 'onBlur'],
            },
            {
              validator: () => signRulevalidator('confirmSign', formData.confirmSign),
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

      <van-button @click="onSubmit" block type="primary" native-type="submit" :loading="loading">
        确 认
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { SecurityConfig } from '/@/apis/gct-platform/model';
  import { getPlatInfo } from '/@/apis/gct-platform/PlatformConfigController';
  import { postUserResetAllpwd } from '/@/apis/gct-platform/UserController';
  import { UserData, appLoginOut } from '@mobile/stores/loginHooks';
  import { PlatformSettingEnum } from '@mobile/type';
  import type { FormInstance } from 'vant';
  import CryptoJS from 'crypto-js';
  import { showToast } from 'vant';
  import { isEmpty } from 'lodash-es';
  import { getUserLastResetPwd } from '/@/apis/gct-platform/UserController';

  interface PasswordModel {
    oldPassword: string;
    newPassword: string;
    confirm: string;
    oldSignPassword: string;
    newSignPassword: string;
    confirmSign: string;
  }

  const form = ref<FormInstance>();

  const passsWordIsVisible = ref({
    oldPassword: false,
    newPassword: false,
    confirm: false,
    oldSignPassword: false,
    newSignPassword: false,
    confirmSign: false,
  });

  const route = useRoute();

  const router = useRouter();

  const active = ref(0);

  const tenantList = computed(() => UserData.value.tenantList);

  const loading = ref(false);

  const formData = ref<PasswordModel>({
    oldPassword: '',
    newPassword: '',
    confirm: '',
    oldSignPassword: '',
    newSignPassword: '',
    confirmSign: '',
  });

  const typeInfo = ref({
    needSetSignPass: 0,
    needChangePass: 0,
    needChangeSignPass: 0,
  });

  onBeforeMount(() => {
    typeInfo.value.needSetSignPass = +route.query?.needSetSignPass;
    typeInfo.value.needChangePass = +route.query?.needChangePass;
    typeInfo.value.needChangeSignPass = +route.query?.needChangeSignPass;
  });

  const type = computed(() => {
    if (typeInfo.value?.needSetSignPass) {
      return 'ADD';
    }
    if (typeInfo.value?.needChangePass && typeInfo.value?.needChangeSignPass) {
      return 'BOTH';
    }
    if (typeInfo.value?.needChangePass) {
      return 'LOGIN';
    }
    if (typeInfo.value?.needChangeSignPass) {
      return 'SIGN';
    }
    return 'none';
  });

  const getPwdInfo = async () => {
    const res = await getUserLastResetPwd();
    typeInfo.value = res;
    if (res && !res?.needChangePass && !res?.needSetSignPass && !res?.needChangeSignPass) {
      router.replace('/');
    }
  };

  const updatePasssWordIsVisible = (type) => {
    passsWordIsVisible.value[type] = !passsWordIsVisible.value[type];
  };

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

  const getPassLabel = (rule) => {
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

  function rulevalidator(type: string, password: any) {
    const newPassword = formData.value.newPassword;
    const confirmPassword = formData.value.confirm;
    let flag = true;
    const passRuleStr = getPassLabel('passRule');
    if (securitySettingConfig.enablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'passRule');
      if (!flag && password) {
        return passRuleStr;
      }
      if (
        (securitySettingConfig.passMinLength &&
          securitySettingConfig.passMinLength > formData.value[type].length &&
          formData.value[type]) ||
        formData.value[type].length > 16
      ) {
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
    const newPassword = formData.value.newSignPassword;
    const confirmPassword = formData.value.confirmSign;
    let flag = true;
    const passRuleStr = getPassLabel('signPassRule');
    if (securitySettingConfig.signEnablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'signPassRule');
      if (!flag && password) {
        return passRuleStr;
      }
      if (
        (securitySettingConfig.signPassMinLength &&
          securitySettingConfig.signPassMinLength > formData.value[type].length &&
          formData.value[type]) ||
        formData.value[type].length > 16
      ) {
        return passRuleStr;
      }
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return true;
    }
    if (confirmPassword !== newPassword) {
      return $t('sys.portal.signPasswordNotSame');
    }
    form.value?.resetValidation(['confirmSign', 'newSignPassword']);
    return true;
  }

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

  function onSubmit() {
    if (!form.value) return;
    form.value
      .validate()
      .then(async () => {
        const data = {
          userId: UserData.value.userId as any,
          newPassword: formData.value.newPassword
            ? CryptoJS.SHA256(formData.value.newPassword).toString(CryptoJS.enc.Hex)
            : '',
          oldPassword: formData.value.oldPassword
            ? CryptoJS.SHA256(formData.value.oldPassword).toString(CryptoJS.enc.Hex)
            : '',
          oldSignPassword: formData.value.oldSignPassword
            ? CryptoJS.SHA256(formData.value.oldSignPassword).toString(CryptoJS.enc.Hex)
            : '',
          newSignPassword: formData.value.newSignPassword
            ? CryptoJS.SHA256(formData.value.newSignPassword).toString(CryptoJS.enc.Hex)
            : '',
        };
        loading.value = true;
        try {
          await postUserResetAllpwd(data);

          if (formData.value.newPassword) {
            await appLoginOut();
          }
          if (type.value === 'ADD') {
            formData.value.newSignPassword = '';
            formData.value.oldSignPassword = '';
            showToast($t('sys.platform.setSuccess'));
          } else {
            showToast('修改成功');
          }
          await getPwdInfo();
          loading.value = false;
        } catch (error) {
          loading.value = false;
        }
      })
      .catch((err) => {
        if (err && err.length && type.value === 'BOTH') {
          if (err[0].name.includes('Sign')) {
            active.value = 1;
          } else {
            active.value = 0;
          }
        }
      });
  }
</script>
<style scoped lang="less">
  .van-cell {
    padding-right: 0;
    padding-left: 0;

    &::after {
      right: 0;
      left: 0;
    }
  }

  .van-form {
    position: relative;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      transform: scaleY(0.5);
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  .password {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: calc(100% - 90px);
  }
</style>
