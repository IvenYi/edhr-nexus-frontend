<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('body')]">
      <a-form-item
        :label="t('sys.integration.authApiAddress')"
        name="loginAddress"
        :label-col="{ span: 4 }" 
        :wrapper-col="{ span: 19 }" 
        :rules="[
          {
            required: true,
            whitespace: true,
            message: t('sys.pleaseInputSth', {
              sth: t('sys.integration.authApiAddress'),
            }),
          },
          getUrlRule(t('sys.integration.authApiAddress')),
        ]"
      >
        <ApiActionInput
          :placeholder="
            t('sys.pleaseInputSth', {
              sth: t('sys.integration.authApiAddress'),
            })
          "
          :dynamic-domain="formState.dynamicDomain!"
          v-model:value="formState.loginAddress"
          v-model:http-method="formState.httpMethod"
        />
      </a-form-item>
      <a-tabs v-model:value="activeKey">
        <a-tab-pane key="1">
          <template #tab>
            {{ t('sys.integration.paramSetting') }}
            <IconTooltip :tooltip="tab1Tooltip" />
          </template>
          <a-tabs type="card" animated :class="[ns.e('params-tab')]">
            <a-tab-pane key="1" tab="Header">
              <AuthParamTree :list="formState.__authHeaderParams" position="header" />
            </a-tab-pane>
            <a-tab-pane key="2" tab="Body">
              <AuthParamTree :list="formState.__authBodyParams" position="body" />
            </a-tab-pane>
            <a-tab-pane key="3" tab="Query">
              <AuthParamTree :list="formState.__authQueryParams" position="query" />
            </a-tab-pane>
            <a-tab-pane key="4" tab="Path">
              <AuthParamTree :list="formState.__authPathParams" position="path" />
            </a-tab-pane>
          </a-tabs>
          <!-- <ParamsConfigTabs
            v-model:header="formState.__authHeaderParams"
            v-model:body="formState.__authBodyParams"
            v-model:path="formState.__authPathParams"
            v-model:query="formState.__authQueryParams"
          /> -->

          <div :class="[ns.e('success-setting')]">
            <div :class="[ns.e('success-setting-title')]">
              {{ t('sys.ipaas.authSuccessParam') }}
              <IconTooltip :tooltip="successParamsTooltip" />
              <div :class="[ns.e('success-setting-content')]">
                <AuthSuccessTree :list="formState.__successParams" :max-level="1" />
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #tab>
            {{ t('sys.integration.authRequestParam') }}
            <IconTooltip :tooltip="tab2Tooltip" />
          </template>
          <a-tabs type="card" animated :class="[ns.e('params-tab')]">
            <a-tab-pane key="1" tab="Header">
              <AuthRequestTree :list="formState.__requestHeaderParams" position="header" />
            </a-tab-pane>
            <a-tab-pane key="2" tab="Body">
              <AuthRequestTree :list="formState.__requestBodyParams" position="body" />
            </a-tab-pane>
            <a-tab-pane key="3" tab="Query">
              <AuthRequestTree :list="formState.__requestQueryParams" position="query" />
            </a-tab-pane>
            <a-tab-pane key="4" tab="Path">
              <AuthRequestTree :list="formState.__requestPathParams" position="path" />
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div :class="[ns.e('footer')]">
      <a-button v-if="false" @click="onPrev">
        {{ t('sys.editor.prev') }}
      </a-button>
      <a-button type="primary" @click="onNext">
        {{ t('sys.integration.saveAndDebug') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="auth-params-form">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, ref } from 'vue';
  import { IconTooltip } from '/@/components/ui';
  import AuthParamTree from '../../param-tables/auth-param-tree.vue';
  import { IConnectorDesignerData } from './type';
  import AuthSuccessTree from '../../param-tables/auth-success-tree.vue';
  import AuthRequestTree from '../../param-tables/auth-request-tree.vue';
  import { getController, getUrlRule } from './logic';
  import { ApiActionInput } from '../../../../comps';
  import { validateUrl } from '/@ipaas/utils/url-check';
  import ParamsConfigTabs from '../../../../comps/components/params-config-tabs.vue';

  const { t } = useI18n();
  const ns = useNamespace('auth-params-form');

  const c = getController();

  const activeKey = ref('1');
  const tab1Tooltip = t('sys.integration.auth.tabTip1');
  const tab2Tooltip = t('sys.integration.auth.tabTip2');
  const successParamsTooltip = t('sys.integration.auth.successParamsTip');

  const props = withDefaults(
    defineProps<{
      data: IConnectorDesignerData;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'prev'): void;
    (e: 'next'): void;
  }>();

  const formState = computed({
    get() {
      return props.data;
    },
    set(v) {
      Object.assign(props.data, v);
    },
  });

  const onPrev = () => {
    emit('prev');
  };

  const onNext = async () => {
    await c.createOrUpdate(formState.value);
    emit('next');
  };

  const checkLoginAddress = async (_rule, value: string) => {
    if (!value || formState.value.dynamicDomain || validateUrl(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        t('sys.pleaseInputValidSth', {
          sth: t('sys.ipaas.domain'),
        }),
      );
    }
  };
</script>

<style lang="scss" scoped>
  $auth-params-form: (
    footer-height: 40px,
  );

  @include b(auth-params-form) {
    @include set-component-css-var(auth-params-form, $auth-params-form);

    @include e(body) {
      height: calc(100% - getcssvar(auth-params-form, footer-height));
      padding: 24px 0;
      overflow: auto;
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: getcssvar(auth-params-form, footer-height);
      gap: 16px;
    }

    @include e(success-setting) {
      margin-top: 20px;
    }

    @include e(success-setting-content) {
      padding: 20px 0 10px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
    }

    @include e(params-tab) {
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
  }
</style>
