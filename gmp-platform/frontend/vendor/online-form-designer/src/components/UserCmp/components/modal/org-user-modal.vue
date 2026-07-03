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
      <a-button v-if="!isDetail" @click="closeModal">{{ t('sys.cancel') }}</a-button>
      <a-button v-if="isDetail" @click="closeModal">{{ t('sys.closeText') }}</a-button>
      <a-button v-if="!isDetail" type="primary" @click="handleOk">
        {{ t('sys.saveText') }}
      </a-button>
    </template>
    <div class="info-box" v-if="isDetail">
      <cropper-avatar
        :uploadApi="uploadApi"
        v-model:value="formState.user.avatar"
        :showBtn="false"
        width="80"
        :class="['ml-20px', 'mr-20px', { 'is-readonly': isReadonly }]"
      />
      <div class="info">
        <div class="flex">
          <div class="ell mr-8px" :title="formState.user.fullname">
            {{ formState.user.fullname }}
          </div>
          <i v-if="formState.user.gender == -1" class="iconfont icon-baomi mr-12px"></i>
          <ManOutlined
            style="color: #3168ec"
            class="mr-12px"
            v-else-if="formState.user.gender == 1"
          />
          <WomanOutlined style="color: #ff748b" class="mr-12px" v-else />
          <a-tag
            class="ell"
            :title="formState.user.duty"
            v-if="formState.user.duty"
            color="processing"
          >
            {{ formState.user.duty }}
          </a-tag>
        </div>

        <a-descriptions :column="4">
          <a-descriptions-item :label="t('sys.userName')">
            <div class="ell" :title="formState.user.username">
              {{ formState.user.username }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.empNo')">
            <div class="ell" :title="formState.user.empNo">
              {{ formState.user.empNo || '--' }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.birthday')">
            <div class="ell" :title="formState.user.empNo">
              {{ formState.user.birthday || '--' }}
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.org.manager')">
            <div class="ell" :title="formState.user.managerName">
              {{ formState.user.managerName || '--' }}
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </div>
    <div class="divider" v-if="isDetail"></div>
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: isDetail ? 4 : 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      :class="{ 'user-modal': isDetail }"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <!-- 基本信息 -->
        <a-collapse-panel v-if="!isDetail" key="1" :header="t('sys.appDesigner.basicInformation')">
          <a-form-item
            v-if="!isDetail"
            :label="t('sys.fullname')"
            :name="['user', 'fullname']"
            :rules="[
              {
                required: !isReadonly,
                message:
                  type !== 'edit'
                    ? t('sys.pageDesigner.pleaseEnterOrSelect') + t('sys.fullname')
                    : t('sys.pleaseInputSth', { sth: t('sys.fullname') }),
              },
              { validator: validateIsModelName },
              maxValidate,
            ]"
          >
            <div class="full-name-container">
              <a-auto-complete
                v-if="type !== 'edit'"
                v-model:value="formState.user.fullname"
                showSearch
                allowClear
                :placeholder="t('sys.pageDesigner.pleaseEnterOrSelect')"
                style="width: 100%"
                :options="requestState.data"
                @change="changeFullname"
                @search="fetchUser"
                @select="onSelect"
                :getPopupContainer="getPopupContainer"
              >
                <template #option="option">
                  <div class="p8x flex items-center">
                    <cropper-avatar
                      :uploadApi="uploadApi"
                      v-model:value="option.info.avatar"
                      :showBtn="false"
                      width="30"
                      :class="['mr-8px', { 'is-readonly': true }]"
                    />
                    <div class="flex options" style="width: calc(100% - 38px)">
                      <div class="fullname ell">{{ option.info.fullname }}</div>
                      <div calss="text-[#888888]">{{ option.info.username }}</div>
                    </div>
                  </div>
                </template>
                <template #menuItemSelectedIcon>
                  <check-outlined style="line-height: 32px" />
                </template>
              </a-auto-complete>
              <a-input
                v-else
                v-model:value="formState.user.fullname"
                :placeholder="t('sys.inputText')"
              />
            </div>
          </a-form-item>
          <a-form-item v-if="!isDetail" :label="t('sys.avatar')" :name="['user', 'avatar']">
            <cropper-avatar
              :key="formState.user.avatar"
              :uploadApi="uploadApi"
              v-model:value="formState.user.avatar"
              :showBtn="false"
              width="80"
              :class="['ml-20px', 'mr-20px', { 'is-readonly': isReadonly }]"
            />
            <div v-if="!isReadonly" class="text-[#8F8F8F]"> {{ t('sys.org.uploadType') }}</div>
          </a-form-item>
          <a-form-item
            v-if="!isDetail"
            :label="t('sys.empNo')"
            :name="['user', 'empNo']"
            :rules="[
              { required: !isReadonly && getOrgRequiredFields?.includes('empNo') },
              { validator: validateIsModelName },
              maxValidate,
            ]"
          >
            <span v-if="isReadonly">{{ formState.user.empNo || '--' }}</span>
            <a-input
              v-else
              v-model:value="formState.user.empNo"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
          <a-form-item v-if="!isDetail" :label="t('sys.gender')" :name="['user', 'gender']">
            <span v-if="isReadonly">{{ genderName }}</span>
            <a-radio-group v-else v-model:value="formState.user.gender">
              <a-radio :value="1">{{ t('sys.male') }}</a-radio>
              <a-radio :value="0">{{ t('sys.female') }}</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="!isDetail" :label="t('sys.birthday')" :name="['user', 'birthday']">
            <span v-if="isReadonly">{{ formState.user.birthday || '--' }}</span>
            <a-date-picker
              v-else
              v-model:value="formState.user.birthday"
              style="width: 100%"
              valueFormat="YYYY-MM-DD"
              :placeholder="t('sys.chooseText')"
            />
          </a-form-item>
          <a-form-item
            v-if="!isDetail"
            :label="t('sys.org.duty')"
            :name="['user', 'duty']"
            :rules="[maxValidate]"
          >
            <a-input v-model:value="formState.user.duty" :placeholder="t('sys.inputText')" />
          </a-form-item>

          <a-form-item v-if="!isDetail" :label="t('sys.org.manager')" :name="['user', 'managerId']">
            <a-select
              v-model:value="formState.user.managerId"
              :showSearch="true"
              :placeholder="t('sys.chooseText')"
              :options="managerList"
              :filter-option="
                (input: string, option: any) => {
                  return option.label.indexOf(input.toLowerCase()) >= 0;
                }
              "
            >
              <template #option="option">
                <div
                  class="p8x flex items-center"
                  :title="`用户名：${option.fullname}&#10;账号名：${
                    option.username
                  }&#10;部门：${option.orgNames.join('/')}`"
                >
                  <cropper-avatar
                    :uploadApi="uploadApi"
                    v-model:value="option.avatar"
                    :showBtn="false"
                    width="30"
                    :class="['mr-8px', { 'is-readonly': true }]"
                  />
                  <div class="flex w100% manager">
                    <div class="flex manager-info">
                      <div class="fullname mr-8px ell">{{ option.fullname }}</div>
                      <div class="text-[#888888]">{{ option.username }}</div>
                    </div>
                    <div class="text-[#888888]">
                      {{ option.orgNames.join('/') }}
                    </div>
                  </div>
                </div>
              </template>
            </a-select>
            <span class="text-[#8F8F8F]"> {{ t('sys.org.managerIdTip') }}</span>
          </a-form-item>
        </a-collapse-panel>

        <!-- 账号信息 -->
        <a-collapse-panel key="2" :header="t('sys.userNameInfo')" :showArrow="!isDetail">
          <a-form-item
            v-if="!isDetail"
            :label="t('sys.userName')"
            :name="['user', 'username']"
            :rules="[
              { required: !isReadonly && isCreate },
              { validator: validateIsModelName },
              maxValidate,
            ]"
          >
            <span v-if="isReadonly || !isCreate">{{ formState.user.username }}</span>
            <a-input
              v-else
              v-model:value="formState.user.username"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>

          <a-form-item
            :label="t('sys.mobile')"
            :name="['user', 'mobile']"
            :rules="[
              { required: !isReadonly && getOrgRequiredFields?.includes('mobile') },
              {
                validator: () => checkPhone(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <span v-if="isReadonly">
              {{
                formState.user.mobile ? formState.user.country + ' ' + formState.user.mobile : '--'
              }}
            </span>
            <div v-if="!isReadonly" class="phone-country">
              <VueCountryIntl v-model:value="formState.user.country" />
            </div>
            <a-input
              v-if="!isReadonly"
              v-model:value="formState.user.mobile"
              style="width: calc(100% - 84px); border-radius: 0 4px 4px 0"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>

          <a-form-item
            v-if="isCreate && !useReadonly"
            :label="t('sys.password')"
            :name="['user', 'password']"
            :rules="[
              { required: true },
              {
                validator: useDefaultPwd ? undefined : () => checkPassword(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input
              v-model:value="formState.user.password"
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
                @change="() => formRef?.clearValidate([['user', 'password']])"
              >
                {{ t('sys.org.intialPassword', { intialPassword: getOrgInitialPassword }) }}
              </a-checkbox>
            </a-form-item-rest>
          </a-form-item>

          <a-form-item
            :label="t('sys.telephone')"
            :name="['user', 'telephone']"
            :rules="[
              {
                pattern: /^[\-\+\d+\,\，]{1,32}$/,
                message: t('sys.org.telephoneErr'),
              },
            ]"
          >
            <span v-if="isReadonly">{{ formState.user.telephone || '--' }}</span>
            <a-input
              v-else
              v-model:value="formState.user.telephone"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>

          <a-form-item
            :label="t('sys.email')"
            :name="['user', 'email']"
            :rules="[
              { type: 'email', message: t('sys.phoneError') },
              { required: !isReadonly && getOrgRequiredFields?.includes('email') },
            ]"
          >
            <span v-if="isReadonly">{{ formState.user.email || '--' }}</span>
            <a-input
              v-else
              v-model:value="formState.user.email"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
          <a-form-item :label="t('sys.signatureImage')" name="signatureImage">
            <div class="my4px">
              <a-radio-group v-model:value="formState.user.signType" :disabled="isReadonly">
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
                (!isReadonly || formState.user.signatureImage) &&
                formState.user.signType === signTypeEnum.UPLOAD
              "
              :disabled="isReadonly"
              :uploadApi="uploadApi"
              v-model:value="formState.user.signatureImage"
            />
            <span
              v-if="
                isReadonly &&
                !formState.user.signatureImage &&
                formState.user.signType === signTypeEnum.UPLOAD
              "
              >--</span
            >
            <div
              v-if="!isReadonly && formState.user.signType === signTypeEnum.UPLOAD"
              class="text-[#8F8F8F]"
            >
              {{ t('sys.org.uploadType') }}</div
            >
            <div
              v-if="!isReadonly && formState.user.signType === signTypeEnum.WRITE"
              class="defult-img flex w200px h120px items-center justify-center cursor-pointer"
              @click="openWacomModal(isReadonly)"
            >
              <div v-if="!formState.user.signatureImageWrite">
                <i class="iconfont icon-qianming1"></i>
                <span class="ml-1">{{ t('sys.add') }}{{ t('sys.signatureImage') }}</span>
              </div>
              <div class="w100% h100% position-relative" v-else>
                <img class="w100% h100%" :src="'/minio/' + formState.user.signatureImageWrite" />
                <div class="mask">
                  <Icon icon="ant-design:edit-outlined" :size="24" color="#ffffff" />
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item
            v-if="isCreate && !useReadonly && getSecurityConfig.enableSignPassword == 1"
            :label="t('sys.platform.signaturePassword')"
            :name="['user', 'signPassword']"
            :rules="[
              { required: true },
              {
                validator: useSignDefaultPwd ? undefined : () => checkSignPassword(),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input
              v-model:value="formState.user.signPassword"
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
            v-if="!inEDHRApp && isReadonly"
            :label="t('sys.userIdentification')"
            name="userIdentification"
          >
            <a-tag v-if="formState.user.platSeat" :bordered="false" color="success">
              {{ t('sys.org.plat') }}
            </a-tag>
            <a-tag v-if="formState.user.suiteSeat" :bordered="false" color="processing">
              {{ t('sys.org.kit') }}
            </a-tag>
            <span v-if="!formState.user.suiteSeat && !formState.user.platSeat">--</span>
          </a-form-item>
        </a-collapse-panel>
        <div class="divider" v-if="isDetail && isShowOrgExtFields"></div>
        <!-- 其他信息 -->
        <a-collapse-panel
          v-if="isShowOrgExtFields"
          key="3"
          :header="t('sys.otherInfo')"
          :showArrow="!isDetail"
        >
          <a-row>
            <a-col v-for="field in getOrgExtFields" :key="field.id" :span="24">
              <a-form-item
                :label="field.fieldName"
                :name="['user', field.relationField!]"
                :rules="[
                  { required: field.required === 1 },
                  {
                    validator: validateNUM(
                      formState.user[field.relationField!],
                      field.relationField!,
                    ),
                    trigger: ['blur', 'change'],
                  },
                ]"
              >
                <template v-if="isReadonly">
                  <span v-if="!field.encrypted">{{
                    formState.user[field.relationField!] || '--'
                  }}</span>
                  <span v-else>{{ formState.user[field.relationField!] ? '******' : '--' }}</span>
                </template>
                <template v-else>
                  <a-input
                    v-if="!field.encrypted"
                    v-model:value="formState.user[field.relationField!]"
                    :placeholder="t('sys.inputText')"
                  />
                  <a-input
                    v-else
                    v-model:value="formState.user[field.relationField!]"
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
        <div class="divider" v-if="isDetail"></div>
        <!-- 部门信息 -->
        <a-collapse-panel key="4" :header="t('sys.org.orgInfo')" :showArrow="!isDetail">
          <div style="margin-bottom: 12px; float: right">
            <a-button v-if="!isDetail" class="dept-btn" @click="handleAddOrgList">
              <template #icon>
                <plus-outlined />
              </template>
              {{ t('sys.add') + t('sys.org.dept') }}
            </a-button>
          </div>
          <a-table
            v-if="!isDetail"
            class="form-table"
            :pagination="false"
            :dataSource="formState.userOrgList"
            :columns="userOrgColumns"
            size="middle"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'orgId'">
                <div style="display: flex; align-items: center">
                  <a-form-item
                    :name="['userOrgList', index, 'orgId']"
                    label=""
                    class="slected-dept"
                    :rules="[
                      {
                        required: true,
                        message: t('sys.pleaseSelectSth', {
                          sth: t('sys.Dept'),
                        }),
                      },
                    ]"
                    :wrapper-col="{ span: 24 }"
                    style="flex: 1; margin-right: 5px"
                  >
                    <span v-if="isDetail">{{ record.orgList.join('/') }}</span>

                    <a-tree-select
                      v-else
                      show-search
                      v-model:value="formState.userOrgList[index].orgId"
                      :show-checked-strategy="TreeSelect.SHOW_PARENT"
                      :fieldNames="{ children: 'children', label: 'name', value: 'id' }"
                      :height="233"
                      style="width: 300px"
                      :tree-data="filterTreeData"
                      tree-default-expand-all
                      treeNodeLabelProp="userOrgName"
                      treeNodeFilterProp="name"
                      @select="handleChangeOrg"
                      :dropdownStyle="{ 'min-width': '500px' }"
                      :placeholder="t('sys.chooseText')"
                    />
                  </a-form-item>
                  <a-tag color="processing" v-if="record.master">{{ t('sys.org.mainOrg') }}</a-tag>
                </div>
              </template>

              <template v-if="column.dataIndex === 'principal'">
                <a-form-item
                  :name="['userOrgList', index, 'principal']"
                  label=""
                  :rules="[{ required: true }]"
                  :wrapper-col="{ span: 24 }"
                >
                  <a-switch
                    :disabled="isDetail"
                    v-model:checked="formState.userOrgList[index].principal"
                    :checkedValue="1"
                    :unCheckedValue="0"
                    size="small"
                  />
                </a-form-item>
              </template>
              <template v-if="column.dataIndex === 'action'">
                <div style="text-align: right">
                  <a-button
                    v-if="!record.master"
                    type="link"
                    @click="setMaster(index)"
                    :disabled="record.master ? true : false"
                    style="padding-left: 0"
                  >
                    {{ t('sys.org.setMainOrg') }}
                  </a-button>
                  <a-divider v-if="!record.master" type="vertical" />
                  <a-button
                    type="text"
                    @click="deleteOrg(index, record)"
                    v-if="formState.userOrgList.length !== 1"
                  >
                    {{ t('sys.delete') }}
                  </a-button>
                </div>
              </template>
            </template>
          </a-table>
          <div v-else class="pl-16px pr-16px">
            <div v-for="(p, idx) in formState.userOrgList" :key="idx" class="dept">
              <div>
                <div class="mb-16px flex">
                  <span class="mr-8px dept-info">{{ t('sys.Dept') }}: </span>
                  <span class="break">
                    {{ getTreeNamePathArr(p.orgId).join('/') }}
                  </span>
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
<script setup lang="ts" name="org-user-modal">
  import { ref, reactive, watch, toRaw, computed } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CropperAvatar, CropperFree } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { isEmpty, debounce, omit } from 'lodash-es';
  import { userOrgColumns } from '../../constant/interface';
  import { getOrgUserListCurrentTenantUser } from '/@/apis/gct-platform/OrgController';
  import { getUserPageList } from '/@/apis/gct-platform/UserController';
  import { VueCountryIntl } from '/@/components/VueCountryIntl';
  import type { FormInstance, SelectProps } from 'ant-design-vue';
  import type { OrgUserDto, userOrgDto } from '/@/components/UserCmp/types/index.d';
  import { validateIsModelName } from '/@/utils/validate';
  import { PassRule } from '/@/hooks/platform/types';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { metadata, PhoneNumberUtil } from 'google-libphonenumber';
  import WacomModal from '/@portal/views/user-center/component/wacom-modal.vue';
  import Icon from '@/components/Icon/Icon.vue';

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  interface IModalData {
    /** 弹框标题 */
    title: string;
    /** 弹框类型 */
    type: 'create' | 'edit' | 'detail';
    /** 详情信息 */
    info?: OrgUserDto;
    api?: any;
  }
  const signTypeEnum = {
    UPLOAD: 'UPLOAD',
    WRITE: 'WRITE',
  };
  interface FormState {
    user: OrgUserDto;
    userOrgList: userOrgDto[];
  }

  interface RequestState {
    data?: Array<any>;
    value?: string;
    searchValue?: string;
    fetching: boolean;
    duty: string;
    managerId?: string;
  }

  const { t } = useI18n();

  const genderOptions = [
    {
      value: -1,
      label: t('sys.keepSecret'),
    },
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

  /** 最大字符数校验 */
  const maxValidate = { max: 100, message: t('sys.max100') };

  const { sha256 } = useSHA256();

  const {
    getOrgInitialPassword,
    getOrgRequiredFields,
    getOrgExtFields,
    getSecurityConfig,
    getOrgInitialSignPassword,
  } = useRootSetting();

  const phoneUtil = PhoneNumberUtil.getInstance();

  // 获取默认头像
  const globSetting = useGlobSetting();

  const { selectTreeNode, getTreeNamePathArr, getFilterTreeData, treeOrignalData } = useTreeList();

  const emit = defineEmits(['ok', 'register']);

  const title = ref<string>('');
  const type = ref<'create' | 'edit' | 'detail'>();

  const useDefaultPwd = ref<boolean>(false);

  const useSignDefaultPwd = ref<boolean>(false);

  /** 选择用户后是否页面只读 */
  const useReadonly = ref<boolean>(false);
  /** 是否请求过用户数据了 */
  const isRequest = ref<boolean>(false);

  const filterTreeData = ref<Array<any>>([]);

  const managerList = ref<SelectProps['options']>([]);

  const formRef = ref<FormInstance>();

  const initUserData: OrgUserDto = {
    id: undefined,
    avatar: '',
    fullname: '',
    empNo: '',
    duty: '',
    managerId: undefined,
    birthday: '',
    gender: 1,
    username: '',
    mobile: '',
    password: '',
    signPassword: '',
    telephone: '',
    email: '',
    createTime: '',
    suiteSeat: true,
    platSeat: true,
    country: '+86',
    signatureImage: '',
    signatureImageWrite: '',
    signType: 'UPLOAD',
  };

  const initRequestData: RequestState = {
    data: [],
    value: undefined,
    searchValue: undefined,
    fetching: false,
    duty: '',
    managerId: undefined,
  };

  const activeKey = ref([1, 2, 3, 4]);

  const requestState = reactive<RequestState>(Object.assign({}, initRequestData));

  const formState = reactive<FormState>({
    user: Object.assign({}, initUserData),
    userOrgList: [],
  });

  const detailApi = ref();

  const isCreate = computed<boolean>(() => type.value === 'create');

  const isEdit = computed<boolean>(() => type.value === 'edit');

  const isDetail = computed<boolean>(() => type.value === 'detail');

  /** 如果是详情页或者选择用户后 页面是否只读显示 */
  const isReadonly = computed<boolean>(() => isDetail.value || useReadonly.value);

  const passsWordIsVisible = ref(false);

  const isShowOrgExtFields = computed(() => {
    return getOrgExtFields.value && getOrgExtFields.value.length > 0;
  });

  const genderName = computed(() => {
    return genderOptions.find((opt) => opt.value === formState.user.gender)?.label;
  });

  const pwdVisibleMap = ref<Map<string, any>>(new Map());

  watch(useDefaultPwd, (val) => {
    if (val) {
      formState.user.password = getOrgInitialPassword.value ?? '';
    } else {
      formState.user.password = '';
    }
  });

  watch(useSignDefaultPwd, (val) => {
    if (val) {
      formState.user.signPassword = getOrgInitialSignPassword.value ?? '';
      formRef.value?.clearValidate([['user', 'signPassword']]);
    } else {
      formState.user.signPassword = '';
    }
  });

  watch(
    () => formState.userOrgList,
    (val) => {
      if (val) {
        const selectIds = val.map((i) => i.orgId);
        treeOrignalData.value.forEach((i) => {
          if (selectIds.includes(i.id)) {
            i.disabled = true;
          } else {
            i.disabled = false;
          }
        });
        filterTreeData.value = getFilterTreeData(selectTreeNode.node);
      }
    },
    { deep: true },
  );

  // watch(
  //   () => requestState.value,
  //   () => {
  //     requestState.data = [];
  //     requestState.fetching = false;
  //     requestState.searchValue = '';
  //   },
  // );

  watch([managerList, isEdit, isDetail], ([list, editStatus, detailStatus]) => {
    if (
      (editStatus || detailStatus) &&
      list?.length &&
      formState.user.managerId &&
      !list.some((item) => item.value === formState.user.managerId)
    ) {
      formState.user.managerId = undefined;
      formState.user.managerName = '';
    }
  });

  const signPasssWordIsVisible = ref(false);

  const updateSignPasssWordIsVisible = () => {
    signPasssWordIsVisible.value = !signPasssWordIsVisible.value;
  };

  const updatePasssWordIsVisible = () => {
    passsWordIsVisible.value = !passsWordIsVisible.value;
  };

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
        url: formState.user.signatureImageWrite
          ? '/minio/' + formState.user.signatureImageWrite
          : '',
        username: formState.user.fullname,
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
      formState.user.signatureImageWrite = res.params.url;
    }
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
    if (!formState.user.password) {
      return Promise.resolve();
    }
    const password = formState.user.password;
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
    if (!formState.user.signPassword) {
      return Promise.resolve();
    }
    const password = formState.user.signPassword;
    let flag = true;
    const passRuleStr = getPassLabel();
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
    if (isReadonly.value || !formState.user.mobile) {
      return Promise.resolve();
    }
    if (
      !Number.isFinite(+formState.user.mobile) ||
      formState.user.mobile.length === 1 ||
      formState.user.mobile.length >= 17
    ) {
      return Promise.reject(t('sys.phoneError'));
    }
    if (!metadata.countryCodeToRegionCodeMap[+formState.user.country?.replace('+', '')]) {
      return Promise.resolve();
    }
    const number = phoneUtil.parseAndKeepRawInput(
      formState.user.mobile,
      metadata.countryCodeToRegionCodeMap[+formState.user.country?.replace('+', '')][0],
    );
    const isValite = phoneUtil.isValidNumber(number);

    if (!isValite) {
      return Promise.reject(t('sys.phoneError'));
    }
    return Promise.resolve();
  };

  // 验证规则
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

  // 打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data: IModalData) => {
    if (data) {
      title.value = data.title;
      type.value = data.type;
      if (data.info) {
        onDataReceive(data.info);
      } else {
        getOrgExtFields.value?.forEach((field) => {
          formState[field.relationField!] = '';
        });
      }
      if (data.api) {
        detailApi.value = data.api;
      }
    }
    getUserPageLists();
  });

  const onDataReceive = (data) => {
    formState.user = Object.assign({}, initUserData, {
      ...omit(data, ['userOrgList', 'userId', 'country']),
      id: data.userId,
      country: data.country || '+86',
    });
    formState.userOrgList = data.userOrgList.map((item) => {
      return {
        orgId: item.orgId,
        orgName: item.orgName,
        orgList: getTreeNamePathArr(item.orgId),
        master: item.master,
        principal: item.principal,
      };
    });
  };

  const fetchUser = debounce((value) => {
    // requestState.data = [];
    // requestState.searchValue = '';

    // if (isEmpty(value)) {
    //   return;
    // }
    requestState.fetching = true;

    getUserPageList({
      fullname: value,
      pageNo: 1,
      pageSize: 1000,
    }).then((res) => {
      requestState.data = (res?.data ?? []).map((user) => {
        return {
          value: user.id,
          label: user.fullname,
          info: user,
        };
      });
      requestState.fetching = false;
      requestState.searchValue = value;
      formState.user.fullname = value;
      formRef.value?.validateFields([['user', 'fullname']]);
    });
  }, 300);

  /** 初始化获取用户下拉选项 */
  const getUserPageLists = () => {
    getUserPageList({
      fullname: formState.user.fullname,
      pageNo: 1,
      pageSize: 1000,
    }).then((res) => {
      requestState.data = (res?.data ?? []).map((user) => {
        return {
          value: user.id,
          label: user.fullname,
          info: user,
        };
      });
      requestState.fetching = false;
    });
  };

  const changeFullname = () => {
    formRef.value.clearValidate();
    if (useReadonly.value) {
      formState.user = Object.assign({}, initUserData, { fullname: formState.user.fullname });
    }
    useReadonly.value = false;
  };

  const onSelect = async (value, options) => {
    isRequest.value = true;

    if (options.info.id === '-1') {
      useReadonly.value = false;
    } else {
      useReadonly.value = true;
      const data = await detailApi.value({
        orgId: selectTreeNode.node.id,
        userId: options.info.id,
      });

      options.info.suiteSeat = !!data.suiteSeat;
      options.info.platSeat = !!data.platSeat;

      if (Array.isArray(data.userOrgList) && data.userOrgList.length !== 0) {
        formState.userOrgList.forEach((item) => {
          item.master = 0;
        });

        const orgIds = data.userOrgList.map((item) => item.orgId);
        formState.userOrgList = formState.userOrgList.filter(
          (item) => !orgIds.includes(item.orgId),
        );

        data.userOrgList.forEach((item) => {
          formState.userOrgList.unshift({
            orgId: item.orgId,
            orgName: item.orgName,
            orgList: getTreeNamePathArr(item.orgId),
            master: item.master,
            principal: item.principal,
          });
        });
      }
    }

    formState.user = Object.assign(
      {},
      { ...initUserData },
      {
        ...options.info,
        id: options.info.id === '-1' ? undefined : options.info.id,
        duty: requestState.duty,
        managerId: requestState.managerId,
        suiteSeat: options.info.id === '-1' ? true : options.info.suiteSeat,
        platSeat: options.info.id === '-1' ? true : options.info.platSeat,
      },
    );
    Object.assign(requestState, initRequestData);
    requestState.data = [options];
    console.log('requestState.data', requestState.data);
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

  /** 选择组织 */
  const handleChangeOrg = (index, node) => {
    node.disabled = true;
  };

  /** 添加新的组织 */
  const handleAddOrgList = () => {
    formState.userOrgList.push({
      orgId: undefined,
      orgName: '',
      principal: 0,
      master: 0,
      orgList: [],
    });
    if (formState.userOrgList.length == 1) {
      //如果添加完只有一条数据的话 直接将其设置为主部门
      formState.userOrgList[0].master = 1;
    }
  };

  /** 设为主部门 */
  const setMaster = (index) => {
    formState.userOrgList.forEach((d, i) => {
      if (i === index) {
        d.master = 1;
      } else {
        d.master = 0;
      }
    });
  };

  const getPopupContainer = () => {
    return document.body.querySelector('.full-name-container') || document.body;
  };

  /** 删除一条记录 */
  const deleteOrg = (index, record) => {
    formState.userOrgList.splice(index, 1);
    if (record.master) {
      formState.userOrgList[0].master = 1;
    }
  };

  const initState = () => {
    useDefaultPwd.value = false;
    useSignDefaultPwd.value = false;
    isRequest.value = false;
    useReadonly.value = false;
    filterTreeData.value = [];
    managerList.value = [];
  };

  // 弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    console.warn('visible:', visible);
    if (visible) {
      initState();
      // 初始化
      formState.userOrgList.push({
        orgId: selectTreeNode.node.id,
        orgName: getTreeNamePathArr(selectTreeNode.node.id).join('/'),
        master: 1,
        principal: 0,
        orgList: getTreeNamePathArr(selectTreeNode.node.id),
      });

      filterTreeData.value = getFilterTreeData(selectTreeNode.node);
      managerList.value = (
        (await getOrgUserListCurrentTenantUser({
          orgId: selectTreeNode.node.id,
        })) ?? []
      )
        .filter((i) => i.enabled)
        .map((item) => {
          return {
            ...item,
            value: item.userId,
            label: item.fullname,
          };
        });
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.user = Object.assign({}, initUserData);
    formState.userOrgList = [];
    Object.assign(requestState, initRequestData);
    initState();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const params = {};
      if (useReadonly.value) {
        Object.assign(params, {
          duty: formState.user.duty,
          managerId: formState.user.managerId,
          orgId: selectTreeNode.node.id,
          userId: formState.user.id,
          platSeat: formState.user.platSeat,
          suiteSeat: formState.user.suiteSeat,
          userOrgList: [...toRaw(formState.userOrgList)],
        });
      } else {
        const pwdParams = {};
        // 有密码时需要加密
        if (formState.user.password) {
          const key = Math.random().toString(16).substring(2, 8);
          Object.assign(pwdParams, {
            password: sha256(formState.user.password, key),
            signPassword: formState.user.signPassword
              ? sha256(formState.user.signPassword, key)
              : '',
          });
        }
        Object.assign(params, {
          ...omit(formState.user, ['id', 'password']),
          ...pwdParams,
          userId: formState.user.id,
          userOrgList: [...toRaw(formState.userOrgList)],
          orgId: selectTreeNode.node.id,
        });
      }
      emit('ok', {
        info: { ...params },
        type: type.value,
        isAddUser: useReadonly.value,
        callback: closeModal,
      });
    });
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
    justify-content: space-between;
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
  }

  .is-readonly {
    pointer-events: none;
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

  .request-box:deep(.ant-descriptions-row > .ant-descriptions-item + .ant-descriptions-item) {
    padding-left: 16px;
  }

  .info-box:deep(.ant-descriptions-row:last-child > td) {
    padding-bottom: 0;
  }

  .form-table :deep(.ant-form-item) {
    margin-bottom: 0;
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

  .options {
    justify-content: space-between;
  }

  :deep(.ant-select-item-option-content) {
    width: 100%;
  }

  .fullname {
    max-width: calc(100% - 76px);
  }

  .manager {
    flex-direction: column;

    .manager-info {
      justify-content: space-between;
    }
  }

  :deep(.ant-descriptions-item-label) {
    color: #8f8f8f;
  }

  .dept-btn {
    color: var(--ant-primary-color);
  }

  :deep(.slected-dept .ant-form-item-explain) {
    position: absolute;
    top: 32px;
  }

  :deep(.ant-tag-processing) {
    border-color: #ecf1fd;
    background: #ecf1fd;
    color: #3168ec;
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

  :deep(.ant-collapse-header) {
    padding: 8px 0 !important;
    font-weight: bold;
  }

  .divider {
    margin: 16px 0;
    border-bottom: rgb(0 0 0 / 6%) 1px dashed;
  }

  :deep(.ant-descriptions-item-content) {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.ant-tag) {
    max-width: 125px;
  }

  .popup-class {
    width: 500px;
  }

  .full-name-container {
    position: relative;
  }

  .defult-img {
    z-index: 2;
    border: 1px solid #d9d9d9;
    background: #fafafa;
  }
</style>
<style lang="less">
  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    background-color: hsl(from var(--ant-primary-color) h s 95%);
  }

  .ant-select-tree-title,
  .ant-select-tree-node-content-wrapper {
    word-wrap: break-word; /* 旧版浏览器支持 */
    overflow-wrap: break-word; /* 标准属性 */
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
