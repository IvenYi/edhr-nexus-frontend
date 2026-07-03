<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? `${t('sys.edit')}${t('sys.user')}` : `${t('sys.new')}${t('sys.user')}`"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <div class="info-box">
      <cropper-avatar
        :uploadApi="uploadApi"
        v-model:value="formState.user.avatar"
        :showBtn="false"
        width="80"
        style="margin-left: 20px; margin-right: 20px"
      />
      <a-descriptions>
        <a-descriptions-item :label="t('sys.fullname')">{{
          formState.user.fullname
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.mobile')">{{
          formState.user.mobile
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.userName')">{{
          formState.user.username
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.empNo')">{{
          formState.user.empNo
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.registerTime')">{{
          formState.user.createTime
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.email')">{{
          formState.user.email
        }}</a-descriptions-item>
      </a-descriptions>
    </div>
    <a-divider orientation="left"> {{ t('sys.org.userInfo') }}</a-divider>
    <a-form
      ref="userFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-row>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.fullname')"
            :name="['user', 'fullname']"
            :rules="[{ required: true }]"
          >
            <a-input
              v-model:value="formState.user.fullname"
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
            :name="['user', 'empNo']"
            :rules="[{ required: getOrgRequiredFields?.includes('empNo') }]"
          >
            <a-input
              v-model:value="formState.user.empNo"
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
          <a-form-item :label="t('sys.org.manager')" :name="['user', 'managerId']">
            <a-select
              v-model:value="formState.user.managerId"
              :placeholder="
                t('sys.pleaseSelectSth', {
                  sth: t('sys.org.manager'),
                })
              "
            >
              <a-select-option v-for="manager in managerList" :value="manager.id">{{
                manager.nameDuplicate ? `[${manager.empNo}]${manager.fullname}` : manager.fullname
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.birthday')" :name="['user', 'birthday']">
            <a-date-picker
              v-model:value="formState.user.birthday"
              style="width: 100%"
              valueFormat="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.gender')" :name="['user', 'gender']">
            <a-select
              v-model:value="formState.user.gender"
              :placeholder="
                t('sys.pleaseSelectSth', {
                  sth: t('sys.gender'),
                })
              "
            >
              <a-select-option :value="-1">{{ t('sys.keepSecret') }}</a-select-option>
              <a-select-option :value="0">{{ t('sys.female') }}</a-select-option>
              <a-select-option :value="1">{{ t('sys.male') }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-divider orientation="left"> {{ t('sys.userNameInfo') }}</a-divider>
      <a-row>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.userName')"
            :name="['user', 'username']"
            :rules="[{ required: true }]"
          >
            <a-input
              v-model:value="formState.user.username"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.userName'),
                })
              "
              :maxlength="32"
              show-count
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            :label="t('sys.mobile')"
            :name="['user', 'mobile']"
            :rules="[{ required: getOrgRequiredFields?.includes('mobile') }]"
          >
            <a-input
              v-model:value="formState.user.mobile"
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
        <a-col :span="12" v-if="!isEdit">
          <a-form-item
            :label="t('sys.password')"
            :name="['user', 'password']"
            :rules="[
              { required: true },
              { validator: checkPassword, trigger: 'change' },
              { pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/, message: t('sys.passwordFormatError') },
            ]"
          >
            <a-input-password
              v-model:value="formState.user.password"
              :disabled="isDefaultPassword"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.password'),
                })
              "
            />
            <a-form-item-rest
              ><a-checkbox v-model:checked="isDefaultPassword">{{
                t('sys.org.intialPassword', { intialPassword: getOrgInitialPassword })
              }}</a-checkbox></a-form-item-rest
            >
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="!isEdit">
          <a-form-item
            :label="t('sys.confirmPassword')"
            :name="['user', 'confirmPassword']"
            :rules="[
              { required: true },
              { validator: checkPassword, trigger: 'change' },
              { pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/, message: t('sys.passwordFormatError') },
            ]"
          >
            <a-input-password
              v-model:value="formState.user.confirmPassword"
              :disabled="isDefaultPassword"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: t('sys.confirmPassword'),
                })
              "
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.telephone')" :name="['user', 'telephone']">
            <a-input
              v-model:value="formState.user.telephone"
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
            :name="['user', 'email']"
            :rules="[{ type: 'email' }, { required: getOrgRequiredFields?.includes('email') }]"
          >
            <a-input
              v-model:value="formState.user.email"
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
      </a-row>
      <a-divider orientation="left"> {{ t('sys.org.orgInfo') }}</a-divider>
      <a-button type="primary" @click="handleAddDepartmentList" style="margin-bottom: 15px">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.add') }}
      </a-button>
      <a-table
        class="form-table"
        :pagination="false"
        :dataSource="formState.userDepartmentList"
        :columns="userDepartmentColumns"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'orgId'">
            <div style="display: flex; align-items: center">
              <a-form-item
                :name="['userDepartmentList', index, 'orgId']"
                label=""
                :rules="[{ required: true }]"
                :wrapper-col="{ span: 24 }"
                style="flex: 1; margin-right: 5px"
              >
                <a-tree-select
                  show-search
                  v-model:value="formState.userDepartmentList[index].orgId"
                  :show-checked-strategy="TreeSelect.SHOW_PARENT"
                  :fieldNames="{ children: 'children', label: 'name', value: 'id' }"
                  :height="233"
                  :tree-data="treeData"
                  tree-default-expand-all
                  treeNodeFilterProp="name"
                  @change="handleChangeOrg(index)"
                />
              </a-form-item>
              <key-outlined v-if="record.master" />
            </div>
          </template>
          <template v-if="column.dataIndex === 'orgName'">
            <span>{{ record.departmentList.join('/') }}</span>
          </template>
          <template v-if="column.dataIndex === 'principal'">
            <a-form-item
              :name="['userDepartmentList', index, 'principal']"
              label=""
              :rules="[{ required: true }]"
              :wrapper-col="{ span: 24 }"
            >
              <a-switch
                v-model:checked="formState.userDepartmentList[index].principal"
                :checkedValue="1"
                :unCheckedValue="0"
              />
            </a-form-item>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <div v-if="!record.master">
              <a-button
                type="link"
                @click="setMaster(index)"
                :disabled="record.master ? true : false"
                >{{ t('sys.org.setMainOrg') }}</a-button
              >
              <a-button
                type="link"
                danger
                @click="deleteDepartment(index)"
                :disabled="formState.userDepartmentList.length == 1"
                >{{ t('sys.delete') }}</a-button
              >
            </div>
          </template>
        </template>
      </a-table>
      <a-divider orientation="left">其他信息</a-divider>
      <a-row v-if="getOrgExtFields && getOrgExtFields.length > 0">
        <a-col v-for="field in getOrgExtFields" :key="field.id" :span="12">
          <a-form-item :label="field.fieldName" :rules="[{ required: field.required === 1 }]">
            <a-input
              v-model:value="formState.user[field.relationField!]"
              :placeholder="
                t('sys.pleaseInputSth', {
                  sth: field.fieldName,
                })
              "
              :maxlength="32"
              show-count
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref, reactive, toRaw, watch } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CropperAvatar } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { PlusOutlined, KeyOutlined } from '@ant-design/icons-vue';
  import { userDepartmentColumns } from '../constant/index';
  import { TreeSelect } from 'ant-design-vue';
  import useUser from '/@backend-management/hooks/useUser';
  import useTreeList from '/@backend-management/hooks/useTreeList';
  import { UserDto } from '../types/org-user.d';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isEmpty } from 'lodash-es';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  const { t } = useI18n();
  const emit = defineEmits(['ok', 'register']);
  const { sha256 } = useSHA256();
  const { getOrgExtFields } = useRootSetting();
  const key = Math.random().toString(16).substring(2, 8);
  //初始化组织树
  const { treeData, selectTreeNode, getTreeNamePathArr } = useTreeList();
  // 获取默认头像
  const globSetting = useGlobSetting();
  const { getOrgInitialPassword, getOrgRequiredFields } = useRootSetting();

  //初始化直属上级的下拉框数据
  const { getUserListByKey } = useUser();
  const managerList = ref<any[]>([]);

  const isEdit = ref(false);
  const userFormRef = ref<FormInstance>();

  const formState = reactive<UserDto>({
    user: {
      id: undefined,
      avatar: globSetting.defaultAvatar,
      fullname: '',
      empNo: '',
      managerId: undefined,
      birthday: '',
      gender: -1,
      username: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      email: '',
      createTime: '',
      ext0: '',
      ext1: '',
      ext2: '',
      ext3: '',
      ext4: '',
      ext5: 0,
      ext6: 0,
      ext7: 0,
      ext8: 0,
      ext9: 0,
    },
    userDepartmentList: [],
  });

  //弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    if (visible) {
      isEdit.value = false;
      formState.userDepartmentList.push({
        orgId: selectTreeNode.node.id,
        orgName: getTreeNamePathArr(selectTreeNode.node.id).join('/'),
        master: 1,
        principal: 0,
        departmentList: [],
      });
      managerList.value = await getUserListByKey();
    }
  };
  //打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    isEdit.value = true;
    formState.user = data.user;
    formState.userDepartmentList = data.userDepartmentList;
    console.log('Data Received', data);
  };

  const handleOk = () => {
    userFormRef.value?.validate().then(async () => {
      console.log(formState);
      //有密码时需要加密
      if (formState.user.password) {
        formState.user.password = sha256(formState.user.password, key);
        formState.user.confirmPassword = sha256(formState.user.confirmPassword, key);
      }
      emit('ok', { ...toRaw(formState) });
      closeModal();
    });
  };
  const handleClose = () => {
    userFormRef.value?.resetFields();
    formState.user = {
      id: undefined,
      avatar: globSetting.defaultAvatar,
      fullname: '',
      empNo: '',
      managerId: undefined,
      birthday: '',
      gender: -1,
      username: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      email: '',
      createTime: '',
    };
    formState.userDepartmentList = [];
    isDefaultPassword.value = false;
  };
  const handleChangeOrg = (index) => {
    formState.userDepartmentList.forEach((d, i) => {
      if (i === index) {
        d.orgName = getTreeNamePathArr(d.orgId).join('/');
        d.departmentList = getTreeNamePathArr(d.orgId);
      }
    });
  };
  const handleAddDepartmentList = () => {
    formState.userDepartmentList.push({
      orgId: '',
      orgName: '',
      principal: 0,
      master: 0,
      departmentList: [],
    });
    if (formState.userDepartmentList.length == 1) {
      //如果添加完只有一条数据的话 直接将其设置为主部门
      formState.userDepartmentList[0].master = 1;
    }
    console.log(formState.userDepartmentList);
  };

  const setMaster = (index) => {
    formState.userDepartmentList.forEach((d, i) => {
      if (i === index) {
        d.master = 1;
      } else {
        d.master = 0;
      }
    });
  };
  const deleteDepartment = (index) => {
    formState.userDepartmentList.splice(index, 1);
  };

  const checkPassword = () => {
    const password = formState.user.password;
    const confirmPassword = formState.user.confirmPassword;
    if (isEmpty(password) || isEmpty(confirmPassword)) {
      return Promise.resolve();
    }
    if (password !== confirmPassword) {
      return Promise.reject(t('sys.portal.passwordNotSame'));
    }
    //报红是antd方法类型定义的问题
    userFormRef.value?.clearValidate([
      ['user', 'password'],
      ['user', 'confirmPassword'],
    ]);
    return Promise.resolve();
  };
  const isDefaultPassword = ref(false);
  watch(isDefaultPassword, (val) => {
    if (val) {
      formState.user.password = getOrgInitialPassword.value ?? '';
      formState.user.confirmPassword = getOrgInitialPassword.value ?? '';
    } else {
      formState.user.password = '';
      formState.user.confirmPassword = '';
    }
  });

  watch([managerList, isEdit], ([list, status]) => {
    if (status && list && !list.some((item) => item.id === formState.user.managerId)) {
      formState.user.managerId = undefined;
    }
  });
</script>

<style lang="less" scoped>
  .info-box {
    display: flex;
  }

  .form-table :deep(.ant-form-item) {
    margin-bottom: 0px;
  }
</style>
