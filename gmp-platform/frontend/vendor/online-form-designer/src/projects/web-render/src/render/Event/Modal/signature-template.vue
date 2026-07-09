<template>
  <div class="signature-confirm-render bg-white">
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
            >
              {{ $t('sys.appDesigner.signatureConfirm') }}
            </a>
          </template>
        </template>
      </a-table>
    </a-form>
  </div>
</template>
<script lang="ts" setup name="gct-signature-confirm-render">
  import { computed, ref } from 'vue';
  import type { Ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { debounce } from 'lodash-es';
  import { useModal } from '@gct/runtime';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  interface DataItem {
    key: string;
    name: string;
    password: number | string;
    validatePass?: boolean;
  }

  interface IProps {
    userName?: string;
    userId?: string;
  }

  const props = defineProps<IProps>();

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

  const { t } = useI18n();
  const { getSecurityConfig, getSignWay } = useRootSetting();

  const dataSource: Ref<DataItem[]> = ref([
    {
      key: randomUUID([], { length: 16 }),
      name: '',
      password: '',
      validatePass: false,
    },
  ]);
  const formRef = ref<FormInstance>();
  const relationId = ref(randomUUID([], { length: 16 }));
  const { sha256 } = useSHA256();

  const signRelationId = computed({
    get() {
      return relationId.value;
    },
    set(val) {
      relationId.value = val;
    },
  });

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
    await formRef.value?.validate();

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

      const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_sign_history',
          bsKey: 'accountSave',
        },
        {
          ...signParams,
        },
      );

      if (props?.userId && res && props.userId !== res) {
        message.error('签名账号与选择账号不一致！');
        return;
      }

      record.validatePass = true;
    } catch (err) {
      record.validatePass = false;
    }
  }, 200);

  const fullValidate = async () => {
    try {
      await formRef.value?.validate();
      dataSource.value.forEach((item) => {
        item.validatePass = item.validatePass || false;
      });
      if (dataSource.value?.length && !dataSource.value.every((item) => item.validatePass)) {
        formRef.value?.clearValidate();
        message.error('请先签名确认');
        return {
          ok: false,
        };
      }

      return {
        ok: true,
        params: {
          time: new Date().getTime(),
        },
      };
    } catch (err) {
      console.error(err, 'error');
      throw err;
    }
  };

  useModal(fullValidate);
</script>

<style lang="less" scoped>
  .signature-confirm-render {
    padding: 24px;

    .link-button {
      &--disabled {
        color: #d1d5db;
        cursor: not-allowed;

        &:hover {
          color: #9ca3af;
        }
      }
    }

    :deep(.ant-form-item) {
      margin-bottom: 0 !important;
    }
  }
</style>
