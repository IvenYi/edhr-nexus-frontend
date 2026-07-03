<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="title"
    centered
    :maskClosable="false"
    :afterClose="handleClose"
    width="900px"
  >
    <a-steps
      v-if="!isEdit"
      v-model:current="currentStep"
      size="small"
      class="w-450px m-auto mb-20px"
    >
      <a-step :title="$t('sys.bi.createApiConn')" />
      <a-step :title="$t('sys.bi.parseReqResult')" />
    </a-steps>
    <a-form
      v-show="steps.current === 1"
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
      :rules="rules"
    >
      <div class="px-16px">
        <a-form-item
          :label="t('sys.bi.sourceName')"
          name="aliasName"
          :rules="[
            { required: true, message: t('sys.pleaseInputSth', { sth: t('sys.bi.sourceName') }) },
          ]"
        >
          <a-input v-model:value="formState.aliasName" :placeholder="t('sys.pleaseInputSth')" />
        </a-form-item>

        <a-form-item
          :label="t('sys.bi.apiAddress')"
          name="url"
          :rules="[
            { required: true, message: t('sys.pleaseInputSth', { sth: t('sys.bi.apiAddress') }) },
          ]"
        >
          <a-input v-model:value="formState.url" :placeholder="t('sys.pleaseInputSth')" />
        </a-form-item>

        <a-form-item
          :label="t('sys.bi.requestType')"
          name="requestType"
          :rules="[{ required: true, whitespace: true }]"
        >
          <a-radio-group v-model:value="formState.requestType" name="radioGroup">
            <a-radio value="get">GET</a-radio>
            <a-radio value="post">POST</a-radio>
          </a-radio-group>
        </a-form-item>
      </div>

      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.bi.connConfig')">
          <a-form-item :label="t('sys.bi.connectionMode')" name="connType">
            <a-radio-group v-model:value="formState.connType" name="radioGroup">
              <a-radio :value="0"
                >{{ $t('sys.bi.extract') }}
                <IconTooltip :tooltip="$t('sys.bi.extractTip')" />
              </a-radio>
              <a-radio :value="1"
                >{{ $t('sys.bi.direct') }}
                <IconTooltip :tooltip="$t('sys.bi.directTip')" />
              </a-radio>
            </a-radio-group>
          </a-form-item>

          <a-row>
            <a-col :span="6" :offset="4">
              <a-form-item
                v-if="formState.connType === 1"
                :label="$t('sys.bi.shortTermCache')"
                name="shortCache"
                :label-col="{ span: 8 }"
              >
                <div class="flex w-full">
                  <a-switch v-model:checked="shortCache" class="mr-4px" />
                  <IconTooltip :tooltip="$t('sys.bi.shortTermCacheTip')" />
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="10" v-if="shortCache">
              <a-form-item class="ttl-form-item" label="" name="ttl">
                <a-select
                  v-model:value="formState.ttl"
                  size="middle"
                  :options="options"
                  :placeholder="$t('sys.pleaseSelectSth')"
                  style="width: 160px"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>

        <a-collapse-panel key="2" :header="t('sys.bi.param.config')">
          <div class="param-config">
            <a-tabs v-model:activeKey="activeTab">
              <a-tab-pane key="preAuth" :tab="$t('sys.bi.preAuth')">
                <a-form-item :label="$t('sys.bi.connSelect')" name="connectorId">
                  <a-select
                    v-model:value="formState.connectorId"
                    :options="appConnectors"
                    :fieldNames="{ label: 'appName', value: 'id' }"
                    :placeholder="$t('sys.pleaseSelectSth')"
                  />
                </a-form-item>
              </a-tab-pane>
              <a-tab-pane key="header" :tab="`${$t('sys.bi.param.header')}（header）`">
                <ParamItems ref="headerRef" v-model:params="formState.header" />
              </a-tab-pane>
              <a-tab-pane key="query" :tab="`${$t('sys.bi.query')}（query）`">
                <ParamItems ref="queryRef" v-model:params="formState.query" />
              </a-tab-pane>
              <a-tab-pane key="body" :tab="`${$t('sys.bi.body')}（body）`">
                <a-radio-group v-model:value="formState.bodyType" name="radioGroup">
                  <a-radio value="json">JSON</a-radio>
                  <a-radio value="x-www-form-urlencoded">x-www-form-urlencoded</a-radio>
                </a-radio-group>
                <code-editor
                  v-if="formState.bodyType == 'json'"
                  v-model:value="formState.bodyJson"
                  language="json"
                  ref="editorRef"
                  :theme="Theme.VS"
                  style="height: 300px"
                  class="dateset-code-wrap"
                  :gapVal="110"
                />
                <ParamItems v-else ref="bodyRef" v-model:params="formState.body" />
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-form>

    <ApiDataPreview
      v-show="steps.current === 2"
      ref="apiCheckedRef"
      :treeData="treeData"
      :originData="originData"
      :selected="selected"
    />

    <template #footer>
      <a-button key="back" @click="handleCancel">
        {{ t('sys.cancel') }}
      </a-button>
      <template v-if="steps.current == 1">
        <a-button key="back" @click="handleTest">
          {{ t('sys.integration.db.testConnect') }}
        </a-button>
        <a-button :disabled="!isTest" @click="handleNext">{{ t('sys.editor.next') }}</a-button>
      </template>
      <template v-else>
        <a-button @click="handleBack">{{ t('sys.editor.prev') }}</a-button>
        <a-button key="submit" type="primary" @click="handleOk">
          {{ t('sys.ok2') }}
        </a-button>
      </template>
    </template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, computed, toRaw, unref, watch, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { Rule } from 'ant-design-vue/es/form';
  import {
    postDatabaseTestApi,
    postDatabase,
    putDatabaseById,
  } from '/@/apis/gct-platform/DatabaseController';
  import { FormInstance, message } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { isEmpty } from 'lodash-es';
  import { getReleasedAppPublishedAppList } from '/@/apis/gct-platform/PublishedAppController';
  import { IconTooltip } from '/@/components/ui';
  import ParamItems from './param-items.vue';
  import ApiDataPreview from './api-data-preview.vue';
  import { Theme } from '/@/components/code-editor/useMonacoEditor';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import type { TreeProps } from 'ant-design-vue';
  import { getConnectorConfigList } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import type { AppConnectorResp } from '/@/apis/gct-ipaas2/model';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);
  const userStore = useUserStore();

  const formState = ref<any>({});
  const rules: Record<string, Rule[]> = {};
  const appOptions = ref<any[]>([]);
  const activeKey = ref(['1', '2']);
  const activeTab = ref('preAuth');
  const editorRef = ref();
  const formRef = ref<FormInstance>();
  const headerRef = ref();
  const queryRef = ref();
  const bodyRef = ref();
  const apiCheckedRef = ref();
  const isTest = ref<boolean>(!!formState.value.id);
  const originData = ref();
  const steps = ref({
    current: 1,
    num: 2,
  });
  const selected = ref();

  const options = [
    {
      label: `5${$t('sys.minute')}`,
      value: 5,
    },
    {
      label: `15${$t('sys.minute')}`,
      value: 15,
    },
    {
      label: `30${$t('sys.minute')}`,
      value: 30,
    },
  ];

  const treeData = ref<TreeProps[]>([]);
  const appConnectors = ref<AppConnectorResp[]>([]);

  //打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    await getMineAppData();
    formState.value = data;
    selected.value = data.selected;
  };

  watch(
    () => formState.value,
    (val) => {
      console.log('formState.value.header', val);
      isTest.value = false;
    },
    {
      deep: true,
    },
  );

  const shortCache = computed({
    get() {
      return !!formState.value.ttl;
    },
    set(v) {
      if (v) {
        formState.value.ttl = 5;
      } else {
        formState.value.ttl = undefined;
      }
    },
  });

  const currentStep = computed(() => {
    return steps.value.current - 1;
  });

  const isEdit = computed(() => {
    return !!formState.value.id;
  });

  const title = computed(() => {
    return (isEdit.value ? t('sys.edit') : t('sys.setUp')) + t('sys.bi.apiSource');
  });

  const getMineAppData = async () => {
    if (isEmpty(userStore.getTenant)) return;
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
        const data = handleData(true);
        if (!(JSON.parse(data.apiConfig) || {})?.selected?.length) {
          message.error(t('请先进行数据结构配置！'));
          return;
        }
        if (isEdit.value) {
          //编辑
          await putDatabaseById({ id: formState.value.id }, data);
        } else {
          //新增
          await postDatabase(data);
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
    handleClose();
  };

  const handgetParams = (list) => {
    return list.reduce((obj, item) => {
      obj[item['key']] = item['value'];
      return obj;
    }, {});
  };

  const handleData = (hasCheck = false) => {
    const rawData = toRaw(unref(formState));
    const apiConfig = {
      connectorId: rawData.connectorId,
      requestType: rawData.requestType,
      ttl: rawData.ttl,
      connType: rawData.connType,
      header: headerRef.value?.getParamsData() || handgetParams(rawData.header),
      query: queryRef.value?.getParamsData() || handgetParams(rawData.query),
      body:
        rawData.bodyType == 'json'
          ? rawData.bodyJson
          : bodyRef.value?.getParamsData() || handgetParams(rawData.bodyJson),
      bodyType: rawData.bodyType,
    };
    const basicConfig = {
      aliasName: rawData.aliasName,
      url: rawData.url,
      type: rawData.type,
    };
    if (hasCheck) {
      apiConfig['selected'] = apiCheckedRef.value?.getCheckedKeys() || rawData.selected;
      basicConfig['appId'] = rawData.appId;
    }
    return {
      ...basicConfig,
      apiConfig: JSON.stringify(apiConfig),
    };
  };

  const handleTest = async () => {
    formRef.value?.validate().then(async () => {
      //测试连接
      try {
        const data = handleData();
        const res = (await postDatabaseTestApi(data)) || {};
        treeData.value = [res?.tree];
        originData.value = res?.data || '{}';
        isTest.value = true;
        message.success(t('sys.integration.db.testConnectSuccess'));
      } catch (error) {
        isTest.value = false;
      }
    });
  };

  const handleNext = () => {
    steps.value.current++;
  };

  const handleBack = () => {
    steps.value.current--;
  };

  const handleClose = () => {
    Object.assign(formState, { id: undefined });
    apiCheckedRef.value?.resetPreview();
    formRef.value?.resetFields();
    formState.value = {};
    steps.value.current = 1;
    activeTab.value = 'preAuth';
  };

  const getAppConnectors = () => {
    getConnectorConfigList().then((res) => {
      appConnectors.value = res ?? [];
    });
  };

  const reloadEditor = async (script) => {
    editorRef.value?.reload(script);
  };

  onMounted(() => {
    getAppConnectors();
  });
</script>

<style lang="less" scoped>
  .param-config {
    border: 1px solid #f0f0f0;
    padding: 0 10px 10px;
  }
  :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
    padding-top: 0;
  }
  :deep(
    .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
  ) {
    padding-top: 0;
    padding-bottom: 0;
  }
  :deep(.dateset-code-wrap.m-e .m-e-main .m-e-main_container) {
    min-height: 140px;
  }
</style>
