<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options ?? {}"
    width="1000px"
    wrapClassName="input-param-modal-wrapper"
    :mask-closable="false"
    destroyOnClose
    :keyboard="false"
    :title="$t('sys.onlineForm.inputParameterConfiguration')"
    :cancelText="t('sys.cancel')"
    :okText="t('sys.ok')"
    @cancel="handleClose"
    @ok="handleOk"
  >
    <div class="input-param-modal-container">
      <a-tabs :class="[ns.b()]" type="card" animated>
        <a-tab-pane v-if="showMeta.header" key="1" tab="Header">
          <JsonParamEditor :value="currentMetaHeader" :position="ParameterPosition.HEADER" />
        </a-tab-pane>
        <a-tab-pane v-if="showMeta.body" key="2" tab="Body">
          <JsonParamEditor :value="currentMetaBody" :position="ParameterPosition.BODY" />
        </a-tab-pane>
        <a-tab-pane v-if="showMeta.query" key="3" tab="Query">
          <JsonParamEditor :value="currentMetaQuery" :position="ParameterPosition.QUERY" />
        </a-tab-pane>
        <a-tab-pane v-if="showMeta.uri" key="4" tab="Path">
          <JsonParamEditor :value="currentMetaUri" :position="ParameterPosition.PATH" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<script setup lang="ts" name="input-param-modal">
  import { ref, onMounted, nextTick, reactive } from 'vue';
  import { isEmpty, pick } from 'lodash-es';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { toTreeJsonParam, toApiJsonParam } from '/@ipaas/comps/json-param/logic';
  import JsonParamEditor from './json-param-editor.vue';
  import { ParameterPosition } from '/@ipaas/enums';

  const { t } = useI18n();
  const ns = useNamespace('input-param-modal-tabs');

  const props = defineProps<{
    metaHeader: string;
    metaBody: string;
    metaQuery: string;
    metaUri: string;
    callback?: any;
    options?: object;
  }>();

  const visible = ref<boolean>(true);

  const currentMetaHeader = ref();
  const currentMetaBody = ref();
  const currentMetaQuery = ref();
  const currentMetaUri = ref();
  const showMeta = reactive({
    header: false,
    body: false,
    query: false,
    uri: false,
  });

  const callback = (item) => {
    return pick(item, ['paramType', 'paramKey']);
  };

  onMounted(() => {
    nextTick(() => {
      const metaHeader = JSON.parse(props.metaHeader || '{}');
      const metaBody = JSON.parse(props.metaBody || '{}');
      const metaQuery = JSON.parse(props.metaQuery || '{}');
      const metaUri = JSON.parse(props.metaUri || '{}');
      Object.assign(showMeta, {
        header: !isEmpty(metaHeader.properties),
        body: !isEmpty(metaBody.properties),
        query: !isEmpty(metaQuery.properties),
        uri: !isEmpty(metaUri.properties),
      });

      currentMetaHeader.value = toTreeJsonParam(metaHeader, callback);
      currentMetaBody.value = toTreeJsonParam(metaBody, callback);
      currentMetaQuery.value = toTreeJsonParam(metaQuery, callback);
      currentMetaUri.value = toTreeJsonParam(metaUri, callback);
    });
  });

  function handleOk() {
    props.callback({
      metaHeader: JSON.stringify(toApiJsonParam(currentMetaHeader.value, callback)),
      metaBody: JSON.stringify(toApiJsonParam(currentMetaBody.value, callback)),
      metaQuery: JSON.stringify(toApiJsonParam(currentMetaQuery.value, callback)),
      metaUri: JSON.stringify(toApiJsonParam(currentMetaUri.value, callback)),
    });
    handleClose();
  }

  function handleClose() {
    visible.value = false;
    Object.assign(showMeta, {
      header: false,
      body: false,
      query: false,
      uri: false,
    });
    currentMetaHeader.value = undefined;
    currentMetaBody.value = undefined;
    currentMetaQuery.value = undefined;
    currentMetaUri.value = undefined;
  }
</script>

<style lang="less">
  .input-param-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      max-height: 80vh;

      > .ant-modal-close {
        > .ant-modal-close-x {
          width: auto;
          height: auto;
          padding: 16px;
          color: #212528;
          line-height: 1;
          line-height: 22px;
        }
      }

      > .ant-modal-header,
      > .ant-modal-footer {
        flex-shrink: 0;
        padding: 16px;
      }

      > .ant-modal-header {
        border-bottom: 1px solid #e0e3ea;
      }

      > .ant-modal-footer {
        background-color: #fff;
        border-top: 1px solid #e0e3ea;
        padding: 12px 16px;
      }

      > .ant-modal-header .ant-modal-title {
        color: #000;
        font-weight: 600;
      }

      > .ant-modal-body {
        flex-grow: 1;
        padding: 0;
        min-height: 600px;
        overflow: auto;
        display: flex;
        background-color: #fff;

        .input-param-modal-container {
          width: 100%;
          padding: 16px 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }
</style>

<style lang="scss" scoped>
  $input-param-modal-tabs: ();

  @include b(input-param-modal-tabs) {
    @include set-component-css-var(input-param-modal-tabs, $input-param-modal-tabs);

    margin-bottom: 20px;
    :deep(.ant-tabs-nav) {
      &::before {
        display: none;
      }
      margin-bottom: 0;
      .ant-tabs-tab {
        border-bottom-width: 0;
      }
    }

    :deep(.ant-tabs-content-holder) {
      border: 1px solid #f0f0f0;
      padding: 8px;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
</style>
