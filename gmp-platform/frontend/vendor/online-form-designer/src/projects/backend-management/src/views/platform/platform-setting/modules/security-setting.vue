<template>
  <div class="security">
    <a-form ref="formRef" :model="securitySetting" autocomplete="off" labelAlign="right">
      <div v-show="isPlatform">
        <div class="title">{{ t('sys.platform.loginKickOut') }}</div>
        <a-form-item :label="t('sys.platform.enSure')">
          <a-switch
            size="small"
            :checked="securitySetting.enableKickOut === 1"
            @change="(checked) => handleChangeState(checked, 'enableKickOut')"
          />
        </a-form-item>
        <a-form-item :label="t('sys.platform.kickOutRule')">
          <a-radio-group
            v-model:value="securitySetting.loginKickOutMode"
            :options="kickRuleOptions"
          />
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ t('sys.appDesigner.approval.signType') }}</div>
        <a-form-item :label="t('sys.appDesigner.approval.signType')">
          <a-radio-group v-model:value="securitySetting.enableSignPassword">
            <a-radio :value="0">
              {{ t('sys.platform.ACCOUNT') }}
            </a-radio>
            <a-radio :value="1">
              {{ t('sys.platform.signaturePassword') }}
            </a-radio>
            <a-radio :value="2">
              {{ t('sys.platform.DOMAIN_ACCOUNT') + t('sys.password') }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ t('sys.platform.forceChangePassword') }}</div>
        <div
          v-if="securitySetting.enableSignPassword == 1"
          class="flex flex-none pl-16px pr-16px pb-12px pt-12px"
          style="align-items: center"
        >
          <div
            :class="{
              'change-password': true,
              'change-password-active': forceIsLgin,
            }"
            @click="changePasswordType('forceChangePassword', PasswordEnum.Login)"
          >
            {{ t('sys.platform.loginPassword') }}
          </div>
          <a-divider type="vertical" />
          <div
            :class="{
              'change-password': true,
              'change-password-active': !forceIsLgin,
            }"
            @click="changePasswordType('forceChangePassword', PasswordEnum.Signature)"
          >
            {{ t('sys.platform.signaturePassword') }}
          </div>
        </div>
        <a-form-item v-if="forceIsLgin" :label="t('sys.platform.firstLogin')">
          <a-switch
            size="small"
            :checked="securitySetting.firstTimeChangePassword === 1"
            @change="(checked) => handleChangeState(checked, 'firstTimeChangePassword')"
          />
        </a-form-item>

        <a-form-item v-if="forceIsLgin" :label="t('sys.platform.pwdValidPeriod')">
          <a-switch
            :checked="securitySetting.enableChangePassword === 1"
            @change="(checked) => handleChangeState(checked, 'enableChangePassword')"
            size="small"
          />
        </a-form-item>

        <a-row v-if="forceIsLgin">
          <a-col :span="8">
            <a-form-item :label="t('sys.platform.passwordTime')">
              <a-input v-model:value="securitySetting.expiryDate" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.platform.timeUnit')">
              <a-select v-model:value="securitySetting.timeUnit" :options="timeUnitOptions" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item v-if="!forceIsLgin" :label="t('sys.platform.firstLogin')">
          <a-switch
            size="small"
            :checked="securitySetting.signFirstTimeChangePassword === 1"
            @change="(checked) => handleChangeState(checked, 'signFirstTimeChangePassword')"
          />
        </a-form-item>

        <a-form-item v-if="!forceIsLgin" :label="t('sys.platform.pwdValidPeriod')">
          <a-switch
            :checked="securitySetting.enableChangeSignPassword === 1"
            @change="(checked) => handleChangeState(checked, 'enableChangeSignPassword')"
            size="small"
          />
        </a-form-item>

        <a-row v-if="!forceIsLgin">
          <a-col :span="8">
            <a-form-item :label="t('sys.platform.passwordTime')">
              <a-input v-model:value="securitySetting.signExpiryDate" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('sys.platform.timeUnit')">
              <a-select v-model:value="securitySetting.signTimeUnit" :options="timeUnitOptions" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
      <div>
        <div class="title">{{ t('sys.platform.passRule') }}</div>
        <div class="flex items-center flex-none pl-16px pr-16px pb-12px pt-12px">
          <!-- 登录 -->
          <div
            :class="{
              'change-password': true,
              'change-password-active': passRuleActiveKey === PasswordEnum.Login,
            }"
            @click="changePasswordType('passRule', PasswordEnum.Login)"
          >
            {{ t('sys.platform.loginPassword') }}
          </div>
          <template v-if="isPlatform">
            <a-divider type="vertical" />
            <!-- 印章 -->
            <div
              :class="{
                'change-password': true,
                'change-password-active': passRuleActiveKey === PasswordEnum.Seal,
              }"
              @click="changePasswordType('passRule', PasswordEnum.Seal)"
            >
              {{ t('sys.platform.sealPassword') }}
            </div>
          </template>
          <!-- 签名 -->
          <template v-if="securitySetting.enableSignPassword === 1">
            <a-divider type="vertical" />
            <div
              :class="{
                'change-password': true,
                'change-password-active': passRuleActiveKey === PasswordEnum.Signature,
              }"
              @click="changePasswordType('passRule', PasswordEnum.Signature)"
            >
              {{ t('sys.platform.signaturePassword') }}
            </div>
          </template>
        </div>

        <!-- 登录 -->
        <template v-if="passRuleActiveKey === PasswordEnum.Login">
          <a-form-item :label="t('sys.platform.enSure')">
            <a-switch
              size="small"
              :checked="securitySetting.enablePassphrase === 1"
              @change="(checked) => handleChangeState(checked, 'enablePassphrase')"
            />
          </a-form-item>
          <a-form-item :label="t('sys.platform.ruleSure')">
            <a-checkbox-group
              v-model:value="securitySetting.passRule"
              name="checkboxgroup"
              :options="plainOptions"
            />
          </a-form-item>
          <a-row>
            <a-col :span="8">
              <a-form-item :label="t('sys.platform.minLength')">
                <a-input-number
                  v-model:value="securitySetting.passMinLength"
                  :min="6"
                  :max="16"
                  :controls="false"
                  allowClear
                  @blur="!securitySetting.passMinLength && (securitySetting.passMinLength = 6)"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.platform.passworgNoSameNumber')">
                <a-input-number
                  v-model:value="securitySetting.repeatNum"
                  :min="1"
                  :controls="false"
                  allowClear
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>

        <!-- 印章 -->
        <template v-if="passRuleActiveKey === PasswordEnum.Seal">
          <a-form-item :label="t('sys.platform.enSure')">
            <a-switch
              size="small"
              :checked="securitySetting.sealEnablePassphrase === 1"
              @change="(checked) => handleChangeState(checked, 'sealEnablePassphrase')"
            />
          </a-form-item>
          <a-form-item :label="t('sys.platform.ruleSure')">
            <a-checkbox-group
              v-model:value="securitySetting.sealPassRule"
              name="checkboxgroup"
              :options="plainOptions"
            />
          </a-form-item>
          <a-row>
            <a-col :span="8">
              <a-form-item :label="t('sys.platform.minLength')">
                <a-input-number
                  v-model:value="securitySetting.sealPassMinLength"
                  :min="6"
                  :max="16"
                  :controls="false"
                  allowClear
                  @blur="
                    !securitySetting.sealPassMinLength && (securitySetting.sealPassMinLength = 6)
                  "
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.platform.passworgNoSameNumber')">
                <a-input-number
                  v-model:value="securitySetting.sealRepeatNum"
                  :min="1"
                  :controls="false"
                  allowClear
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>

        <!-- 签名 -->
        <template v-if="passRuleActiveKey === PasswordEnum.Signature">
          <a-form-item :label="t('sys.platform.enSure')">
            <a-switch
              size="small"
              :checked="securitySetting.signEnablePassphrase === 1"
              @change="(checked) => handleChangeState(checked, 'signEnablePassphrase')"
            />
          </a-form-item>
          <a-form-item :label="t('sys.platform.ruleSure')">
            <a-checkbox-group
              v-model:value="securitySetting.signPassRule"
              name="checkboxgroup"
              :options="plainOptions"
            />
          </a-form-item>
          <a-row>
            <a-col :span="8">
              <a-form-item :label="t('sys.platform.minLength')">
                <a-input-number
                  v-model:value="securitySetting.signPassMinLength"
                  :min="6"
                  :max="16"
                  :controls="false"
                  allowClear
                  @blur="
                    !securitySetting.signPassMinLength && (securitySetting.signPassMinLength = 6)
                  "
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('sys.platform.passworgNoSameNumber')">
                <a-input-number
                  v-model:value="securitySetting.signRepeatNum"
                  :min="1"
                  :controls="false"
                  allowClear
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
      </div>
      <div>
        <div class="title">{{ t('sys.platform.accountLock') }}</div>

        <a-form-item :label="t('sys.platform.enable')">
          <a-switch
            size="small"
            :checked="securitySetting.enableLockAccount === 1"
            @change="(checked) => handleChangeState(checked, 'enableLockAccount')"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.maxErrorNumber')"
          :help="t('sys.developer.maxErrorTimes')"
        >
          <div class="w-20% flex items-center">
            <a-input-number
              :min="1"
              :max="10"
              v-model:value="securitySetting.maxErrorTimes"
              style="width: 40%; max-width: 100px"
            />
          </div>
          <!-- <template #help>{{t('sys.developer.maxErrorTimes')}} </template> -->
        </a-form-item>
        <a-form-item :label="t('sys.developer.lockTime')">
          <div class="w-40% flex items-center">
            <a-input-number v-model:value="securitySetting.lockHourTimeout" :min="0" :max="99" style="flex: 2; max-width: 100px" />
            <span class="mr-5px ml-5px">{{ t('sys.hour') }}</span>
            <a-select v-model:value="securitySetting.lockMinTimeout" style="flex: 3" >
              <a-select-option v-for="n in 60" :key="n" :value="n - 1">
                {{ n - 1 < 10 ? '0' + (n - 1) : n - 1 }}
              </a-select-option>
            </a-select>
            <span class="ml-5px">{{ t('sys.component.time.minute') }}</span>
            <a-select v-model:value="securitySetting.lockTimeout" style="flex: 3" >
              <a-select-option v-for="n in 60" :key="n" :value="n - 1">
                {{ n - 1 < 10 ? '0' + (n - 1) : n - 1 }}
              </a-select-option>
            </a-select>
            <span class="ml-5px">{{ t('sys.timeSecond') }}</span>
          </div>
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ t('sys.platform.noOperationRemainTime') }}</div>
        <div class="sub-title">{{ t('sys.platform.noOperationDisconnectTip') }}</div>
        <a-form-item :label="t('sys.platform.remainTime')" name="noOpRetainHour">
          <div class="w-30% flex items-center">
            <a-input-number
              :min="0"
              :precision="0"
              v-model:value="securitySetting.noOpRetainHour"
              @blur="validateEarlyAlarmMinute"
              style="flex: 1; max-width: 100px"
            />
            <span class="mr-5px ml-5px">{{ t('sys.hour') }}</span>
            <a-select
              v-model:value="securitySetting.noOpRetainMinute"
              @change="validateEarlyAlarmMinute"
              style="flex: 2;"
            >
              <a-select-option v-for="n in 60" :key="n" :value="n - 1">{{
                n - 1 < 10 ? '0' + (n - 1) : n - 1
              }}</a-select-option>
            </a-select>
            <span class="ml-5px">{{ t('sys.component.time.minute') }}</span>
          </div>
        </a-form-item>
        <div class="sub-title">{{ t('sys.platform.autoDisconnectAlarmTip') }}</div>
        <a-form-item
          :label="t('sys.platform.earlyAlarm')"
          name="earlyAlarmMinute"
          ref="earlyAlarmMinuteRef"
          :rules="[
            {
              validator: validateEarlyAlarm,
              trigger: 'change',
            },
          ]"
        >
          <div class="w-18% flex items-center">
            <a-select v-model:value="securitySetting.earlyAlarmMinute">
              <a-select-option v-for="n in 60" :key="n" :value="n - 1">
                {{ n - 1 < 10 ? '0' + (n - 1) : n - 1 }}
              </a-select-option>
            </a-select>
            <span class="mr-5px ml-5px">{{ t('sys.component.time.minute') }}</span>
            <a-select
              v-model:value="securitySetting.earlyAlarmSecond"
              @change="validateEarlyAlarmMinute"
            >
              <a-select-option v-for="n in 60" :key="n" :value="n - 1">
                {{ n - 1 < 10 ? '0' + (n - 1) : n - 1 }}
              </a-select-option>
            </a-select>
            <span class="ml-5px">{{ t('sys.timeSecond') }}</span>
          </div>
        </a-form-item>
        <div class="sub-title">{{ t('sys.platform.chooseInoperativePerson') }}</div>
        <a-form-item :label="t('sys.platform.application')" name="inapplicablePerson">
          <div class="w-20% flex items-center">
            <a-select
              v-if="isPlatform"
              :options="optionsData"
              :open="false"
              v-model:value="securitySetting.inapplicablePerson"
              @click="openView()"
              mode="multiple"
              :placeholder="t('sys.platform.inapplicablePersonPlaceholder')"
            >
              <template #tagRender="data">
                <tag style="margin: 2px 5px 2px 0">
                  <IconNext
                    :size="16"
                    :value="returnIconExtra(data).icon"
                    :style="{
                      verticalAlign: 'text-bottom',
                      marginRight: '3px',
                    }"
                    :color="returnIconExtra(data).iconColor"
                  />
                  <span>{{ data.label || data.value }}</span>
                  <IconNext
                    v-if="data.closable"
                    :size="15"
                    :value="'icon-park:close-small'"
                    :style="{
                      verticalAlign: 'text-bottom',
                      '--color': 'rgba(0,0,0,.45)',
                      lineHeight: '1',
                      marginLeft: '2px',
                    }"
                    @click.prevent.stop="data.onClose"
                  />
                </tag>
              </template>
            </a-select>
            <approval-user-select-config
              v-else
              v-model:modelValue="securitySetting.inapplicablePersonStr"
              :placeholder="t('sys.platform.inapplicablePersonPlaceholder')"
              size="default"
              :showTabs="['User', 'Org']"
              @change="handleuserRangeChange"
            />
          </div>
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ t('sys.platform.userToken') }}</div>
        <a-form-item
          :label="t('sys.platform.validTime')"
          name="durationHour"
          :rules="[
            {
              validator: validateDuration,
              trigger: 'change',
            },
          ]"
        >
          <div class="w-30% flex items-center">
            <a-input-number :min="0" :precision="0" v-model:value="securitySetting.durationHour"  style="flex: 1; max-width: 100px" />
            <span class="mr-5px ml-5px">{{ t('sys.hour') }}</span>
            <a-select v-model:value="securitySetting.durationMinute" style="flex: 2;">
              <a-select-option v-for="n in 60" :key="n" :value="n - 1">{{
                n - 1 < 10 ? '0' + (n - 1) : n - 1
              }}</a-select-option>
            </a-select>
            <span class="ml-5px">{{ t('sys.component.time.minute') }}</span>
          </div>
        </a-form-item>
      </div>
    </a-form>

    <SelectUserModal
      ref="selectUserModalRef"
      :className="getClassName"
      :destroyOnClose="true"
      @ok="handleOk"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, h, onMounted, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PassRule, KickRuleEnum } from '/@/hooks/platform/types';
  import type { Rule } from 'ant-design-vue/es/form';
  import type { FormInstance, FormItemInstance } from 'ant-design-vue';
  import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
  import { PickerOrgDTO, PickerUserDTO } from '@mobile/apis/gct-platform/model';
  import { getOrgUserPickerManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';
  import SelectUserModal from '../modal/select-user-modal.vue';
  import { uuid2 } from '/@/utils/uuid';
  import { getOrgList } from '/@/apis/gct-platform/OrgController';
  import tag from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/tag.vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { PasswordEnum } from '../types/types';
  import approvalUserSelectConfig from '/@/projects/web-render/src/views/edhr-application/render/document-control-config/config/bpmn-setting/comps/approval-user-select-config.vue';

  const props = withDefaults(
    defineProps<{
      isPlatform: boolean;
    }>(),
    {
      isPlatform: true,
    },
  );

  const formRef = ref<FormInstance>();

  const earlyAlarmMinuteRef = ref<FormItemInstance>();

  const { t } = useI18n();

  const allDepts = ref<PickerOrgDTO[]>([]);

  const allUsers = ref<PickerUserDTO[]>([]);

  const selectUserModalRef = ref();

  const { securitySetting, loadSecuritySetting } = useSecuritySetting();

  const getClassName = 'range-user-render-field_' + uuid2(16, 16);

  const forceChangePasswordActiveKey = ref(PasswordEnum.Login);

  const passRuleActiveKey = ref(PasswordEnum.Login);

  const plainOptions = ref([
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
  ]);

  const kickRuleOptions = ref([
    { label: t('sys.platform.kickOutRuleSame'), value: KickRuleEnum.SAME_END },
    { label: t('sys.platform.kickOutRuleDiff'), value: KickRuleEnum.DIFFERENT_END },
  ]);

  const timeUnitOptions = [
    {
      label: t('sys.day'),
      value: 'DAYS',
    },
    {
      label: t('sys.hour'),
      value: 'HOURS',
    },
  ];

  const changePasswordType = (type, passwordType) => {
    if (type === 'forceChangePassword') {
      forceChangePasswordActiveKey.value = passwordType;
      return;
    }
    if (type === 'passRule') {
      passRuleActiveKey.value = passwordType;
    }
  };

  const handleChangeState = (checked, type: string) => {
    if (type in securitySetting) {
      securitySetting[type] = checked ? 1 : 0;
    }
  };

  // 所有的部门
  const getAllDepts = async () => {
    allDepts.value = ((await getOrgList()) ?? []).map((e) => {
      return { ...e, value: `ORG:${e.id}`, label: e.name };
    });
  };

  // 已选择的用户
  const getAllUsers = async (ids) => {
    const res = ((await getOrgUserPickerManagementUserListByIds({ ids: ids.join(',') })) ?? []).map(
      (e) => {
        return { ...e, value: `USER:${e.id}`, label: e.fullname! };
      },
    );
    allUsers.value.push(...res);
  };

  // 更新用户列表
  const updateUserOptions = async (userIds) => {
    const notExistUserIds = userIds
      .filter((e) => e.includes(`USER:`) && !allUsers.value.some((f) => f.value === e))
      .map((e) => e.replace(/USER:/, ''));
    notExistUserIds.length && (await getAllUsers(notExistUserIds));
  };

  // 弹窗-打开
  const openView = () => {
    selectUserModalRef.value.open({
      selectedValue: securitySetting.inapplicablePerson,
      title: t('sys.platform.application'),
    });
  };

  // 弹窗-保存
  const handleOk = async (data) => {
    console.log('data', data);

    const notExistUserIds = data
      .filter((e) => e.includes(`USER:`) && !allUsers.value.some((f) => f.value === e))
      .map((e) => e.replace(/USER:/, ''));
    securitySetting.inapplicablePerson = data || [];
    notExistUserIds.length && (await getAllUsers(notExistUserIds));
  };

  watch(
    () => securitySetting.inapplicablePerson,
    (val) => {
      updateUserOptions([val]);
      // 值发生变化
      // formItemContext.onFieldChange();
      // Event.runEventByName('onChange', props.widget.events, val, optionsData.value, formData.value);
    },
  );

  watch(
    () => securitySetting.repeatNum,
    (val) => {
      if (!val) {
        securitySetting.repeatNum = 1;
      }
    },
  );

  watch(
    () => securitySetting.maxErrorTimes,
    (val) => {
      if (!val) {
        securitySetting.maxErrorTimes = 2;
      }
    },
  );

  // tagLable中渲染的图标
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { value } = option;
    let icon, iconColor;
    if (value.includes('ORG:')) {
      icon = 'icon-bumen';
      iconColor = '#FF8C4B';
    } else if (value.includes('USER:')) {
      icon = 'icon-renyuan1';
      iconColor = '#5822B4';
    }
    return {
      icon,
      iconColor,
    };
  };

  // 下拉项数据
  const optionsData = computed(() => {
    const deptOpt = allDepts.value.filter((e) =>
      securitySetting.inapplicablePerson.includes(e.value),
    );
    return [...deptOpt, ...allUsers.value];
  });

  const forceIsLgin = computed(() => {
    return (
      forceChangePasswordActiveKey.value === PasswordEnum.Login ||
      !securitySetting.enableSignPassword
    );
  });

  const validateDuration = async (_rule: Rule, value) => {
    if (value === 0 && securitySetting.durationMinute === 0) {
      return Promise.reject(t('sys.platform.validDurationTip'));
    } else {
      return Promise.resolve();
    }
  };

  /** 校验提前预警不能大于保留时长 */
  const validateEarlyAlarm = async (_rule: Rule, value) => {
    console.log('securitySetting', securitySetting);

    if (
      (!securitySetting.noOpRetainHour && value > securitySetting.noOpRetainMinute) ||
      (!securitySetting.noOpRetainHour &&
        value === securitySetting.noOpRetainMinute &&
        securitySetting.earlyAlarmSecond > 0)
    ) {
      return Promise.reject(t('sys.platform.validEarlyAlarmTip'));
    } else {
      return Promise.resolve();
    }
  };

  /** 触发保留时长校验 */
  const validateEarlyAlarmMinute = () => {
    if (!securitySetting.noOpRetainHour) {
      securitySetting.noOpRetainHour = 0;
    }
    return earlyAlarmMinuteRef.value?.onFieldChange();
  };

  const validateValue = () => {
    return formRef.value?.validate();
  };

  const handleuserRangeChange = (val) => {
    securitySetting.inapplicablePerson = val ? val.split(',') : [];
  };
  /** 判断锁定时间秒数是否大于60 */
  const judgeLockTime = () => {
    if (securitySetting.lockTimeout > 60) {
      // 余数
      let remainder = securitySetting.lockTimeout % 60;
      // 除数
      let quotient = Math.floor(securitySetting.lockTimeout / 60);
      securitySetting.lockTimeout = remainder;
      if (quotient > 60) {
        let remainderHour = securitySetting.lockTimeout % 60;
        // 除数
        let quotientHour = Math.floor(securitySetting.lockTimeout / 60);
        securitySetting.lockMinTimeout = remainderHour;
        securitySetting.lockHourTimeout = quotientHour;
      } else {
        securitySetting.lockMinTimeout = quotient;
      }
    }
  };

  onMounted(() => {
    loadSecuritySetting();
    getAllDepts();
    if (securitySetting.inapplicablePerson!.length) {
      updateUserOptions(securitySetting.inapplicablePerson);
      if (!props.isPlatform)
        securitySetting.inapplicablePersonStr = securitySetting.inapplicablePerson?.join(',');
    }
    judgeLockTime();
  });

  defineExpose({ validateValue });
</script>

<style lang="less" scoped>
  .security {
    height: 100%;
    overflow: auto;

    .title {
      margin: 20px 0 16px 28px;
      color: #212528;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;

      &::before {
        content: '';
        display: inline-block;
        width: 2px;
        height: 14px;
        margin-right: 8px;
        background: #3168ec;
        color: #3168ec;
        font-size: 14px;
        line-height: 24px;
      }
    }

    .sub-title {
      margin: 20px 0 8px 28px;
      color: #666;
    }

    .ant-form > div {
      border-bottom: 1px solid #eaeaea;
    }
  }

  :deep(.ant-form-item-label) {
    width: 150px;
  }

  .change-password {
    padding: 0 20px;
    color: #797a7d;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;

    &-active {
      color: var(--ant-primary-color);
    }
  }
</style>
