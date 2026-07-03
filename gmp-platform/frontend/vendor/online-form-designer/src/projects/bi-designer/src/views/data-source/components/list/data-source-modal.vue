<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    :maskClosable="false"
    :afterClose="handleClose"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      :rules="rules"
    >
      <template v-if="formState.type === DataSourceType.DATABASE">
        <a-form-item
          :label="t('sys.component.dataConnection.dbType')"
          name="dbType"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseSelectSth', { sth: t('sys.component.dataConnection.dbType') }),
            },
          ]"
        >
          <a-select
            v-model:value="formState.dbType"
            :disabled="isEdit"
            :options="databaseOptions"
            :placeholder="
              t('sys.pleaseSelectSth', { sth: t('sys.component.dataConnection.dbType') })
            "
          />
        </a-form-item>

        <a-form-item
          :label="t('sys.nameOfSth', { sth: t('sys.integration.dataSource') })"
          name="aliasName"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-input
            v-model:value="formState.aliasName"
            :placeholder="
              t('sys.pleaseInputSth', {
                sth: t('sys.nameOfSth', { sth: t('sys.integration.dataSource') }),
              })
            "
          />
        </a-form-item>

        <a-form-item
          :label="t('sys.integration.db.name')"
          name="dbName"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-input
            v-model:value="formState.dbName"
            :placeholder="t('sys.pleaseInputSth', { sth: t('sys.integration.db.name') })"
          />
        </a-form-item>

        <a-form-item label="URL" name="url" :rules="[{ required: true, whitespace: true }]">
          <a-input
            v-model:value="formState.url"
            :placeholder="t('sys.pleaseInputSth', { sth: 'URL' })"
          />
        </a-form-item>

        <a-form-item
          :label="t('sys.component.dataConnection.userName')"
          name="username"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-input
            v-model:value="formState.username"
            autocomplete="off"
            :placeholder="
              t('sys.pleaseInputSth', { sth: t('sys.component.dataConnection.userName') })
            "
          />
        </a-form-item>

        <a-form-item
          :label="t('sys.password')"
          name="password"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-input
            v-no-copy-paste
            v-model:value="formState.password"
            type="password"
            autocomplete="new-password"
            :placeholder="t('sys.pleaseInputSth', { sth: t('sys.password') })"
          />
        </a-form-item>

        <!-- <a-form-item
          :label="t('sys.component.dataConnection.maxLinkNum')"
          name="maxActive"
          :rules="[{ required: true }]"
        >
          <a-input-number
            v-model:value="formState.maxActive"
            :min="0"
            :placeholder="
              t('sys.pleaseInputSth', { sth: t('sys.component.dataConnection.maxLinkNum') })
            "
          />
        </a-form-item> -->

        <!-- <a-form-item
          :label="t('sys.component.dataConnection.maxLinkPool')"
          name="poolSize"
          :rules="[{ required: true }]"
        >
          <a-input-number
            v-model:value="formState.poolSize"
            :min="0"
            :placeholder="
              t('sys.pleaseInputSth', { sth: t('sys.component.dataConnection.maxLinkPool') })
            "
          />
        </a-form-item> -->
      </template>

      <template v-else-if="formState.type === DataSourceType.APPLICATION">
        <a-form-item
          :label="t('sys.app.index')"
          name="dsAppId"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseSelectSth', {
                sth: t('sys.app.index'),
              }),
            },
          ]"
        >
          <a-select
            v-model:value="formState.dsAppId"
            :disabled="isEdit"
            :placeholder="t('sys.chooseText')"
          >
            <a-select-option :value="item.value" v-for="item in appOptions" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('sys.env')" name="env">
          <a-select
            v-model:value="formState.env"
            :disabled="isEdit"
            :placeholder="t('sys.chooseText')"
          >
            <a-select-option :value="item.key" v-for="item in apiEnvOptions" :key="item.key">
              {{ t(item.i18n) }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :label="t('sys.nameOfSth', { sth: t('sys.integration.dataSource') })"
          name="aliasName"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-input
            v-model:value="formState.aliasName"
            :placeholder="
              t('sys.pleaseInputSth', {
                sth: t('sys.nameOfSth', { sth: t('sys.integration.dataSource') }),
              })
            "
          />
        </a-form-item>
      </template>

      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea
          v-model:value="formState.description"
          :maxlength="120"
          show-count
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.description') })"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="back" @click="handleCancel">
        {{ t('sys.cancel') }}
      </a-button>
      <a-button key="back" @click="handleTest">
        {{ t('sys.integration.db.testConnect') }}
      </a-button>
      <a-button key="submit" type="primary" @click="handleOk">
        {{ t('sys.ok2') }}
      </a-button>
    </template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, toRaw, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { Rule } from 'ant-design-vue/es/form';
  import {
    postDatabaseAddDatabase,
    postDatabaseTestDatabaseConn,
    putDatabaseUpdateDatabase,
  } from '/@/apis/gct-platform/DatabaseController';
  import { FormInstance, message } from 'ant-design-vue';
  import { DataBaseType, DataSourceType, envOptions } from '/@bi-designer/enum/database';
  import { useUserStore } from '/@/store/modules/user';
  import { isEmpty } from 'lodash-es';
  import { getReleasedAppPublishedAppList } from '/@/apis/gct-platform/PublishedAppController';

  const userStore = useUserStore();

  const { t } = useI18n();

  const emit = defineEmits(['ok']);

  const formRef = ref<FormInstance>();

  const formState = ref<any>({});

  const rules: Record<string, Rule[]> = {};

  const appOptions = ref<any[]>([]);

  const apiEnvOptions = envOptions.filter((i) => i.key !== 'dev');

  const databaseOptions = Object.keys(DataBaseType).map((key) => {
    return {
      label: t(`sys.integration.db.${key}`),
      value: key,
    };
  });

  //打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    await getMineAppData();
    formState.value = data;
  };

  const isEdit = computed(() => {
    return !!formState.value.id;
  });

  const title = computed(() => {
    return (isEdit.value ? t('sys.edit') : t('sys.add')) + t('sys.integration.dataSource');
  });

  const getMineAppData = async () => {
    if (isEmpty(userStore.getTenant)) {
      return;
    }
    const res: any =
      (await getReleasedAppPublishedAppList({ env: 'test', pageNo: 1, pageSize: 9999 })) || {};
    const result = res?.data;
    appOptions.value = result
      .filter((v) => v.state !== 'MANUAL_LOCKED')
      .map((i) => {
        return {
          value: i.appId,
          label: i.appName,
        };
      });
  };
  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      try {
        if (isEdit.value) {
          //编辑
          await putDatabaseUpdateDatabase(toRaw(unref(formState)));
        } else {
          //新增
          await postDatabaseAddDatabase(toRaw(unref(formState)));
        }
        emit('ok');
        handleCancel();
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleTest = async () => {
    formRef.value?.validate().then(async () => {
      //测试连接
      try {
        await postDatabaseTestDatabaseConn(toRaw(unref(formState)));
        message.success(t('sys.integration.db.testConnectSuccess'));
      } catch (error) {
        // message.warn(
        //   t('sys.integration.db.envTestConnectFailure', {
        //     env: '',
        //   }),
        // );
      }
    });
  };

  const handleClose = () => {
    Object.assign(formState, { id: undefined });
    formRef.value?.resetFields();
    formState.value = {};
  };
</script>

<style lang="less" scoped></style>
