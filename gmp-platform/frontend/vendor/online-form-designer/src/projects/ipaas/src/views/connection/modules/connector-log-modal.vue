<template>
  <a-drawer
    v-model:visible="visible"
    v-bind="props.options"
    width="55vw"
    :mask-closable="true"
    :keyboard="false"
  >
    <template v-if="context.authMode === AuthModeEnum.AD">
      <a-divider class="important--mt-4px" orientation="left">{{ $t('sys.basicInfo') }}</a-divider>
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item :label="$t('sys.integration.requestAddress')">{{
          context.loginAddress
        }}</a-descriptions-item>
        <a-descriptions-item :label="$t('sys.integration.loginAccount')">{{
          authAccount
        }}</a-descriptions-item>
      </a-descriptions>
    </template>
    <template v-else-if="context.authMode === AuthModeEnum.SAP_RFC">
      <a-divider class="important--mt-4px" orientation="left">{{ $t('sys.basicInfo') }}</a-divider>
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item :label="$t('sys.integration.requestUser')">{{
          context.createUserName
        }}</a-descriptions-item>
        <a-descriptions-item :label="$t('sys.integration.requestTime')">{{
          context.createTime
        }}</a-descriptions-item>
      </a-descriptions>
      <a-divider orientation="left">{{ $t('sys.integration.interfaceRequestMsg') }}</a-divider>
      <div class="msg-container">
        <div>{{ $t('sys.integration.systemNo') }}：{{ authFormConfig.sysnr }}</div>
        <div>ClientID：{{ authFormConfig.clientId }}</div>
        <div>{{ $t('sys.userName') }}：{{ authFormConfig.userName }}</div>
        <div>{{ $t('sys.password') }}：{{ authFormConfig.password }}</div>
        <div>{{ $t('sys.language') }}：{{ authFormConfig.lang }}</div>
      </div>
      <a-divider orientation="left">{{ $t('sys.integration.interfaceReturnRes') }}</a-divider>
      <div class="msg-container">
        <div v-if="props.context.responseMessage?.errorMsg">
          {{ $t('sys.integration.errorMsg') }}：
          <div class="whitespace-pre-line">{{ props.context.responseMessage.errorMsg }}</div>
        </div>
        <div v-else>{{ $t('sys.success') }}</div>
      </div>
    </template>

    <template v-else>
      <a-divider class="important--mt-4px" orientation="left">{{
        $t('sys.integration.interfaceBasicInfo')
      }}</a-divider>
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item :label="$t('sys.integration.requestAddress')" :span="2">{{
          context.loginAddress
        }}</a-descriptions-item>
        <a-descriptions-item :label="$t('sys.integration.requestUser')">{{
          context.createUserName
        }}</a-descriptions-item>
        <a-descriptions-item :label="$t('sys.integration.requestTime')">{{
          context.createTime
        }}</a-descriptions-item>
        <!-- <a-descriptions-item label="引用方法" :span="2" /> -->
      </a-descriptions>
      <a-divider orientation="left">{{ $t('sys.integration.interfaceRequestMsg') }}</a-divider>
      <CodeSection v-if="reqPath" :json="reqPath" title="Path" />
      <CodeSection v-if="reqQuery" :json="reqQuery" title="Query" />
      <CodeSection v-if="reqHeader" :json="reqHeader" title="Header" />
      <CodeSection v-if="reqBody" :json="reqBody" title="Body" />
      <a-divider orientation="left">{{ $t('sys.integration.interfaceReturnRes') }}</a-divider>
      <CodeSection v-if="resHeader" :json="resHeader" title="Header" />
      <CodeSection v-if="resBody" :json="resBody" title="Body" />
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { ConnectorLogResponse } from '/@/apis/gct-ipaas2/model';
  import { AuthModeEnum } from '../../../enums';
  import { CodeSection } from '/@/components/VirtualJsonViewer';

  const visible = ref<boolean>(true);

  const props = defineProps<{
    context: ConnectorLogResponse;
    options?: any;
    callback?: any;
  }>();

  const reqPath = JSON.stringify(props.context.requestMessage?.path, null, 2);
  const reqQuery = JSON.stringify(props.context.requestMessage?.query, null, 2);
  const reqHeader = JSON.stringify(props.context.requestMessage?.header, null, 2);
  const reqBody = JSON.stringify(props.context.requestMessage?.body, null, 2);

  const resHeader = JSON.stringify(props.context.responseMessage?.header, null, 2);
  const resBody = JSON.stringify(props.context.responseMessage?.body, null, 2);

  const authAccount = computed(() => {
    return props.context.requestMessage?.authFormConfig?.find((e) => e.key === 'account')?.value;
  });

  const authFormConfig = computed(() => {
    const arr = props.context.requestMessage?.authFormConfig;
    const obj = arr?.reduce((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    return obj;
  });
</script>

<style lang="less" scoped>
  .msg-container {
    padding: 8px;
    border: 1px solid #e8e8e8;
  }
</style>
