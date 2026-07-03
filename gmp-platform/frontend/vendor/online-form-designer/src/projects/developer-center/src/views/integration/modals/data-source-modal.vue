<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(isEdit ? 'sys.editSth' : 'sys.newSth', { sth: t('sys.integration.dataSource') })"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <template #insertFooter>
      <a-button type="primary" class="float-left" @click="handleTestConnect">{{
        t('sys.integration.db.testConnect')
      }}</a-button>
    </template>
    <div class="pl-25px pr-30px">
      <a-collapse v-model:activeKey="activePanel" ghost>
        <a-collapse-panel key="1" :header="t('sys.basicInfo')">
          <a-form
            ref="formRef"
            :model="formState"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 14 }"
          >
            <a-form-item
              :label="t('sys.typeOfSth', { sth: t('sys.integration.dataSource') })"
              name="type"
              :rules="[{ required: true }]"
            >
              <a-select v-model:value="formState.type" @change="resetDetailList">
                <a-select-option
                  :value="item.key"
                  v-for="item in DataSourceEnvOptions"
                  :key="item.key"
                  >{{ t(item.i18n) }}</a-select-option
                >
              </a-select>
            </a-form-item>
            <a-form-item
              :label="t('sys.nameOfSth', { sth: t('sys.integration.dataSource') })"
              name="name"
              :rules="[{ required: true, whitespace: true }]"
            >
              <a-input v-model:value="formState.name" show-count :maxlength="32" />
            </a-form-item>

            <a-form-item
              :label="t('sys.keyOfSth', { sth: t('sys.integration.dataSource') })"
              name="key"
              :rules="[
                { required: true, whitespace: true },
                { pattern: /^[a-z0-9_]+$/, message: t('sys.integration.ds.keyFormat') },
              ]"
            >
              <a-input
                v-model:value="formState.key"
                :disabled="isEdit"
                :addon-before="PREFIX"
                show-count
                :maxlength="32 - PREFIX.length"
              />
            </a-form-item>

            <a-form-item :label="t('sys.description')" name="description">
              <a-textarea
                v-model:value="formState.description"
                show-count
                :rows="3"
                :maxlength="120"
              />
            </a-form-item>
          </a-form>
        </a-collapse-panel>

        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-tabs
            v-model:activeKey="activeTab"
            animated
            @change="handleTabChange"
            :class="inEDHRApp ? 'no-tabs-nav' : ''"
          >
            <a-tab-pane :key="DataSourceEnv.Dev" :tab="t('sys.integration.env.dev')">
              <a-form
                ref="DevFormRef"
                :model="envDataMap[DataSourceEnv.Dev]"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 14 }"
              >
                <db-setting :data="envDataMap[DataSourceEnv.Dev]" />
              </a-form>
            </a-tab-pane>
            <a-tab-pane :key="DataSourceEnv.Test" :tab="t('sys.integration.env.test')">
              <a-form
                ref="TestFormRef"
                :model="envDataMap[DataSourceEnv.Test]"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 14 }"
              >
                <db-setting :data="envDataMap[DataSourceEnv.Test]" />
              </a-form>
            </a-tab-pane>
            <a-tab-pane :key="DataSourceEnv.Prod" :tab="t('sys.integration.env.prod')">
              <a-form
                ref="ProdFormRef"
                :model="envDataMap[DataSourceEnv.Prod]"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 14 }"
              >
                <db-setting :data="envDataMap[DataSourceEnv.Prod]" />
              </a-form>
            </a-tab-pane>
          </a-tabs>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, nextTick, inject } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { DataSourceMainRequest, DataSourceDetailRequest } from '/@/apis/gct-platform/model';
  import {
    postDataSourceTestConnect,
    postDataSource,
    putDataSource,
  } from '/@/apis/gct-platform/DataSourceController';
  import { DataSourceEnv, DataSourceEnvOptions } from '../enum';
  import DbSetting from '../components/db-setting.vue';
  import { omit, pick } from 'lodash-es';

  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const emit = defineEmits(['ok']);

  const PREFIX = 'ds_';

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    const { edit, record } = data;
    isEdit.value = !!edit;
    if (isEdit.value) {
      isEdit.value &&
        Object.assign(formState, {
          ...record,
          key: record.key.replace(PREFIX, ''),
        });
    } else {
      formState.key = Math.random().toString(36).substring(2, 10);
    }
  });
  const activePanel = ref(['1', '2']);
  const activeTab = ref(DataSourceEnv.Dev);
  let checkingEnv: DataSourceEnv | null;
  let createEnvCopyed: DataSourceEnv[] = [];

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const DevFormRef = ref<FormInstance>();
  const TestFormRef = ref<FormInstance>();
  const ProdFormRef = ref<FormInstance>();

  const envFormMap: Record<DataSourceEnv, any> = {
    [DataSourceEnv.Dev]: DevFormRef,
    [DataSourceEnv.Test]: TestFormRef,
    [DataSourceEnv.Prod]: ProdFormRef,
  };

  const getDetailList = (): DataSourceDetailRequest[] => {
    return [
      {
        env: DataSourceEnv.Dev,
      },
      {
        env: DataSourceEnv.Test,
      },
      {
        env: DataSourceEnv.Prod,
      },
    ];
  };

  const formState: Partial<DataSourceMainRequest> = reactive({
    detailList: getDetailList(),
  });

  const envDataMap = computed<Record<DataSourceEnv, DataSourceDetailRequest>>(() => {
    return formState.detailList?.reduce((map: any, item) => {
      map[item.env as string] = item;
      return map;
    }, {});
  });

  const handleClose = () => {
    isEdit.value = false;
    checkingEnv = null;
    activeTab.value = DataSourceEnv.Dev;
    activePanel.value = ['1', '2'];
    createEnvCopyed = [];
    formRef.value?.resetFields();
    DevFormRef.value?.resetFields();
    TestFormRef.value?.resetFields();
    ProdFormRef.value?.resetFields();
  };

  const handleTestConnect = async () => {
    const data = envDataMap.value[activeTab.value];
    const form = envFormMap[activeTab.value];
    await Promise.all([form.value?.validate(), formRef.value?.validate('type')]);
    const result = await postDataSourceTestConnect({
      ...data,
      type: formState.type,
    });
    if (result) {
      message.success(t('sys.integration.db.testConnectSuccess'));
    } else {
      message.warn(
        t('sys.integration.db.envTestConnectFailure', {
          env: t(`sys.integration.env.${activeTab.value}`),
        }),
      );
    }
  };

  const resetDetailList = () => {
    formState.detailList = getDetailList();
  };

  const handleTabChange = (activeKey: any) => {
    const value = activeKey as DataSourceEnv;
    if (isEdit.value) return;
    if (createEnvCopyed.includes(value)) return;
    const target = formState.detailList?.find((e) => e.env === value);
    if (!target) return;
    Object.assign(target, omit(envDataMap.value[DataSourceEnv.Dev], 'env'));
    createEnvCopyed.push(value);
  };

  const handleOk = async () => {
    changeOkLoading(true);
    checkingEnv = null;
    try {
      await formRef.value?.validate();
      checkingEnv = DataSourceEnv.Dev;
      if (DevFormRef.value) {
        await DevFormRef.value.validate();
      } else {
        throw new Error();
      }
      if (!inEDHRApp.value) {
        checkingEnv = DataSourceEnv.Test;
        if (TestFormRef.value) {
          await TestFormRef.value.validate();
        } else {
          throw new Error();
        }
        checkingEnv = DataSourceEnv.Prod;
        if (ProdFormRef.value) {
          await ProdFormRef.value.validate();
        } else {
          throw new Error();
        }
      } else {
        const envInputData = pick(envDataMap.value[DataSourceEnv.Dev], [
          'ip',
          'port',
          'dbName',
          'userName',
          'password',
        ]);
        formState.detailList!.forEach((item) => {
          Object.assign(item, envInputData);
        });
      }
      const params = {
        ...formState,
        key: PREFIX + formState.key,
      };
      if (isEdit.value) {
        await putDataSource(params);
        message.success(t('sys.model.modifySuccess'));
      } else {
        await postDataSource(params);
        message.success(t('sys.createSuccess'));
      }
      closeModal();
      emit('ok');
    } catch (err) {
      console.warn(err);
      if (checkingEnv) {
        activeTab.value = checkingEnv;
        await nextTick();
        envFormMap[checkingEnv].value.validate();
      }
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less" scoped>
  .ant-tabs {
    :deep(.ant-tabs-nav-list) {
      padding-left: 12px;
    }
    :deep(.ant-tabs-tab-btn) {
      padding-left: 16px;
      padding-right: 16px;
      &::before {
        content: '*';
        color: #f54547;
        margin-right: 4px;
      }
    }
  }

  .ant-collapse {
    :deep(.ant-collapse-header) {
      font-weight: 500;
      color: #212528;
    }
    :deep(.ant-collapse-content-box) {
      padding-left: 0;
      padding-right: 0;
    }
  }

  // 隐藏环境标签
  .no-tabs-nav {
    :deep(.ant-tabs-nav) {
      display: none;
    }
  }
</style>
