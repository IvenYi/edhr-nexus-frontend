<template>
  <a-tabs :class="[ns.b()]" type="card" animated>
    <a-tab-pane v-if="header" key="1" tab="Header">
      <JsonParamEditor :value="header" :position="ParameterPosition.HEADER" :readonly="readonly" />
    </a-tab-pane>
    <a-tab-pane v-if="body" key="2" tab="Body">
      <JsonParamEditor :enable-import="true" :value="body" :position="ParameterPosition.BODY" :readonly="readonly" />
    </a-tab-pane>
    <a-tab-pane v-if="query" key="3" tab="Query">
      <JsonParamEditor :value="query" :position="ParameterPosition.QUERY" :readonly="readonly" />
    </a-tab-pane>
    <a-tab-pane v-if="path" key="4" tab="Path">
      <JsonParamEditor :value="path" :position="ParameterPosition.PATH" :readonly="readonly" />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup name="json-param-tabs">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ITreeJsonParam } from './types';
  import { ParameterPosition } from '../../enums';
  import JsonParamEditor from './json-param-editor.vue';

  const { t } = useI18n();
  const ns = useNamespace('json-param-tabs');

  const props = withDefaults(
    defineProps<{
      header?: ITreeJsonParam;
      body?: ITreeJsonParam;
      query?: ITreeJsonParam;
      path?: ITreeJsonParam;
      readonly?: boolean;
    }>(),
    {},
  );
</script>

<style lang="scss" scoped>
  $json-param-tabs: ();

  @include b(json-param-tabs) {
    @include set-component-css-var(json-param-tabs, $json-param-tabs);

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
      padding-top: 10px;
    }
  }
</style>
