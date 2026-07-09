<template>
  <a-drawer
    v-model:visible="visible"
    v-bind="props.options"
    width="55vw"
    :mask-closable="false"
    :keyboard="false"
    class="connection-setting-modal"
  >
    <a-spin :spinning="spinning">
      <a-form ref="formRef" :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-row>
          <a-col :span="12">
            <a-form-item
              :label="t('sys.ipaas.appName')"
              name="appName"
              :rules="[
                {
                  required: true,
                  message: t('sys.pleaseInputSth', {
                    sth: t('sys.ipaas.appName'),
                  }),
                },
              ]"
            >
              <AppTreeAutocomplete :value="formState.appName" @app-change="handleAppChange">
                <a-input
                  v-model:value="formState.appName"
                  show-count
                  :maxlength="32"
                  @change="handleAppTextChange"
                />
              </AppTreeAutocomplete>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              :label="t('sys.ipaas.appBrand')"
              name="brand"
              :rules="[
                {
                  required: true,
                  message: t('sys.pleaseInputSth', {
                    sth: t('sys.ipaas.appBrand'),
                  }),
                },
              ]"
            >
              <a-input
                :disabled="isEdit"
                v-model:value="formState.brand"
                show-count
                :maxlength="32"
                @change="handleAppTextChange"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              :label="t('sys.ipaas.appVersion')"
              name="version"
              :rules="[
                {
                  required: true,
                  message: t('sys.pleaseInputSth', {
                    sth: t('sys.ipaas.appVersion'),
                  }),
                },
              ]"
            >
              <a-input
                :disabled="isEdit"
                v-model:value="formState.version"
                show-count
                :maxlength="32"
                @change="handleAppTextChange"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              :label="t('sys.ipaas.authOrNot')"
              name="authMode"
              :rules="[{ required: true }]"
            >
              <a-select v-model:value="formState.authMode">
                <a-select-option v-for="item in AuthModeEnum" :key="item" :value="item">
                  {{ t('sys.ipaas.authModeEnum.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              :label="t('sys.ipaas.domain')"
              name="host"
              :rules="[{ validator: checkHost, trigger: 'change' }]"
            >
              <a-input v-model:value="formState.host" show-count :maxlength="128">
                <template #addonBefore>
                  <a-select v-model:value="hostProtocol" style="width: 90px">
                    <a-select-option v-for="item in ProtocolEnum" :key="item" :value="item">{{
                      item
                    }}</a-select-option>
                  </a-select>
                </template>
              </a-input>
            </a-form-item>
          </a-col>

          <a-col :span="12" v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN">
            <a-form-item
              :label="t('sys.integration.authEffectiveTime')"
              name="effectiveTime"
              :rules="[
                {
                  required: true,
                  message: t('sys.pleaseInputSth', {
                    sth: t('sys.integration.authEffectiveTime'),
                  }),
                },
              ]"
            >
              <a-input-number
                v-model:value="formState.effectiveTime"
                :min="1"
                :max="999999999"
                :step="1"
                :precision="0"
              >
                <template #addonAfter>
                  <a-select style="width: 84px" v-model:value="formState.timeUnit">
                    <a-select-option
                      v-for="item in EffectiveTimeUnitEnum"
                      :key="item"
                      :value="item"
                      >{{ t('sys.ipaas.timeUnit.' + item) }}</a-select-option
                    >
                  </a-select>
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN"
          :label="t('sys.integration.authApiAddress')"
          name="loginAddress"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 20 }"
          :rules="[
            {
              required: true,
              whitespace: true,
              message: t('sys.pleaseInputSth', {
                sth: t('sys.integration.authApiAddress'),
              }),
            },
            { validator: checkLoginAddress, trigger: 'change' },
          ]"
          validateFirst
        >
          <a-input v-model:value="formState.loginAddress" show-count :maxlength="128">
            <template #addonBefore>
              <a-select v-model:value="authProtocol" style="width: 90px">
                <a-select-option v-for="item in ProtocolEnum" :key="item" :value="item">{{
                  item
                }}</a-select-option>
              </a-select>
            </template>
            <template #addonAfter>
              <a-select v-model:value="formState.httpMethod" style="width: 84px">
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
              </a-select>
            </template>
          </a-input>
        </a-form-item>
      </a-form>

      <template v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN">
        <a-divider orientation="left" class="important-mt-24px">
          {{ t('sys.ipaas.authConfigParam') }}
          <a-tooltip>
            <template #title>
              {{ t('sys.ipaas.authConfigParamTip') }}
            </template>
            <a @click.prevent class="ml-12px"><question-circle-outlined /></a>
          </a-tooltip>
        </a-divider>
        <a-tabs type="card" animated>
          <a-tab-pane key="1" tab="Header">
            <AuthParamTree :list="authHeaderParams" position="header" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="Body">
            <AuthParamTree :list="authBodyParams" position="body" />
          </a-tab-pane>
          <a-tab-pane key="3" tab="Query">
            <AuthParamTree :list="authQueryParams" position="query" />
          </a-tab-pane>
          <a-tab-pane key="4" tab="Path">
            <AuthParamTree :list="authPathParams" position="path" />
          </a-tab-pane>
        </a-tabs>

        <a-divider orientation="left" class="important-mt-24px">
          {{ t('sys.ipaas.authSuccessParam') }}
          <a-tooltip>
            <template #title>
              {{ t('sys.ipaas.authSuccessParamTip') }}
            </template>
            <a @click.prevent class="ml-12px"><question-circle-outlined /></a>
          </a-tooltip>
        </a-divider>

        <div class="border-as-tabs">
          <AuthSuccessTree :list="successParams" :max-level="1" />
        </div>

        <a-divider orientation="left" class="important-mt-24px">
          {{ t('sys.ipaas.authRequestParam') }}
          <a-tooltip>
            <template #title>
              {{ t('sys.ipaas.authRequestParamTip') }}
            </template>
            <a @click.prevent class="ml-12px"><question-circle-outlined /></a>
          </a-tooltip>
        </a-divider>

        <a-tabs type="card" animated>
          <a-tab-pane key="1" tab="Header">
            <AuthRequestTree :list="requestHeaderParams" position="header" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="Body">
            <AuthRequestTree :list="requestBodyParams" position="body" />
          </a-tab-pane>
          <a-tab-pane key="3" tab="Query">
            <AuthRequestTree :list="requestQueryParams" position="query" />
          </a-tab-pane>
          <a-tab-pane key="4" tab="Path">
            <AuthRequestTree :list="requestPathParams" position="path" />
          </a-tab-pane>
        </a-tabs>
      </template>

      <template v-else-if="formState.authMode === AuthModeEnum.DIRECT_ACCESS">
        <a-divider orientation="left" class="important-mt-24px">{{
          t('sys.ipaas.authAssignParam')
        }}</a-divider>
        <a-tabs type="card" animated>
          <a-tab-pane key="1" tab="Header">
            <AuthParamTree :list="authHeaderParams" position="header" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="Body">
            <AuthParamTree :list="authBodyParams" position="body" />
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-spin>

    <ResponseData
      v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN"
      class="test__response-data"
      ref="ResponseDataRef"
      :content="testResponse"
    />

    <template #footer>
      <div class="flex items-center">
        <template v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN">
          <a-button :loading="spinning" @click="handleTestConnection">{{
            t('sys.ipaas.testConnection')
          }}</a-button>
          <span class="test__status--not-tested" v-show="testResponse === undefined">{{
            t('sys.ipaas.notTested')
          }}</span>
        </template>

        <a-button
          :loading="spinning"
          style=" margin-right: 8px;margin-left: auto"
          @click="handleCancel"
          >{{ t('sys.cancelText') }}</a-button
        >
        <a-button :loading="spinning" type="primary" @click="handleOk">{{
          t('sys.okText')
        }}</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AuthParamTree from '../param-tables/auth-param-tree.vue';
  import AuthSuccessTree from '../param-tables/auth-success-tree.vue';
  import AuthRequestTree from '../param-tables/auth-request-tree.vue';
  import ResponseData from './response-data.vue';
  import {
    postConnectorConfig,
    putConnectorConfigById,
  } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import type {
    ConnectorConfigRequest,
    AppAuthParamConfig,
    AppAuthRequestConfig,
    AppAuthSuccessExpression,
  } from '/@/apis/gct-ipaas2/model';
  import { getCategories } from '/@/apis/gct-ipaas/IpaasCategoryController';
  import type { CategoryResp } from '/@/apis/gct-ipaas/model';
  import { AuthModeEnum, EffectiveTimeUnitEnum } from '/@ipaas/enums';
  import { pick, debounce } from 'lodash-es';
  import { postAuthTestConnect } from '/@/apis/gct-ipaas2/AuthController';
  import JsonPathUtil from '/@ipaas/utils/JsonPathUtil.js';

  import { AppTreeAutocomplete } from '/@ipaas/comps/components/app-tree';

  const props = defineProps<{
    context?: any;
    options?: any;
    callback?: any;
    onCancel?: any;
  }>();

  enum ProtocolEnum {
    Http = 'http://',
    Https = 'https://',
  }

  const isEdit = props.context;
  const HostReg = /(https|http):\/\/([\w-]+\.)+[\w-]+(:[0-9]{1,5})?(\/[\w-{}?&%#.=/,^:~+@]*)?/;
  const spinning = ref<boolean>(false);
  const ResponseDataRef = ref();

  /**
   * 上一次检测结果
   */
  const testResponse = ref<string | undefined>(undefined);

  const { t } = useI18n();
  const visible = ref<boolean>(true);
  const formRef = ref<FormInstance>();
  const categories = ref<CategoryResp[]>([]);
  const hostProtocol = ref<ProtocolEnum>(ProtocolEnum.Http);
  const authProtocol = ref<ProtocolEnum>(ProtocolEnum.Http);
  const formState: Partial<ConnectorConfigRequest> = reactive({
    appId: undefined,
    appName: undefined,
    authMode: AuthModeEnum.ACCESS_TOKEN,
    authParam: [],
    brand: undefined,
    connectStatus: undefined,
    effectiveTime: undefined,
    host: undefined,
    httpMethod: 'GET',
    loginAddress: undefined,
    requestConfig: [],
    successExpression: [],
    timeUnit: EffectiveTimeUnitEnum.HOURS,
    version: undefined,
  });

  const authPathParams = ref<AppAuthParamConfig[]>([]);
  const authQueryParams = ref<AppAuthParamConfig[]>([]);
  const authHeaderParams = ref<AppAuthParamConfig[]>([]);
  const authBodyParams = ref<AppAuthParamConfig[]>([]);
  const requestHeaderParams = ref<AppAuthRequestConfig[]>([]);
  const requestBodyParams = ref<AppAuthRequestConfig[]>([]);
  const requestQueryParams = ref<AppAuthRequestConfig[]>([]);
  const requestPathParams = ref<AppAuthRequestConfig[]>([]);
  const successParams = ref<AppAuthSuccessExpression[]>([]);

  if (props.context) {
    Object.assign(formState, props.context);
    updateLoginAddress(formState.loginAddress);
  }

  /**
   * 移除地址中的协议 修改协议的值
   * @param value
   */
  function updateLoginAddress(value) {
    if (!value) return;
    if (value.startsWith(ProtocolEnum.Https)) {
      formState.loginAddress = value.replace(ProtocolEnum.Https, '');
      authProtocol.value = ProtocolEnum.Https;
    } else if (value.startsWith(ProtocolEnum.Http)) {
      formState.loginAddress = value.replace(ProtocolEnum.Http, '');
      authProtocol.value = ProtocolEnum.Http;
    }
  }
  const updateLoginAddressDebounce = debounce(updateLoginAddress, 500);
  /**
   * 监听鉴权地址变化
   */
  watch(
    () => formState.loginAddress,
    (value) => {
      updateLoginAddressDebounce(value);
    },
  );

  /**
   * 移除地址中的协议 修改协议的值
   * @param value
   */
  function updateHost(value) {
    if (!value) return;
    if (value.startsWith(ProtocolEnum.Https)) {
      formState.host = value.replace(ProtocolEnum.Https, '');
      hostProtocol.value = ProtocolEnum.Https;
    } else if (value.startsWith(ProtocolEnum.Http)) {
      formState.host = value.replace(ProtocolEnum.Http, '');
      hostProtocol.value = ProtocolEnum.Http;
    }
  }
  const updateHostDebounce = debounce(updateHost, 500);
  /**
   * 监听鉴权地址变化
   */
  watch(
    () => formState.host,
    (value) => {
      updateHostDebounce(value);
    },
  );

  /**
   * 上一次检测参数
   */
  const testParams = ref<string>('');
  /**
   * 测试参数更新
   * 参数更新重置结果
   */
  const setTestParams = (value: string) => {
    testParams.value = value;
    testResponse.value = undefined;
  };
  const setTestParamsDebounce = debounce(setTestParams, 300);
  /**
   * 影响测试连接的参数
   */
  const testParamsString = computed(() => {
    const { httpMethod, loginAddress } = formState;
    const data = {
      authProtocol: authProtocol.value,
      httpMethod,
      loginAddress,
      authPathParams: authPathParams.value,
      authQueryParams: authQueryParams.value,
      authHeaderParams: authHeaderParams.value,
      authBodyParams: authBodyParams.value,
      successParams: successParams.value,
    };
    return JSON.stringify(data);
  });
  /**
   * 监听影响连接结果的参数变化
   */
  watch(testParamsString, (value) => {
    setTestParamsDebounce(value);
  });

  const checkLoginAddress = async (_rule, value: string) => {
    if (!HostReg.test(`${authProtocol.value}${formState.loginAddress}`)) {
      return Promise.reject(
        t('sys.pleaseInputValidSth', {
          sth: t('sys.integration.authApiAddress'),
        }),
      );
    } else {
      return Promise.resolve();
    }
  };

  const checkHost = async (_rule, value: string) => {
    if (!formState.host || HostReg.test(`${hostProtocol.value}${formState.host}`)) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        t('sys.pleaseInputValidSth', {
          sth: t('sys.ipaas.domain'),
        }),
      );
    }
  };

  /**
   * 鉴权参数初始化
   */
  const initAuthParams = () => {
    authPathParams.value = [
      {
        key: 'path',
        keyType: 'Object',
        children: formState.authParam!.filter((item) => item.paramType === 'path'),
      },
    ];
    authQueryParams.value = [
      {
        key: 'query',
        keyType: 'Object',
        children: formState.authParam!.filter((item) => item.paramType === 'query'),
      },
    ];
    authHeaderParams.value = [
      {
        key: 'header',
        keyType: 'Object',
        children: formState.authParam!.filter((item) => item.paramType === 'header'),
      },
    ];
    const body = formState.authParam!.filter((item) => item.paramType === 'body');
    authBodyParams.value = JsonPathUtil.toTree(body, { root: { key: 'body' } });
  };

  /**
   * 鉴权入参配置
   */
  const initRequestParams = () => {
    requestHeaderParams.value = [
      {
        key: 'header',
        keyType: 'Object',
        children: formState.requestConfig!.filter((item) => item.paramType === 'header'),
      },
    ];
    requestQueryParams.value = [
      {
        key: 'query',
        keyType: 'Object',
        children: formState.requestConfig!.filter((item) => item.paramType === 'query'),
      },
    ];
    requestPathParams.value = [
      {
        key: 'path',
        keyType: 'Object',
        children: formState.requestConfig!.filter((item) => item.paramType === 'path'),
      },
    ];
    const body = formState.requestConfig!.filter((item) => item.paramType === 'body') ?? [];
    requestBodyParams.value = JsonPathUtil.toTree(body, { root: { key: 'body' } });
  };

  /**
   * 成功返回值判断
   */
  const initSuccessParams = () => {
    successParams.value = [
      {
        key: 'response',
        keyType: 'Object',
        children: formState.successExpression ?? [],
      },
    ];
  };

  onMounted(async () => {
    getCategories().then((res) => {
      categories.value = res ?? [];
    });
    initAuthParams();
    initSuccessParams();
    initRequestParams();
  });

  /**
   * 手动选择应用
   */
  // const handleAppSelect = async (id: string) => {
  //   const app = categories.value.find((item) => item.id === id);
  //   if (app) {
  //     const { id, name, version, brand } = app;
  //     formState.appName = name;
  //     formState.appId = id as any;
  //     formState.brand = brand;
  //     formState.version = version;
  //     await nextTick();
  //     setTimeout(() => {
  //       formRef.value?.validateFields(['brand', 'version', 'appName']);
  //     }, 0);
  //   }
  // };

  /**
   * 修改 名称 厂商 版本时候 置空已选应用
   */
  const handleAppTextChange = () => {
    formState.appId = undefined;
  };

  const handleAppChange = async (data) => {
    const { id, name, brand, version } = data;
    formState.appName = name;
    formState.appId = id as any;
    formState.brand = brand;
    formState.version = version;
    await nextTick();
    setTimeout(() => {
      formRef.value?.validateFields(['brand', 'version', 'appName']);
    }, 0);
  };

  const handleCancel = () => {
    if (props.onCancel && typeof props.onCancel) {
      props.onCancel(formState);
    }
    visible.value = false;
  };

  const getFormData = () => {
    const data: any = {
      ...pick(formState, [
        'appId',
        'appName',
        'authMode',
        'authType',
        'brand',
        'effectiveTime',
        'host',
        'httpMethod',
        'loginAddress',
        'timeUnit',
        'version',
        'successExpression',
      ]),
      host: formState.host ? `${hostProtocol.value}${formState.host}` : undefined,
      loginAddress: formState.loginAddress
        ? `${authProtocol.value}${formState.loginAddress}`
        : undefined,
      authParam: [
        ...(authPathParams.value[0]?.children ?? []),
        ...(authQueryParams.value[0]?.children ?? []),
        ...(authHeaderParams.value[0]?.children ?? []),
        ...(authBodyParams.value[0]?.children ?? [])
          .map((item) => JsonPathUtil.toList(item))
          .flat(),
      ],
      requestConfig: [
        ...(requestPathParams.value[0]?.children ?? []),
        ...(requestQueryParams.value[0]?.children ?? []),
        ...(requestHeaderParams.value[0]?.children ?? []),
        ...(requestBodyParams.value[0]?.children ?? [])
          .map((item) => JsonPathUtil.toList(item))
          .flat(),
      ],
      successExpression: successParams.value[0]?.children ?? [],
    };
    return data;
  };

  /**
   * 测试连接
   */
  const handleTestConnection = async () => {
    spinning.value = true;
    let res: any = null;
    try {
      await formRef.value?.validate();
      const data = getFormData();
      res = await postAuthTestConnect({
        id: props.context.id,
        ...data,
      });

      if (res?.connectStatus === 'SUCCESS') {
        message.success(t('sys.ipaas.connectStatusEnum.SUCCESS'));
      } else if (res?.connectStatus === 'FAILURE') {
        message.warn(t('sys.ipaas.connectStatusEnum.FAILURE'));
      }
    } catch (err) {
      console.warn(err);
    } finally {
      spinning.value = false;
    }

    try {
      testResponse.value = JSON.stringify(res?.data, null, 2);
    } catch (err) {
      testResponse.value = res?.data;
    }

    ResponseDataRef.value.setContentVisible(true);
  };

  const handleOk = async () => {
    try {
      await formRef.value?.validate();
      const data = getFormData();

      if (isEdit) {
        await putConnectorConfigById({ id: props.context.id }, data);
      } else {
        await postConnectorConfig(data);
      }
      if (props.callback && typeof props.callback) {
        props.callback(formState);
      }
      visible.value = false;
      message.success(t('sys.saveSuccess'));
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style lang="less" scoped>
  .app-selector :deep(.ant-select-selector) {
    border: none;
    box-shadow: none !important;
  }

  .test__response-data {
    position: absolute;
    bottom: 10px;
    left: 0;
    transform: translateX(calc(-100% - 10px));
  }

  .test__status--not-tested {
    display: flex;
    align-items: center;
    margin-left: 12px;
    color: var(--ant-error-color);
    font-size: 12px;

    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      margin-right: 4px;
      border-radius: 50%;
      background-color: var(--ant-error-color);
    }
  }

  .ant-tabs {
    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
    }

    :deep(.ant-tabs-content-holder) {
      padding: 20px 0 10px;
      border: 1px solid #f0f0f0;
      border-top: none;
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
    }
  }

  .border-as-tabs {
    padding: 20px 0 10px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }
</style>

<style>
  .connection-setting-modal .ant-drawer-content {
    overflow: visible;
  }
</style>
