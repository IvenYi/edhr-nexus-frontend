<template>
  <div class="staff-signature-confirm-render bg-white">
    <a-button type="primary" class="mb-2" @click="handleAdd" v-if="!hideAdd">添加</a-button>
    <a-form :model="dataSource" ref="formRef" :layout="'horizontal'">
      <a-table :pagination="false" :data-source="dataSource" :columns="computedColumns">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'info'">
            <a-form-item
              class="relative"
              :colon="false"
              label=" "
              :name="[index, 'info']"
              :rules="validateAccountRules(record, index, column)"
            >
              <a-select
                v-model:value="record.info"
                :options="allStaffs"
                :disabled="record.validatePassed && isSignRequired"
                :filter-option="filterOption"
                showSearch
              />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <a
              v-if="isSignRequired"
              :class="record.validatePassed ? 'link-button--disabled' : ''"
              @click="confirmSignature(record, index)"
              >签名确认</a
            >
            <a-popconfirm
              :disabled="record.validatePassed && isSignRequired"
              v-if="dataSource.length"
              title="确认删除？"
              @confirm="onDelete(record.key)"
            >
              <a
                :class="record.validatePassed && isSignRequired ? 'link-button--disabled' : ''"
                class="color-red-600 hover-color-red-700 ml-2"
                >删除</a
              >
            </a-popconfirm>
          </template>
          <template v-else>
            <a-form-item
              class="relative"
              :colon="false"
              label=" "
              :name="[index, column.dataIndex]"
              :rules="validateAccountRules(record, index, column)"
            >
              <a-input
                v-if="column.type === FIELD_TYPE.TEXT"
                v-model:value="record[column.dataIndex]"
                class="w100%"
                :disabled="record.validatePassed && isSignRequired"
              />
              <a-textarea
                v-if="column.type === FIELD_TYPE.LONG_TEXT"
                v-model:value="record[column.dataIndex]"
                class="w100%"
                :disabled="record.validatePassed && isSignRequired"
              />
              <a-input-number
                v-if="
                  [
                    FIELD_TYPE.INTEGER,
                    FIELD_TYPE.LONG,
                    FIELD_TYPE.DOUBLE,
                    FIELD_TYPE.DECIMAL,
                  ].includes(column.type)
                "
                v-model:value="record[column.dataIndex]"
                class="w100%"
                :disabled="record.validatePassed && isSignRequired"
              />
              <a-date-picker
                v-if="column.type === FIELD_TYPE.DATE_TIME"
                v-model:value="record[column.dataIndex]"
                class="w100%"
                value-format="YYYY-MM-DD HH:mm:ss"
                :show-time="{ format: 'HH:mm:ss' }"
                :disabled="record.validatePassed && isSignRequired"
              />
              <a-select
                v-if="column.type === FIELD_TYPE.ENUM"
                v-model:value="record[column.dataIndex]"
                class="w100%"
                :options="optionList[column.dataIndex]"
                :disabled="record.validatePassed && isSignRequired"
              />
            </a-form-item>
          </template>
        </template>
      </a-table>
    </a-form>
  </div>

  <a-modal v-model:visible="signatureVisible" :width="800" @ok="handleOk" @cancel="handleCancel">
    <SignatureConfirm
      class="signature-confirm mt-5"
      ref="signatureConfirm"
      :key="signatureConfirmKey"
      :relationId="signRelationId"
      :widget="{ props: { isSignRequired, justConfirm: true } }"
      @afterVerify="onAfterVerify"
    />
  </a-modal>
</template>

<script lang="ts" setup name="gct-staff-signature-confirm-render">
  import { onMounted, reactive, ref, computed } from 'vue';
  import type { Ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IStaffSignatureConfirm } from './schema';
  import { getDesignerCommonGetCanBeUsedOrgUser } from '/@/apis/gct-apaas/DesignerCommonController';
  import SignatureConfirm from '../signature-confirm/signature-confirm-render.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';

  interface DataItem {
    key: string;
    info: string;
    validatePassed?: boolean;
    hasValid?: boolean;
  }

  const Event = getPageEvent();
  const defProps = defineProps<{ widget?: IStaffSignatureConfirm }>();
  const { isSignRequired, needOtherFields, otherFieldsData, staffFields, hideAdd } = reactive(
    defProps?.widget?.props || ({} as any),
  );

  const { t } = useI18n();
  const dataSource: Ref<DataItem[]> = ref([]);
  const formRef = ref<FormInstance>();
  const allStaffs = ref<any>([]);
  const signRelationId = ref(randomUUID([], { length: 16 }));
  const signatureVisible = ref(false);
  const signatureConfirmKey = ref();
  const signatureConfirm = ref();
  const signSubjectInfo = ref<DataItem>();
  const isFullValidate = ref(false);

  const computedColumns = computed(() => {
    const columns = [
      {
        title: '人员',
        key: 'info',
        dataIndex: 'info',
        required: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
      },
    ];
    if (needOtherFields && otherFieldsData) {
      for (const key in otherFieldsData) {
        const element = otherFieldsData[key];
        if (element) {
          const addItem = {
            title: element.name,
            dataIndex: element.key,
            key: element.key,
            type: element.type,
            bindInfo: element.bindInfo,
            required: !!element.required,
          };
          if (element.type == FIELD_TYPE.TEXT || element.type == FIELD_TYPE.LONG_TEXT) {
            defaultItem.value[element.key] = element.defaultValue.value;
          }
          if (element.type == FIELD_TYPE.ENUM) {
            putOptions(element);
          }
          columns.splice(columns.length - 1, 0, addItem);
        }
      }
    }
    return columns;
  });

  // 获取枚举数据列表
  const optionList = ref({});
  const putOptions = async (col) => {
    // 枚举类型 默认值
    defaultItem.value[col.key] = col.defaultValue.value;
    const res = await getEnumModelFieldPageList({
      enumModelId: col.bindInfo,
      enumModelKey: col.bindInfo,
    });
    optionList.value[col.key] = (res?.data || []).map((d) => {
      return {
        label: d.text,
        value: d.value,
      };
    });
  };

  const validateAccountRules = (record, rIndex, rcol) => {
    return [
      {
        required: rcol.required,
        message: t('sys.pageDesigner.cannotBeEmpty'),
      },
      {
        message: '该签名账号重复!',
        async validator(item) {
          const flag =
            item.field === `${rIndex}.info` &&
            record.info &&
            dataSource.value.find((item, index) => item.info === record.info && index !== rIndex);
          if (flag) {
            return Promise.reject();
          }
        },
      },
      {
        message: '签名信息未通过',
        validator: async () => {
          if (isFullValidate.value && record.hasValid && !record.validatePassed) {
            return Promise.reject();
          }
        },
      },
    ];
  };

  const confirmSignature = async (record, index) => {
    try {
      isFullValidate.value = false;
      if (!record.info) {
        message.warn('请选择人员进行签名确认');
        return;
      }
      const nameList = computedColumns.value
        .filter((i) => i?.key)
        .map((i) => {
          return [index, i?.key];
        });

      await formRef.value?.validate(nameList);
      if (record.validatePassed) return;
      signatureVisible.value = true;
      signSubjectInfo.value = record;
      signatureConfirmKey.value = getRandomUUID();
    } catch (err) {
      if (err && typeof err === 'string') {
        message.error(err);
      }
      console.error(err, 'error handle confirmSignature');
    }
  };

  const onDelete = (key: string) => {
    dataSource.value = dataSource.value.filter((item) => item.key !== key);
  };

  const defaultItem = ref({});
  const handleAdd = async () => {
    let data = {};
    try {
      data = await Event.runEventByName('onAdd', defProps?.widget?.events || {});
    } catch (err) {
      console.error(err, 'error before add');
    }

    const newData = {
      key: `${getRandomUUID()}`,
      info: '',
      validatePassed: !isSignRequired,
      hasValid: false,
      ...defaultItem.value,
      ...data,
    };

    dataSource.value.push(newData);
  };

  const handleOk = async () => {
    try {
      await signatureConfirm.value.fullValidate();
      dataSource.value.forEach((item) => (item.hasValid = true));
      await validateSignature();
      dataSource.value.forEach((item) => {
        if (item.key === signSubjectInfo.value?.key) {
          item.validatePassed = true;
        }
      });
      signatureVisible.value = false;
    } catch (err) {
      if (err && typeof err === 'string') {
        message.error(err);
      }
      signatureConfirm.value.resetValidateStatus();
      console.error(err, 'error handle ok');
    }
  };

  const handleCancel = () => {
    signatureVisible.value = false;
    signatureConfirm.value.clearValidate();
  };

  const reset = () => {
    dataSource.value = [];
    signRelationId.value = getRandomUUID();
  };

  async function loadStaffData() {
    const res: any = await getDesignerCommonGetCanBeUsedOrgUser({
      pageNo: 1,
      pageSize: 999999999,
    });
    allStaffs.value = (res?.data ?? []).map((e) => {
      return {
        ...e,
        value: e.id,
        label: staffFields ? `${e[staffFields]}(${e.fullname})` : e.fullname,
      };
    });
  }

  function filterOption(inputValue: string, option: any) {
    return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  }

  async function validateSignature() {
    try {
      const signList = (signatureConfirm.value?.getValue() ?? []).map((e) => e.name) ?? [];
      const signParams = {
        user_id_: signSubjectInfo.value?.info,
        account_list_: signList,
      };
      await Event.context.$customBizService.post(
        {
          action: 'biz_validate_account_consistency_edgb',
          key: 'em_sign_history',
        },
        {
          ...signParams,
        },
        {},
        {
          errorMessageMode: 'none',
        },
      );
    } catch (e) {
      console.error(e, 'error about 签名确认和用户不匹配');
      throw e;
    }
  }

  function onAfterVerify(data) {}

  function getRandomUUID() {
    return randomUUID([], { length: 16 });
  }

  async function fullValidate() {
    try {
      isFullValidate.value = true;
      await formRef.value?.validate();
      dataSource.value.forEach((item) => {
        item.validatePassed = !!item.validatePassed;
      });
      if (!dataSource.value?.length && isSignRequired) {
        return Promise.reject('请添加签名账号');
      }
      if (dataSource.value?.length && !dataSource.value.every((item) => item.validatePassed)) {
        return Promise.reject('用户验证失败');
      }
    } catch (err) {
      console.error(err, 'error validation');
      throw err;
    }
  }

  const addDataSource = (data: any) => {
    const newData = {
      key: `${getRandomUUID()}`,
      validatePassed: !isSignRequired,
      hasValid: false,
      ...data,
    };
    dataSource.value.push(newData);
  };

  const setDataSource = (data: any) => {
    const newData = {
      validatePassed: !isSignRequired,
      hasValid: false,
    };
    dataSource.value = data.map((e, index) => ({
      key: `${getRandomUUID()}${index}`,
      ...newData,
      ...e,
    }));
  };

  onMounted(() => {
    loadStaffData();
  });

  defineExpose({
    relationId: signRelationId,
    fullValidate,
    getValue() {
      return dataSource.value;
    },
    reset,
    addDataSource,
    setDataSource,
  });
</script>

<style lang="less" scoped>
  .staff-signature-confirm-render {
    .link-button {
      &--disabled {
        cursor: not-allowed;
        color: #d1d5db;
        &:hover {
          color: #9ca3af;
        }
      }
    }
  }
</style>
