<template>
  <div class="signature-confirm-render bg-white">
    <a-button type="primary" class="mb-2" @click="handleAdd">添加</a-button>
    <a-form :model="dataSource" ref="formRef">
      <a-table :pagination="false" :data-source="dataSource" :columns="columns">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'name'">
            <a-form-item
              class="relative"
              :colon="false"
              label=" "
              :name="[index, 'name']"
              :rules="validateAccountRules(record, index)"
            >
              <a-input
                v-model:value="record.name"
                :disabled="record.validatePass"
                :placeholder="t('sys.pleaseInputSth', { sth: t('sys.userName') })"
              />
              <lable
                v-if="showRowError(record)"
                class="color-red-600 absolute font-size-3 -bottom-6 left-0"
              >
                {{ '当前用户名或密码不正确' }}
              </lable>
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'password'">
            <a-form-item
              :colon="false"
              label=" "
              :name="[index, 'password']"
              :rules="[{ required: true, message: t('sys.pageDesigner.cannotBeEmpty') }]"
            >
              <a-input-password
                v-model:value="record.password"
                :disabled="record.validatePass"
                autocomplete="new-password"
                :placeholder="
                  t('sys.pleaseInputSth', {
                    sth: t('sys.password'),
                  })
                "
              />
            </a-form-item>
          </template>
          <template v-else>
            <a
              :class="record.validatePass ? 'link-button--disabled' : ''"
              @click="confirmSignature(record)"
              >签名认证</a
            >
            <a-popconfirm
              :disabled="record.validatePass"
              v-if="dataSource.length"
              title="确认删除？"
              @confirm="onDelete(record.key)"
            >
              <a
                :class="record.validatePass ? 'link-button--disabled' : ''"
                class="color-red-600 hover-color-red-700 ml-2"
                >删除</a
              >
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-form>
  </div>
</template>
<script lang="ts" setup name="gct-signature-confirm-render">
  import { computed, ref, reactive } from 'vue';
  import type { Ref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { debounce } from 'lodash-es';
  import { ISignatureConfirm } from './schema';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  interface DataItem {
    key: string;
    name: string;
    password: number | string;
    validatePass?: boolean;
    hasValidated?: boolean;
  }

  const columns = [
    {
      title: '账号',
      dataIndex: 'name',
    },
    {
      title: '密码',
      dataIndex: 'password',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      width: 160,
    },
  ];

  const defProps = defineProps<{ widget?: ISignatureConfirm }>();
  const { isSignRequired } = reactive(defProps?.widget?.props || ({} as any));

  const emit = defineEmits<{
    (event: 'afterVerify', data: object): void;
  }>();

  const { t } = useI18n();
  const Event = getPageEvent();
  const dataSource: Ref<DataItem[]> = ref([]);
  const count = computed(() => dataSource.value.length + 1);
  const formRef = ref<FormInstance>();
  const signRelationId = ref(randomUUID([], { length: 16 }));
  const { sha256 } = useSHA256();
  const { getSecurityConfig, getSignWay } = useRootSetting();

  const showRowError = (record) => {
    return !record?.validatePass && record.hasValidated;
  };

  const validateAccountRules = (record, rIndex) => {
    return [
      {
        required: true,
        message: t('sys.pageDesigner.cannotBeEmpty'),
      },
      {
        message: '该签名账号重复!',
        async validator() {
          const flag =
            record.name &&
            dataSource.value.find((item, index) => item.name === record.name && index !== rIndex);
          if (flag) {
            return Promise.reject();
          }
        },
      },
    ];
  };

  const confirmSignature = debounce(async (record) => {
    if (record.validatePass) return;

    const signParams = {
      sign_account_: record.name,
      relation_id_: signRelationId.value,
      type_: 'deviceOverhaul',
    };
    try {
      const key = Math.random().toString(16).substring(2, 8);
      Object.assign(signParams, {
        password_:
          getSecurityConfig?.value?.enableSignPassword == 2
            ? record.password
            : sha256(record.password, key),
        sign_type_: getSignWay(),
      });
      await Event.context.$customBizService.post(
        {
          action: 'accountSave',
          key: 'em_sign_history',
        },
        {
          ...signParams,
        },
      );
      record.validatePass = true;
      emit('afterVerify', { ...record, type_: '' });
    } catch (err) {
      record.validatePass = false;
    } finally {
      record.hasValidated = true;
    }
  }, 200);

  const onDelete = (key: string) => {
    dataSource.value = dataSource.value.filter((item) => item.key !== key);
  };

  const handleAdd = () => {
    const newData = {
      key: `${count.value}`,
      name: '',
      password: '',
      hasValidated: false,
      validatePass: false,
    };
    dataSource.value.push(newData);
  };

  const fullValidate = async () => {
    try {
      await formRef.value?.validate();
      dataSource.value.forEach((item) => {
        item.hasValidated = true;
        item.validatePass = item.validatePass || false;
      });
      if (
        (!dataSource.value?.length && isSignRequired) ||
        (dataSource.value?.length && !dataSource.value.every((item) => item.validatePass))
      ) {
        return Promise.reject('用户验证失败');
      }
    } catch (err) {
      console.error(err, 'error');
      throw err;
    }
  };

  const reset = () => {
    dataSource.value = [];
    signRelationId.value = randomUUID([], { length: 16 });
  };

  defineExpose({
    relationId: signRelationId,
    reset,
    fullValidate,
    getValue() {
      return dataSource.value;
    },
  });
</script>

<style lang="less" scoped>
  .signature-confirm-render {
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
