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
              :label="$t('sys.ipaas.businessName')"
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
              <a-input v-model:value="formState.appName" show-count :maxlength="32" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="$t('sys.ipaas.requestProtocol')" name="authMode" :rules="[{ required: true }]">
              <a-select v-model:value="formState.authMode">
                <a-select-option v-for="item in AuthModeEnum" :key="item" :value="item">
                  {{ t('sys.ipaas.authModeEnum.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              :label="$t('sys.ipaas.interfaceAddress')"
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

          <a-col :span="12">
            <a-form-item :label="$t('sys.ipaas.requestMethod')" name="authMode" :rules="[{ required: true }]">
              <a-select v-model:value="formState.authMode">
                <a-select-option v-for="item in AuthModeEnum" :key="item" :value="item">
                  {{ t('sys.ipaas.authModeEnum.' + item) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <template v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN">
        <a-divider orientation="left" class="important-mt-24px">
          {{ t('sys.ipaas.authConfigParam') }}
          <a-tooltip>
            <template #title>
              {{ $t('sys.ipaas.authConfigParamTip2') }}
            </template>
            <a @click.prevent class="ml-12px"><question-circle-outlined /></a>
          </a-tooltip>
        </a-divider>
        <a-tabs type="card" animated>
          <a-tab-pane key="1" tab="Header">
            <!-- <AuthParamTree :list="authHeaderParams" position="header" /> -->
            <ApiReqTree :list="apiReqHeaderParams" position="header" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="Body">
            <ApiReqTree :list="apiReqBodyParams" position="body" />
          </a-tab-pane>
          <a-tab-pane key="3" tab="Query">
            <ApiReqTree :list="apiReqQueryParams" position="query" />
          </a-tab-pane>
          <a-tab-pane key="4" tab="Path">
            <ApiReqTree :list="apiReqPathParams" position="path" />
          </a-tab-pane>
        </a-tabs>

        <!-- <a-divider orientation="left" class="important-mt-24px">
          {{ t('sys.ipaas.authSuccessParam') }}
          <a-tooltip>
            <template #title>
              成功完成鉴权配置意味着设置了一系列规则和字段确保数据传输的安全性和可靠性，通常以部分字段核实是否鉴权成功，如果需要获取返回体中的参数可遵循以下写法$("返回体JSON".参数)
            </template>
            <a @click.prevent class="ml-12px"><question-circle-outlined /></a>
          </a-tooltip>
        </a-divider>

        <div class="border-as-tabs">
          <AuthSuccessTree :list="successParams" :max-level="1" />
        </div> -->

        <!-- <a-divider orientation="left" class="important-mt-24px">
          {{ t('sys.ipaas.authRequestParam') }}
          <a-tooltip>
            <template #title>
              鉴权入参是确保连接流在数据传输中的组成部分。这些参数会伴随连接流一并发起传递至连接器中，通常用于减少大量且重复的配置时使用，如果需要获取返回体中的参数可遵循以下写法$("返回体JSON".参数)
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
        </a-tabs> -->
      </template>

      <!-- <template v-else-if="formState.authMode === AuthModeEnum.DIRECT_ACCESS">
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
      </template> -->
    </a-spin>

    <!-- <ResponseData
      v-if="formState.authMode === AuthModeEnum.ACCESS_TOKEN"
      class="test__response-data"
      ref="ResponseDataRef"
      :content="testResponse"
    /> -->

    <template #footer>
      <div class="flex items-center">
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
  import ApiReqTree from './api-req-tree.vue';
  // import AuthSuccessTree from '../param-tables/auth-success-tree.vue';
  // import AuthRequestTree from '../param-tables/auth-request-tree.vue';
  // import ResponseData from './response-data.vue';
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

  const apiReqHeaderParams = ref([]);
  const apiReqBodyParams = ref([]);
  const apiReqQueryParams = ref([]);
  const apiReqPathParams = ref([]);

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
  const initApiReqParams = () => {
    apiReqPathParams.value = [
      {
        key: 'path',
        keyType: 'Object',
        children: [],
      },
    ];
    apiReqQueryParams.value = [
      {
        key: 'query',
        keyType: 'Object',
        children: [],
      },
    ];
    apiReqHeaderParams.value = [
      {
        key: 'header',
        keyType: 'Object',
        children: [],
      },
    ];

    // const body = formState.authParam!.filter((item) => item.paramType === 'body');
    // authBodyParams.value = JsonPathUtil.toTree(body, { root: { key: 'body' } });
    apiReqBodyParams.value = [
      {
        key: 'body',
        keyType: 'Object',
        children: [],
      },
    ];
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
    initApiReqParams();
    // initSuccessParams();
    // initRequestParams();
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
  // .app-selector :deep(.ant-select-selector) {
  //   border: none;
  //   box-shadow: none !important;
  // }

  // .test__response-data {
  //   position: absolute;
  //   bottom: 10px;
  //   left: 0;
  //   transform: translateX(calc(-100% - 10px));
  // }

  // .test__status--not-tested {
  //   color: var(--ant-error-color);
  //   font-size: 12px;
  //   margin-left: 12px;
  //   display: flex;
  //   align-items: center;

  //   &::before {
  //     display: block;
  //     content: '';
  //     height: 6px;
  //     width: 6px;
  //     border-radius: 50%;
  //     background-color: var(--ant-error-color);
  //     margin-right: 4px;
  //   }
  // }

  // .ant-tabs {
  //   :deep(.ant-tabs-nav) {
  //     margin-bottom: 0;
  //   }

  //   :deep(.ant-tabs-content-holder) {
  //     padding: 20px 0 10px 0;
  //     border: 1px solid #f0f0f0;
  //     border-top: none;
  //     border-bottom-left-radius: 4px;
  //     border-bottom-right-radius: 4px;
  //   }
  // }

  // .border-as-tabs {
  //   border: 1px solid #f0f0f0;
  //   border-radius: 4px;
  //   padding: 20px 0 10px 0;
  // }
</style>
