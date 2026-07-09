<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('body')]">
      <a-form-item
        v-if="data.dynamicDomain"
        class=""
        :label="t('sys.integration.domainAddress')"
        :rules="[getUrlRule(t('sys.integration.domainAddress'))]"
      >
        <UrlInput
          :placeholder="
            t('sys.pleaseInputSth', {
              sth: t('sys.ipaas.domain'),
            })
          "
          v-model:value="formState.host"
        />
      </a-form-item>
      <div class="mb-20px">
        <a-radio-group v-model:value="formState.debugType" @change="onDebugTypeChange">
          <a-radio :value="debugTypeEnum.DEBUG_LOGIN">
            {{ t('sys.integration.auth.debugLogin') }}
          </a-radio>
          <a-radio :value="debugTypeEnum.DEBUG_ACTION">
            {{ t('sys.integration.auth.debugAction') }}
          </a-radio>
        </a-radio-group>
      </div>
      <template v-if="formState.debugType === debugTypeEnum.DEBUG_ACTION">
        <a-form-item
          class="mt-16"
          :label="t('sys.integration.auth.setDebugInterface')"
          :rules="[getUrlRule(t('sys.integration.debugApiAddress'))]"
        >
          <ApiActionInput
            :placeholder="
              t('sys.pleaseInputSth', {
                sth: t('sys.integration.debugApiAddress'),
              })
            "
            :dynamic-domain="0"
            v-model:value="formState.debugAddress"
            v-model:http-method="formState.debugRequestMethod"
          />
        </a-form-item>
        <a-tabs type="card" animated :class="[ns.e('params-tab')]">
          <a-tab-pane key="1" tab="Header">
            <AuthRequestTree :list="formState.requestHeaderParams" position="header" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="Body">
            <AuthRequestTree :list="formState.requestBodyParams" position="body" />
          </a-tab-pane>
          <a-tab-pane key="3" tab="Query">
            <AuthRequestTree :list="formState.requestQueryParams" position="query" />
          </a-tab-pane>
          <a-tab-pane key="4" tab="Path">
            <AuthRequestTree :list="formState.requestPathParams" position="path" />
          </a-tab-pane>
        </a-tabs>
        <a-button :class="[ns.e('debug-btn')]" :loading="isBtnLoading" @click="onTestBusinessApi">{{
          t('sys.integration.auth.debugBusiness')
        }}</a-button>
      </template>
      <template v-else>
        <a-button :class="[ns.e('debug-btn')]" :loading="isBtnLoading" @click="onTestAuthApi">{{
          t('sys.integration.auth.debugLogin')
        }}</a-button>
      </template>
      <a-tabs v-model:activeKey="activeKey" :class="[ns.e('result-tab')]">
        <a-tab-pane key="1" :tab="t('sys.integration.requestParams')">
          <VirtualJsonViewer
            :class="[ns.e('result-tab-code')]"
            v-if="formState.requestJson"
            :json="formState.requestJson"
            :max-height="800"
          />
          <a-empty v-else :description="t('sys.integration.noInfo')" :image="EmptyImg" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.integration.returnResult')">
          <VirtualJsonViewer
            :class="[ns.e('result-tab-code')]"
            v-if="formState.responseJson"
            :json="formState.responseJson"
            :max-height="800"
          />
          <a-empty v-else :description="t('sys.integration.noInfo')" :image="EmptyImg" />
        </a-tab-pane>
      </a-tabs>
    </div>
    <div :class="[ns.e('footer')]">
      <a-button @click="onPrev">
        {{ t('sys.editor.prev') }}
      </a-button>
      <a-button type="primary" @click="onFinish">
        {{ t('sys.integration.complete') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="auth-debug-form">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref } from 'vue';
  import { IConnectorDesignerData } from './type';
  import { getUrlRule, toConfigData } from './logic';
  import { ApiActionInput, UrlInput } from '/@ipaas/comps';
  import AuthRequestTree from '../../param-tables/auth-request-tree.vue';
  import {
    postAuthTestConnect,
    postAuthTestRequestService,
  } from '/@/apis/gct-ipaas2/AuthController';
  import JsonPathUtil from '/@ipaas/utils/JsonPathUtil.js';
  import EmptyImg from '@/assets/images/empty.png';
  import { VirtualJsonViewer } from '/@/components/VirtualJsonViewer';

  const { t } = useI18n();
  const ns = useNamespace('auth-debug-form');

  const props = withDefaults(
    defineProps<{
      data: IConnectorDesignerData;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'prev'): void;
    (e: 'close'): void;
  }>();

  enum debugTypeEnum {
    DEBUG_LOGIN = 'DEBUG_LOGIN',
    DEBUG_ACTION = 'DEBUG_ACTION',
  }

  const activeKey = ref('2');

  const formState = ref({
    host: '',
    debugAddress: '',
    debugRequestMethod: 'POST',
    debugType: debugTypeEnum.DEBUG_LOGIN,
    requestHeaderParams: [
      {
        key: 'header',
        keyType: 'Object',
        children: [],
      },
    ],
    requestBodyParams: [
      {
        key: 'body',
        keyType: 'Object',
        children: [],
      },
    ],
    requestQueryParams: [
      {
        key: 'query',
        keyType: 'Object',
        children: [],
      },
    ],
    requestPathParams: [
      {
        key: 'path',
        keyType: 'Object',
        children: [],
      },
    ],
    requestJson: null,
    responseJson: null,
  });

  const onPrev = () => {
    emit('prev');
  };

  const onFinish = () => {
    emit('close');
  };

  const isBtnLoading = ref(false);

  /** 切换调试类型时 清空请求和返回结果  */
  const onDebugTypeChange = () => {
    formState.value.requestJson = '';
    formState.value.responseJson = '';
  };

  /** 鉴权接口调试 */
  const onTestAuthApi = async () => {
    isBtnLoading.value = true;
    try {
      const config = toConfigData(props.data);
      config.host = formState.value.host;
      const res: any = await postAuthTestConnect(config);
      console.log(res);
      formState.value.requestJson = '';
      formState.value.responseJson = '';
      formState.value.requestJson = res?.request ? JSON.stringify(res.request, null, 2) : '';
      formState.value.responseJson = res?.response ? JSON.stringify(res.response, null, 2) : '';
    } finally {
      isBtnLoading.value = false;
    }
  };

  /** 业务接口调试 */
  const onTestBusinessApi = async () => {
    isBtnLoading.value = true;
    try {
      const config = toConfigData(props.data) as any;
      config.host = formState.value.host;
      config.debugAddress = formState.value.debugAddress;
      config.debugRequestConfig = [
        ...(formState.value.requestPathParams[0]?.children ?? []),
        ...(formState.value.requestQueryParams[0]?.children ?? []),
        ...(formState.value.requestHeaderParams[0]?.children ?? []),
        ...(formState.value.requestBodyParams[0]?.children ?? [])
          .map((item) => JsonPathUtil.toList(item))
          .flat(),
      ];
      config.debugRequestMethod = formState.value.debugRequestMethod;
      const res = await postAuthTestRequestService(config);
      formState.value.requestJson = res?.request ? JSON.stringify(res.request, null, 2) : '';
      formState.value.responseJson = res?.response ? JSON.stringify(res.response, null, 2) : '';
      console.log(res);
    } finally {
      isBtnLoading.value = false;
    }
  };
</script>

<style lang="scss" scoped>
  $auth-debug-form: (
    footer-height: 40px,
  );

  @include b(auth-debug-form) {
    @include set-component-css-var(auth-debug-form, $auth-debug-form);

    @include e(body) {
      height: calc(100% - getcssvar(auth-debug-form, footer-height));
      padding: 20px 0;
      overflow: auto;
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: getcssvar(auth-debug-form, footer-height);
      gap: 16px;
    }

    @include e(params-tab) {
      margin-bottom: 20px;

      :deep(.ant-tabs-nav) {
        margin-bottom: 0;

        &::before {
          display: none;
        }

        .ant-tabs-tab {
          border-bottom-width: 0;
        }
      }

      :deep(.ant-tabs-content-holder) {
        padding-top: 10px;
        border: 1px solid #f0f0f0;
      }
    }

    @include e(debug-btn) {
      display: block;
    }

    @include e(result-tab) {
      margin-top: 8px;
    }

    @include e(result-tab-code) {
      min-height: 200px;
      padding: 16px 0;
    }

    // 暂无信息的样式
    :deep(.ant-empty-image) {
      margin-bottom: 0;
    }

    :deep(.ant-empty-description) {
      color: #a6a6a6;
      font-size: 12px;
    }
  }
</style>
