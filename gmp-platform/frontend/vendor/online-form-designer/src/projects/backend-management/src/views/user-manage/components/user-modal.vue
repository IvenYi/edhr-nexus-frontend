<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @visible-change="handleShow"
  >
    <template #footer>
      <a-button v-if="!isReadonly" @click="closeModal">{{ t('sys.cancel') }}</a-button>
      <a-button v-if="isReadonly" @click="closeModal">{{ t('sys.closeText') }}</a-button>
      <a-button v-if="!isReadonly" type="primary" @click="handleOk">
        {{ t('sys.saveText') }}
      </a-button>
    </template>
    <div class="info-box w100%" v-if="isReadonly">
      <cropper-avatar
        :uploadApi="uploadApi"
        v-model:value="formState.avatar"
        :showBtn="false"
        width="80"
        :class="['ml-20px', 'mr-20px', { 'is-readonly': isReadonly }]"
      />

      <div class="info">
        <div class="flex">
          <div class="ell mr-8px" :title="formState.fullname">{{ formState.fullname }}</div>
          <i v-if="formState.gender == -1" class="iconfont icon-baomi"></i>
          <ManOutlined style="color: #3168ec" v-else-if="formState.gender == 1" />
          <WomanOutlined style="color: #ff748b" v-else />
        </div>

        <a-descriptions>
          <a-descriptions-item :label="t('sys.userName')">
            <div class="ell" :title="formState.username">
              {{ formState.username }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.empNo')">
            <div class="ell" :title="formState.empNo">
              {{ formState.empNo || '--' }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.birthday')">
            <div class="ell" :title="formState.birthday">
              {{ formState.birthday || '--' }}
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </div>
    <div class="divider" v-if="isReadonly"></div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: isReadonly ? 4 : 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      :class="{ 'user-modal': isReadonly }"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <!-- 基本信息 -->
        <a-collapse-panel
          v-if="!isReadonly"
          key="1"
          :header="t('sys.appDesigner.basicInformation')"
        >
          <a-form-item
            v-if="!isReadonly"
            :label="t('sys.fullname')"
            name="fullname"
            :rules="[{ required: !isReadonly }, { validator: validateIsModelName }, maxValidate]"
          >
            <a-input v-model:value="formState.fullname" :placeholder="t('sys.inputText')" />
          </a-form-item>
          <a-form-item v-if="!isReadonly" :label="t('sys.avatar')" name="avatar">
            <div>
              <cropper-avatar
                :key="formState.avatar"
                :uploadApi="uploadApi"
                v-model:value="formState.avatar"
                :showBtn="false"
                width="80"
                :class="['ml-20px', 'mr-20px', { 'is-readonly': isReadonly }]"
              />
            </div>
            <div v-if="!isReadonly" class="text-[#8F8F8F]"> {{ t('sys.org.uploadType') }}</div>
          </a-form-item>

          <a-form-item
            v-if="!isReadonly"
            :label="t('sys.empNo')"
            name="empNo"
            :rules="[
              { required: !isReadonly && getOrgRequiredFields?.includes('empNo') },
              { validator: validateIsModelName },
              maxValidate,
            ]"
          >
            <a-input v-model:value="formState.empNo" :placeholder="t('sys.inputText')" />
          </a-form-item>

          <a-form-item v-if="!isReadonly" :label="t('sys.gender')" name="gender">
            <a-radio-group v-model:value="formState.gender" :options="genderOptions" />
          </a-form-item>
          <a-form-item v-if="!isReadonly" :label="t('sys.birthday')" name="birthday">
            <a-date-picker
              v-model:value="formState.birthday"
              style="width: 100%"
              valueFormat="YYYY-MM-DD"
              :placeholder="t('sys.chooseText')"
            />
          </a-form-item>
        </a-collapse-panel>

        <!-- 账号信息 -->
        <a-collapse-panel key="2" :header="t('sys.userNameInfo')" :showArrow="!isReadonly">
          <a-form-item
            v-if="!isReadonly"
            :label="t('sys.userName')"
            name="username"
            :rules="[{ required: !isEdit }, { validator: validateIsModelName }, maxValidate]"
          >
            <a-input
              v-if="!isEdit"
              v-model:value="formState.username"
              :placeholder="t('sys.inputText')"
            />
            <span v-else>{{ formState.username }}</span>
          </a-form-item>

          <a-form-item
            :label="t('sys.mobile')"
            name="mobile"
            :rules="[
              { required: !isReadonly && getOrgRequiredFields?.includes('mobile') },
              {
                validator: useDefaultPwd ? undefined : () => checkPhone(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <span v-if="isReadonly">
              {{ formState.mobile ? formState.country + ' ' + formState.mobile : '--' }}
            </span>
            <div v-if="!isReadonly" class="phone-country">
              <VueCountryIntl v-model:value="formState.country" />
            </div>

            <a-input
              v-if="!isReadonly"
              v-model:value="formState.mobile"
              style="width: calc(100% - 84px); border-radius: 0 4px 4px 0"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>

          <a-form-item
            v-if="isCreate"
            :label="t('sys.password')"
            name="password"
            :rules="[
              { required: true },
              {
                validator: useDefaultPwd ? undefined : () => checkPassword(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input
              v-no-copy-paste
              v-model:value="formState.password"
              :disabled="useDefaultPwd"
              :type="passsWordIsVisible ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="getPassLabel()"
            >
              <template #suffix>
                <i
                  v-if="passsWordIsVisible"
                  class="iconfont icon-chakan1"
                  @click="updatePasssWordIsVisible()"
                ></i>
                <i v-else class="iconfont icon-a-baomi1" @click="updatePasssWordIsVisible()"></i>
              </template>
            </a-input>
            <a-form-item-rest>
              <a-checkbox
                v-model:checked="useDefaultPwd"
                @change="() => formRef?.clearValidate(['password'])"
              >
                {{ t('sys.org.intialPassword', { intialPassword: getOrgInitialPassword }) }}
              </a-checkbox>
            </a-form-item-rest>
          </a-form-item>

          <a-form-item
            :label="t('sys.telephone')"
            name="telephone"
            :rules="[
              {
                pattern: /^[\-\+\d+\,\，]{1,32}$/,
                message: t('sys.org.telephoneErr'),
              },
            ]"
          >
            <span v-if="isReadonly">{{ formState.telephone || '--' }}</span>
            <a-input v-else v-model:value="formState.telephone" :placeholder="t('sys.inputText')" />
          </a-form-item>

          <a-form-item
            :label="t('sys.email')"
            name="email"
            :rules="[
              { type: 'email', message: t('sys.phoneError') },
              { required: !isReadonly && getOrgRequiredFields?.includes('email') },
            ]"
          >
            <span v-if="isReadonly">{{ formState.email || '--' }}</span>
            <a-input v-else v-model:value="formState.email" :placeholder="t('sys.inputText')" />
          </a-form-item>

          <a-form-item :label="t('sys.signatureImage')" name="signatureImage">
            <div class="my4px">
              <a-radio-group v-model:value="formState.signType" :disabled="isReadonly">
                <a-radio :value="signTypeEnum.UPLOAD">
                  {{ $t('sys.upload') }}
                </a-radio>
                <a-radio :value="signTypeEnum.WRITE">
                  {{ $t('sys.write') }}
                </a-radio>
              </a-radio-group>
            </div>

            <cropper-free
              v-if="
                (!isReadonly || formState.signatureImage) &&
                formState.signType === signTypeEnum.UPLOAD
              "
              :modalTitle="t('sys.upload') + t('sys.signaturePic')"
              :disabled="isReadonly"
              :uploadApi="uploadApi"
              v-model:value="formState.signatureImage"
            />
            <span
              v-if="
                isReadonly &&
                !formState.signatureImage &&
                formState.signType === signTypeEnum.UPLOAD
              "
              >--</span
            >
            <div
              v-if="!isReadonly && formState.signType === signTypeEnum.UPLOAD"
              class="text-[#8F8F8F]"
            >
              {{ t('sys.org.uploadType') }}</div
            >

            <div
              v-if="!isReadonly && formState.signType === signTypeEnum.WRITE"
              class="defult-img flex w200px h120px items-center justify-center"
              @click="openWacomModal(isReadonly)"
            >
              <div
                v-if="!formState.signatureImageWrite"
                class="flex flex-col justify-center items-center color-[#434855] cursor-pointer"
              >
                <i class="iconfont icon-qianming1"></i>

                <span>{{ t('sys.add') }}{{ t('sys.signatureImage') }}</span>
              </div>
              <div class="w100% h100% position-relative" v-else>
                <img class="w100% h100%" :src="'/minio/' + formState.signatureImageWrite" />
                <div class="mask">
                  <Icon icon="ant-design:edit-outlined" :size="24" color="#ffffff" />
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item
            v-if="isCreate && getSecurityConfig.enableSignPassword"
            :label="t('sys.platform.signaturePassword')"
            name="signPassword"
            :rules="[
              { required: true },
              {
                validator: useSignDefaultPwd ? undefined : () => checkSignPassword(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input
              v-model:value="formState.signPassword"
              :disabled="useSignDefaultPwd"
              :type="signPasssWordIsVisible ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="getSignPassLabel()"
            >
              <template #suffix>
                <i
                  v-if="signPasssWordIsVisible"
                  class="iconfont icon-chakan1"
                  @click="updateSignPasssWordIsVisible()"
                ></i>
                <i
                  v-else
                  class="iconfont icon-a-baomi1"
                  @click="updateSignPasssWordIsVisible()"
                ></i>
              </template>
            </a-input>
            <a-form-item-rest>
              <a-checkbox v-model:checked="useSignDefaultPwd">
                {{ t('sys.org.intialPassword', { intialPassword: getOrgInitialSignPassword }) }}
              </a-checkbox>
            </a-form-item-rest>
          </a-form-item>

          <a-form-item
            v-if="isReadonly"
            :label="t('sys.userIdentification')"
            name="userIdentification"
          >
            <a-tag v-if="formState.platSeat" :bordered="false" color="success">
              {{ t('sys.org.plat') }}
            </a-tag>
            <a-tag v-if="formState.suiteSeat" :bordered="false" color="processing">
              {{ t('sys.org.kit') }}
            </a-tag>
            <span v-if="!formState.suiteSeat && !formState.platSeat">--</span>
          </a-form-item>
        </a-collapse-panel>
        <div class="divider" v-if="isReadonly && isShowOrgExtFields"></div>

        <!-- 其他信息 -->
        <a-collapse-panel
          key="3"
          v-if="isShowOrgExtFields"
          :header="t('sys.otherInfo')"
          :showArrow="!isReadonly"
        >
          <a-row>
            <a-col v-for="field in getOrgExtFields" :key="field.id" :span="24">
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
                <template v-if="isReadonly">
                  <span v-if="!field.encrypted">{{ formState[field.relationField!] || '--' }}</span>
                  <span v-else>{{ formState[field.relationField!] ? '******' : '--' }}</span>
                </template>
                <template v-else>
                  <a-input
                    v-if="!field.encrypted"
                    v-model:value="formState[field.relationField!]"
                    :placeholder="t('sys.inputText')"
                  />
                  <a-input
                    v-else
                    v-model:value="formState[field.relationField!]"
                    :type="pwdVisibleMap.get(field.id!) ? 'text' : 'password'"
                    autocomplete="new-password"
                    :placeholder="t('sys.inputText')"
                  >
                    <template #suffix>
                      <i
                        v-if="pwdVisibleMap.get(field.id!)"
                        class="iconfont icon-chakan1"
                        @click="updatePwdIsVisible(field)"
                      ></i>
                      <i
                        v-else
                        class="iconfont icon-a-baomi1"
                        @click="updatePwdIsVisible(field)"
                      ></i>
                    </template>
                  </a-input>
                </template>
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>

        <div class="divider" v-if="isReadonly && tenantList.length"></div>

        <!-- 部门信息 -->
        <a-collapse-panel
          v-if="isReadonly && tenantList.length"
          key="4"
          :header="t('sys.org.orgInfo')"
          :showArrow="false"
        >
          <div v-for="(item, idx) in tenantList" :key="idx" class="tanent-info">
            <div class="header">
              <div class="title">
                {{ item?.name }}
                <span class="ml-8px text-[#8F8F8F] font-400">({{ t('sys.affTenant') }})</span>
              </div>
            </div>
            <a-descriptions>
              <a-descriptions-item :label="t('sys.status')">
                <span
                  class="state"
                  :style="{
                    '--status-color': item.enabled ? '#309C41' : '#FF8C4B',
                  }"
                ></span>
                {{
                  item.enabled === UserEnabledEnum.ENABLE
                    ? t('sys.developer.appCenter.enabled')
                    : t('sys.developer.appCenter.notEnabled')
                }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.org.duty')">
                {{ item?.duty || '--' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.org.manager')">
                {{ item?.managerName || '--' }}
              </a-descriptions-item>
            </a-descriptions>
            <div v-for="p in item.userOrgList" :key="p.id" class="dept">
              <div>
                <div class="mb-16px flex">
                  <span class="mr-8px dept-info">{{ t('sys.Dept') }}: </span>
                  <span class="break">{{ getTreeNamePathArr(p.orgId).join('/') }}</span>
                </div>
                <div>
                  <span class="mr-8px dept-info">{{ t('sys.process.DeptManager') }}: </span
                  >{{ p.principal ? t('sys.true') : t('sys.false') }}
                </div>
              </div>
              <div>
                <a-tag color="processing" v-if="p.master">{{ t('sys.org.mainOrg') }}</a-tag>
              </div>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
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
  import { tenantInfoColumn } from '../constant/interface';
  import { UserEnabledEnum } from '/@/components/UserCmp/constant/interface';
  import { uploadApi } from '/@/api/sys/upload';
  import { isEmpty, omit } from 'lodash-es';
  import { UserDto } from '/@/components/UserCmp/types/index.d';
  import type { UserTenantDTO } from '/@/apis/gct-platform/model/index';
  import { validateIsModelName } from '/@/utils/validate';
  import { VueCountryIntl } from '/@/components/VueCountryIntl';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { getOrgListApi } from '/@backend-management/api/org-user/org';
  import { PassRule } from '/@/hooks/platform/types';
  import { metadata, PhoneNumberUtil } from 'google-libphonenumber';
  import WacomModal from '/@portal/views/user-center/component/wacom-modal.vue';
  import Icon from '@/components/Icon/Icon.vue';

  interface IModalData {
    /** 弹框标题 */
    title: string;
    /** 弹框类型 */
    type: 'create' | 'edit' | 'readonly';
    /** 详情信息 */
    info?: UserDto;
  }

  const signTypeEnum = {
    UPLOAD: 'UPLOAD',
    WRITE: 'WRITE',
  };

  const { t } = useI18n();

  const { initTree, getTreeNamePathArr } = useTreeList();

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

  initTree(getOrgListApi);

  /** 最大字符数校验 */
  const maxValidate = { max: 100, message: t('sys.max100') };

  const phoneUtil = PhoneNumberUtil.getInstance();

  const { sha256 } = useSHA256();

  const {
    getOrgInitialPassword,
    getOrgRequiredFields,
    getOrgExtFields,
    getSecurityConfig,
    getOrgInitialSignPassword,
  } = useRootSetting();

  // 获取默认头像
  const globSetting = useGlobSetting();

  const emit = defineEmits(['ok', 'register']);

  const title = ref<string>('');
  const type = ref<'create' | 'edit' | 'readonly'>('create');

  const useDefaultPwd = ref<boolean>(false);

  const useSignDefaultPwd = ref<boolean>(false);

  const formRef = ref<FormInstance>();

  const initData: UserDto = {
    id: undefined,
    avatar: '',
    fullname: '',
    empNo: '',
    birthday: '',
    gender: 1,
    username: '',
    mobile: '',
    password: '',
    telephone: '',
    email: '',
    createTime: '',
    suiteSeat: true,
    platSeat: true,
    country: '+86',
    signType: 'UPLOAD',
    signatureImageWrite: '',
  };

  const formState = reactive<UserDto>(Object.assign({}, initData));

  const tenantList = ref<Array<UserTenantDTO>>([]);

  const isCreate = computed<boolean>(() => type.value === 'create');

  const isEdit = computed<boolean>(() => type.value === 'edit');

  const isReadonly = computed<boolean>(() => type.value === 'readonly');

  const isShowOrgExtFields = computed(() => {
    console.log(getOrgExtFields.value);

    return getOrgExtFields.value && getOrgExtFields.value.length > 0;
  });

  const activeKey = ref([1, 2, 3, 4]);

  const pwdVisibleMap = ref<Map<string, any>>(new Map());

  watch(useDefaultPwd, (val) => {
    if (val) {
      formState.password = getOrgInitialPassword.value ?? '';
      formRef.value?.clearValidate(['password']);
    } else {
      formState.password = '';
    }
  });

  watch(useSignDefaultPwd, (val) => {
    if (val) {
      formState.signPassword = getOrgInitialSignPassword.value ?? '';
      formRef.value?.clearValidate(['signPassword']);
    } else {
      formState.signPassword = '';
    }
  });

  /** 打开上传签名的图片 */
  const openWacomModal = async (isReadonly) => {
    if (isReadonly) {
      return;
    }
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
        title: $t('sys.upload') + $t('sys.signatureImage') + $t('sys.developer.appCenter.appImage'),
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

  // 打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data: IModalData) => {
    if (data) {
      title.value = data.title;
      type.value = data.type;
      if (data.info) {
        onDataReceive(data.info);
        if (data.type === 'readonly') {
          tenantList.value = data.info.tenantList;
        }
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
    Object.assign(formState, data, { country: data.country || '+86' });
  };

  const passsWordIsVisible = ref(false);
  const signPasssWordIsVisible = ref(false);

  const updateSignPasssWordIsVisible = () => {
    signPasssWordIsVisible.value = !signPasssWordIsVisible.value;
  };
  const updatePasssWordIsVisible = () => {
    passsWordIsVisible.value = !passsWordIsVisible.value;
  };

  // 弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    console.warn('visible:', visible);
  };

  const getPassLabel = () => {
    if (!getSecurityConfig.value.enablePassphrase) {
      return t('sys.passwordErrorTip', {
        len: 6,
        text: '数字/大小写字母',
      });
    }
    const passRule = getSecurityConfig.value.passRule;
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
      return getSecurityConfig.value.passMinLength == 16
        ? t('sys.password16ErrorTip', {
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          })
        : t('sys.passwordErrorTip', {
            len: getSecurityConfig.value.passMinLength,
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          });
    } else {
      return t('sys.passLenTip', { text: getSecurityConfig.value.passMinLength });
    }
  };

  const checkPassword = () => {
    if (!formState.password) {
      return Promise.resolve();
    }
    const password = formState.password;
    let flag = true;
    const passRuleStr = getPassLabel();
    if (getSecurityConfig.value.enablePassphrase) {
      flag = validatePassRule(password, 'passRule');
      if (!flag && password) {
        return Promise.reject(passRuleStr);
      }
      if (
        (getSecurityConfig.value.passMinLength &&
          getSecurityConfig.value.passMinLength > password.length) ||
        password.length > 16
      ) {
        return Promise.reject(passRuleStr);
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(password)) {
        return Promise.reject(passRuleStr);
      }
    }
    return Promise.resolve();
  };

  /** 签名密码校验 */
  const getSignPassLabel = () => {
    if (!getSecurityConfig.value.signEnablePassphrase) {
      return t('sys.passwordErrorTip', {
        len: 6,
        text: '数字/大小写字母',
      });
    }
    const passRule = getSecurityConfig.value.signPassRule;
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
      return getSecurityConfig.value.signPassMinLength == 16
        ? t('sys.password16ErrorTip', {
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          })
        : t('sys.passwordErrorTip', {
            len: getSecurityConfig.value.signPassMinLength,
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          });
    } else {
      return t('sys.passLenTip', { text: getSecurityConfig.value.signPassMinLength });
    }
  };

  const checkSignPassword = () => {
    if (!formState.signPassword) {
      return Promise.resolve();
    }
    const password = formState.signPassword;
    let flag = true;
    const passRuleStr = getSignPassLabel();
    if (getSecurityConfig.value.signEnablePassphrase) {
      flag = validatePassRule(password, 'signPassRule');
      if (!flag && password) {
        return Promise.reject(passRuleStr);
      }
      if (
        (getSecurityConfig.value.signPassMinLength &&
          getSecurityConfig.value.signPassMinLength > password.length) ||
        password.length > 16
      ) {
        return Promise.reject(passRuleStr);
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(password)) {
        return Promise.reject(passRuleStr);
      }
    }
    return Promise.resolve();
  };

  const checkPhone = () => {
    if (isReadonly.value || !formState.mobile) {
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
      metadata.countryCodeToRegionCodeMap[+formState.country.replace('+', '')][0],
    );
    const isValite = phoneUtil.isValidNumber(number);

    if (!isValite) {
      return Promise.reject(t('sys.phoneError'));
    }
    return Promise.resolve();
  };

  // 验证登录密码规则
  const validatePassRule = (password, rule) => {
    const regexPatterns: RegExp[] = [];
    if (getSecurityConfig.value[rule]?.includes('NUMBER')) {
      regexPatterns.push(/\d/);
    }
    if (getSecurityConfig.value[rule]?.includes('LOWERCASE')) {
      regexPatterns.push(/[a-z]/);
    }
    if (getSecurityConfig.value[rule]?.includes('UPPERCASE')) {
      regexPatterns.push(/[A-Z]/);
    }
    if (getSecurityConfig.value[rule]?.includes('SPECHARS')) {
      regexPatterns.push(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/);
    }
    if (regexPatterns.every((pattern) => pattern.test(password))) {
      return true;
    } else {
      return false;
    }
  };
  const handleClose = () => {
    formRef.value?.resetFields();
    Object.assign(formState, initData);
    useDefaultPwd.value = false;
    useSignDefaultPwd.value = false;
    tenantList.value = [];
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const pwdParams = {};
      //有密码时需要加密
      if (formState.password) {
        const key = Math.random().toString(16).substring(2, 8);
        Object.assign(pwdParams, {
          password: sha256(formState.password, key),
          signPassword: formState.signPassword ? sha256(formState.signPassword, key) : '',
        });
      }
      emit('ok', {
        info: {
          ...omit(toRaw(formState), ['password']),
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

  const updatePwdIsVisible = (field) => {
    pwdVisibleMap.value.set(field.id, !pwdVisibleMap.value.get(field.id));
  };
</script>
<style scoped lang="less">
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

  .header {
    display: flex;
    align-items: center;
    margin: 10px 0;
    // margin-bottom: 10px;
    padding: 5px 16px;

    .title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .info-box {
    display: flex;
    align-items: center;

    .is-readonly {
      pointer-events: none;
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: calc(100% - 80px);
    height: 60px;
    overflow: hidden;

    .flex {
      align-items: center;
    }
  }

  .info-box:deep(.ant-descriptions-row:last-child > td) {
    padding-bottom: 0;
  }

  .tenant-table {
    .column-enabled {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      > i {
        width: 6px;
        height: 6px;
        margin-right: 8px;
        border-radius: 3px;
        background-color: #00000040;
      }

      &.enable-enabled {
        > i {
          background-color: #00b578;
        }
      }
    }
  }

  .tanent-info {
    padding: 0 16px;

    .header {
      display: flex;
      align-items: center;
      margin: 10px 0;
      // margin-bottom: 10px;
      padding: 5px 0;

      .title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: bold;
      }

      &::before {
        content: ' ';
        height: 12px;
        padding-right: 6px;
        border-left: 3px solid var(--ant-primary-color);
      }
    }

    .dept {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
      background: #ebf2fe;

      .dept-info {
        display: inline-block;
        min-width: 80px;
        color: #8f8f8f;
        text-align: right;
      }
    }
  }

  :deep(.ant-descriptions-item-label) {
    color: #8f8f8f;
  }

  .state {
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-right: 4px;
    margin-bottom: 3px;
    border-radius: 3px;
    background-color: var(--status-color);
  }

  :deep(.ant-descriptions-item-container .ant-descriptions-item-content) {
    align-items: center;
  }

  .user-modal .ant-form-item {
    margin-bottom: 8px;
  }

  .break {
    word-break: break-all;
  }

  :deep(.ant-collapse-content-box) {
    padding: 0 !important;
  }

  :deep(.ant-descriptions-item-content) {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.ant-collapse-header) {
    padding: 8px 0 !important;
    font-weight: bold;
  }

  .divider {
    margin: 16px 0;
    border-bottom: rgb(0 0 0 / 6%) 1px dashed;
  }

  .fullname {
    max-width: calc(100% - 60px);
  }

  .defult-img {
    z-index: 2;
    border: 1px solid #d9d9d9;
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
