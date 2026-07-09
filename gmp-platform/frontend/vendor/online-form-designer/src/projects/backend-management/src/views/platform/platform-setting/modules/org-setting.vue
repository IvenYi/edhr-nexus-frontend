<template>
  <div class="org">
    <div class="org-form-setting">
      <a-form
        ref="formRef"
        :model="orgSetting"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 21 }"
        autocomplete="off"
      >
        <a-form-item
          :label="t('sys.platform.initialLoginPassword')"
          name="initialPassword"
          :rules="[
            { required: true },
            {
              validator: () => passwordValidator('initialPassword'),
              trigger: ['change', 'blur'],
            },
          ]"
        >
          <a-input-password v-model:value="orgSetting.initialPassword" style="width: 30%" />
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.initialSignPassword')"
          name="initialSignPassword"
          :rules="[
            { required: true },
            {
              validator: () => passwordValidator('initialSignPassword'),
              trigger: ['change', 'blur'],
            },
          ]"
        >
          <a-input-password v-model:value="orgSetting.initialSignPassword" style="width: 30%" />
        </a-form-item>

        <a-form-item
          v-if="isPlatform"
          :label="t('sys.platform.initialSealPassword')"
          name="initialSealPassword"
          :rules="[
            { required: true },
            // {
            //   validator: () => passwordValidator('initialSealPassword'),
            //   trigger: ['change', 'blur'],
            // },
          ]"
        >
          <a-input-password v-model:value="orgSetting.initialSealPassword" style="width: 30%" />
        </a-form-item>

        <a-form-item :label="t('sys.platform.enableIdentifier')" v-if="isPlatform">
          <a-switch
            v-model:checked="orgSetting.enableIdentifier"
            :checked-value="1"
            :un-checked-value="0"
          />
        </a-form-item>
        <a-form-item :label="t('sys.platform.enableDeleteAccount')">
          <a-switch
            v-model:checked="orgSetting.enableDeleteUser"
            :checked-value="1"
            :un-checked-value="0"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.requiredFields')"
          name="requiredFields"
          v-if="isPlatform"
        >
          <a-select
            v-model:value="orgSetting.requiredFields"
            mode="multiple"
            :maxTagCount="5"
            :maxTagTextLength="6"
            style="width: 30%"
            :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.platform.requiredFields') })"
            :options="requiredFields"
          />
        </a-form-item>
        <a-form-item :label="t('sys.platform.supportLoginFields')" v-if="isPlatform">
          <a-select
            v-model:value="supportLoginFields"
            style="width: 30%"
            :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.platform.supportLoginFields') })"
            :options="userLoginFieldOptions"
            @change="loginFieldChange"
          />
        </a-form-item>
      </a-form>
    </div>
    <div class="org-extends-field">
      <div class="title">{{ t('sys.platform.extendsField') }}</div>
      <div class="container">
        <basic-table
          class="table"
          :striped="false"
          :bordered="true"
          :showIndexColumn="false"
          :ellipsis="true"
          :canResize="false"
          row-key="id"
          :columns="tableColumn"
          :dataSource="extFielDataSource"
          :pagination="false"
          :scroll="{ y: 226 }"
        >
          <template #headerTop>
            <div class="mb-10px">
              <a-button type="primary" @click="hanldeAddField">
                <plus-outlined /> {{ t('sys.add') + t('sys.appDesigner.field') }}</a-button
              >
            </div>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'required'">
              <span>{{ record.required === 0 ? t('sys.false') : t('sys.true') }}</span>
            </template>
            <template v-if="column.key === 'relationField'">
              <span>{{ record.relationFieldName }}</span>
            </template>
            <template v-if="column.key === 'encrypted'">
              <span>{{
                record.encrypted
                  ? t('sys.appDesigner.encryptedText')
                  : t('sys.appDesigner.normalText')
              }}</span>
            </template>
            <template v-if="column.key === 'previewEx'">
              <span>{{
                record.encrypted ? '******' : t('sys.appDesigner.exampleContentTip')
              }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <table-action-auto
                :actions="[
                  {
                    label: t('sys.edit'),
                    onClick: handleFieldEdit.bind(null, record),
                  },
                  {
                    label: t('sys.delete'),
                    color: 'error',
                    popConfirm: {
                      title: t('sys.sureToDelete'),
                      confirm: handleFieldDelete.bind(null, record),
                    },
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </basic-table>
      </div>
    </div>
    <div class="org-third-party">
      <div class="title">{{ t('sys.platform.thirdParty') }}</div>
      <div class="card-list">
        <div class="app-card" v-for="item in thirdPartyList" :key="item.value">
          <div class="card-header">
            <component :is="icons[item.value]" :class="['icon-cmp', 'mr-4px']" />
            <span class="card-title">
              {{ item.label }}
            </span>
          </div>
          <a-button
            class="card-btn"
            type="primary"
            ghost
            block
            @click.stop="handleClick(item.value)"
          >
            + {{ t('sys.platform.clickToConfig') }}
          </a-button>
          <div class="card-content" v-if="getRelationFieldName(item.value)">
            {{ t('sys.pageDesigner.associatedFields') + '：' + getRelationFieldName(item.value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <org-field-modal @register="register" @change="handleChange" />
  <login-mode-modal @register="registerLogin" @change="handleChangeThirdParty" />
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { BasicColumn, BasicTable, TableActionAuto } from '@/components/Table';
  import { useModal } from '@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import LoginModeModal from '../modal/login-mode-modal.vue';
  import OrgFieldModal from '../modal/org-field-modal.vue';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { useWatermarkSetting } from '/@/hooks/platform/useWatermarkSetting';
  import DingdingIcon from '../components/Icon/dingding-icon.vue';
  import FeishuIcon from '../components/Icon/feishu-icon.vue';
  import QiyeweixinIcon from '../components/Icon/qiyeweixin-icon.vue';

  import type { FormInstance } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      isPlatform: boolean;
    }>(),
    {
      isPlatform: true,
    },
  );

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const [registerLogin, { openModal: openLoginModal }] = useModal();
  const { orgSetting, relationFields, relationFiledsCopy, originRelationFields, loadOrgSetting } =
    useOrgSetting(props.isPlatform);

  const icons = {
    DINGDING: DingdingIcon,
    FEISHU: FeishuIcon,
    QIYEWEIXIN: QiyeweixinIcon,
  };

  const tableColumn: BasicColumn[] = [
    {
      title: t('sys.model.fieldName'),
      dataIndex: 'fieldName',
      align: 'left',
    },
    {
      title: t('sys.model.refField'),
      dataIndex: 'relationField',
      align: 'left',
    },
    {
      title: t('sys.requiredOrNot'),
      dataIndex: 'required',
      align: 'left',
    },
    {
      title: t('sys.platform.configDetail'),
      dataIndex: 'encrypted',
      align: 'left',
    },
    {
      title: t('sys.platform.previewExample'),
      dataIndex: 'previewEx',
      align: 'left',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 150,
      align: 'left',
    },
  ];

  const requiredFields = [
    {
      label: t('sys.empNo'),
      value: 'empNo',
    },
    {
      label: t('sys.email'),
      value: 'email',
    },
    {
      label: t('sys.mobile'),
      value: 'mobile',
    },
  ];

  const userLoginFields = ref([
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
    {
      label: t('sys.email'),
      value: 'email_',
    },
  ]);

  const thirdPartyList = ref([
    {
      label: t('sys.dingtalk'),
      value: 'DINGDING',
    },
    {
      label: t('sys.workwx'),
      value: 'QIYEWEIXIN',
    },
    {
      label: t('sys.feishu'),
      value: 'FEISHU',
    },
  ]);

  const formRef = ref<FormInstance>();

  // 添加字段
  const hanldeAddField = () => {
    openModal(true, { isEdit: false });
  };

  // 编辑字段
  const handleFieldEdit = (item) => {
    openModal(true, { ...item, isEdit: true });
  };

  const handleChange = (data) => {
    const { isEdit, fieldName, relationField, required, type, encrypted } = data;
    if (isEdit.value && orgSetting.extFieldConfigs) {
      orgSetting.extFieldConfigs = orgSetting.extFieldConfigs.map((item: any) => {
        if (data.id === item.id) {
          item.fieldName = fieldName;
          item.relationField = relationField;
          item.required = required;
          item.type = type;
          item.encrypted = encrypted;
        }
        return item;
      });
    } else {
      const { isEdit, ...args } = data;
      orgSetting.extFieldConfigs && orgSetting.extFieldConfigs.push(args);
    }
  };

  // 字段删除
  const handleFieldDelete = (record) => {
    if (orgSetting.extFieldConfigs) {
      orgSetting.extFieldConfigs = orgSetting.extFieldConfigs.filter(
        (item: any) => item.id !== record.id,
      );
      const item = relationFiledsCopy.value.find((item) => item.value === record.relationField);
      if (item) {
        relationFields.value.push(item);
        relationFiledsCopy.value = relationFiledsCopy.value.filter(
          (itey) => itey.value !== item.value,
        );
      }
      orgSetting.supportLoginFields = orgSetting.supportLoginFields?.filter(
        (item: any) => item !== record.relationField,
      );
    }
  };

  // 获取扩展的字段拼接到用户登录字段
  const userLoginFieldOptions = computed(() => {
    const extendsFields = (orgSetting?.extFieldConfigs ?? []).map((item: any) => {
      return {
        label: item.fieldName,
        value: item.relationField,
      };
    });

    return [...userLoginFields.value, ...extendsFields];
  });

  const supportLoginFields = computed(() => {
    return orgSetting.supportLoginFields
      ? orgSetting.supportLoginFields[orgSetting.supportLoginFields.length - 1]
      : '';
  });

  const extFielDataSource = computed(() => {
    return orgSetting.extFieldConfigs?.map((item: any) => {
      const findItem = originRelationFields?.find((n) => n.value === item.relationField);
      return {
        ...item,
        relationFieldName: findItem ? findItem.label : item.relationField,
      };
    });
  });

  const loginFieldChange = (value, option) => {
    orgSetting.supportLoginFields = [value];
  };
  const validateValue = () => {
    return formRef.value?.validate();
  };

  defineExpose({ validateValue });

  const handleClick = (item) => {
    openLoginModal(true, {
      type: 'org',
      label: item,
      relationField: orgSetting?.accountConfigs?.find((n) => n.appType === item)?.relationField,
    });
  };

  const handleChangeThirdParty = (accountConfigs) => {
    if (orgSetting?.accountConfigs) {
      let item = orgSetting.accountConfigs.find((n) => n.appType === accountConfigs.appType);
      if (item) {
        item.relationField = accountConfigs.relationField;
      } else {
        orgSetting.accountConfigs.push({
          ...accountConfigs,
        });
      }
    } else {
      orgSetting.accountConfigs = [
        {
          ...accountConfigs,
        },
      ];
    }
  };

  const passwordValidator = (currentPasswordField: string) => {
    // const passwordFieldList = ['initialPassword', 'initialSignPassword', 'initialSealPassword'];
    const passwordFieldList = ['initialPassword', 'initialSignPassword'];

    const repeatedField = passwordFieldList.find(
      (f) => f !== currentPasswordField && orgSetting[f] === orgSetting[currentPasswordField],
    );

    if (repeatedField) {
      const msg = t('sys.platform.passwordCannotBeSame', {
        p1: t(`sys.platform.${currentPasswordField}`),
        p2: t(`sys.platform.${repeatedField}`),
      });
      formRef.value?.clearValidate();
      return Promise.reject(msg);
    }
    formRef.value?.clearValidate();
    return Promise.resolve();
  };
  const getRelationFieldName = (key) => {
    const field = orgSetting?.accountConfigs?.find((n) => n.appType === key)?.relationField;
    const _relationFields = [
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
    ];
    const extFieldConfigs =
      orgSetting.extFieldConfigs?.map((n) => {
        return {
          value: n.relationField,
          label: n.fieldName,
        };
      }) || [];

    return [..._relationFields, ...extFieldConfigs].find((n) => n.value === field)?.label;
  };

  onMounted(() => {
    loadOrgSetting();
  });
</script>

<style lang="less" scoped>
  .org {
    height: 100%;
    padding-top: 32px;
    overflow: auto;

    &-form-setting {
      border-bottom: 1px solid #eaeaea;
    }

    &-extends-field {
      padding: 0 16px 0 28px;
      border-bottom: 1px solid #eaeaea;

      .title {
        margin-top: 20px;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: bold;
      }

      .container {
        height: 320px;
        margin-bottom: 20px;
        .table {
          :deep(.ant-table-wrapper) {
            padding: 0;
          }
        }
      }
    }

    &-third-party {
      padding: 0 16px 16px 28px;

      .title {
        margin-top: 20px;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: bold;
      }

      .card-list {
        display: flex;

        .app-card {
          width: 294px;
          height: 140px;
          margin-left: 16px;
          padding: 16px;
          border-radius: 4px;
          background: #fff;
          box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);

          .card-header {
            display: flex;
            align-items: center;

            .icon-cmp {
              :deep(svg) {
                width: 20px;
                height: 20px;
                font-size: 16px;
                vertical-align: text-bottom;
              }
            }

            .card-title {
              color: #212528;
              font-size: 14px;
              font-weight: 500;
            }
          }

          .card-btn {
            margin-top: 12px;
          }

          .card-content {
            margin-top: 8px;
            padding: 8px;
            border: 1px solid #e8ebf0;
            border-radius: 4px;
            background: #fbfbfc;
          }
        }
      }
    }
  }
</style>
