<template>
  <a-tabs v-model:activeKey="activeKey" type="card">
    <a-tab-pane v-for="item in showTabs" :key="item.key" :tab="item.label">
      <RequestParamsExpression
        v-if="item.key === 'header'"
        v-model:data="headerParameters"
        :name="item.label"
        :disabled="readonly"
        :valueTypes="valueTypes"
      />
      <div v-else-if="item.key === 'body'" class="h396px">
        <div class="mb8px ks-row-middle">
          <span class="pl5px pr30px inline-flex items-center">{{ $t('sys.ipaas.messageType') }}</span>
          <a-radio-group v-model:value="bodyContentType">
            <a-radio v-for="el in Object.values(ParamType)" :key="el" :value="el">
              {{ $t(`sys.ipaas.bodyParamTypes.${el}`) }}
            </a-radio>
          </a-radio-group>
        </div>
        <JsonExpressionEditor
          :list="bodyData"
          :disabled="readonly"
          :valueTypes="valueTypes"
          :contentType="bodyContentType"
        />
      </div>
      <RequestParamsExpression
        v-else-if="item.key === 'query'"
        :name="item.label"
        v-model:data="queryParameters"
        :disabled="readonly"
        :valueTypes="valueTypes"
      />
      <RequestParamsExpression
        v-else-if="item.key === 'path'"
        :name="item.label"
        v-model:data="pathParameters"
        :disabled="readonly"
        :valueTypes="valueTypes"
      />
    </a-tab-pane>
  </a-tabs>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import RequestParamsExpression from './request-params-expression.vue';
  import JsonExpressionEditor from './ParameterStruct/json-expression-editor.vue';
  import { ParameterStruct, ParameterTypeEnum, ValueTypeEnum } from './ParameterStruct';
  import { ParamType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits([
    'update:header',
    'update:query',
    'update:path',
    'update:body',
    'update:contentType',
  ]);
  const props = defineProps<{
    header?: ParameterStruct;
    query?: ParameterStruct;
    path?: ParameterStruct;
    body?: ParameterStruct;
    contentType?: ParamType;
    readonly?: boolean;
    hideTabs?: string[];
    showValueType?: () => boolean | boolean;
    valueTypes?: ValueTypeEnum[];
  }>();

  const tabs = [
    {
      key: 'header',
      label: 'Header',
      field: 'headerParameters',
    },
    {
      key: 'body',
      label: 'Body',
      field: 'body',
    },
    {
      key: 'query',
      label: 'Query',
      field: 'queryParameters',
    },
    {
      key: 'path',
      label: 'Path',
      field: 'uriParameters',
    },
  ];

  const showTabs = computed(() => {
    return tabs.filter((e) => !props.hideTabs?.includes(e.key));
  });

  const activeKey = ref(showTabs.value[0].key);
  const bodyDefVal = [
    {
      key: 'body',
      keyType: ParameterTypeEnum.Object,
      valueType: ValueTypeEnum.INPUT,
      value: '',
    },
  ];

  const bodyDataMap = {
    [ParamType.JSON]: ref<ParameterStruct>(cloneDeep(bodyDefVal)),
    [ParamType.FORMDATA]: ref<ParameterStruct>(cloneDeep(bodyDefVal)),
    [ParamType.X_WWW_FORM_URLENCODED]: ref<ParameterStruct>(cloneDeep(bodyDefVal)),
  };
  const bodyData = computed<ParameterStruct>({
    get() {
      return bodyDataMap[bodyContentType.value].value;
    },
    set(val) {
      bodyDataMap[bodyContentType.value].value = val;
    },
  });

  const headerParameters = computed({
    get() {
      if (!props.header) emit('update:header', []);
      return props.header ?? [];
    },
    set(val) {
      emit('update:header', val);
    },
  });

  // const bodyParameters = computed({
  //   get() {
  //     if (!props.body || props.body.length <= 0) {
  //       emit('update:body', cloneDeep(bodyDefVal));
  //     }
  //     return props.body;
  //   },
  //   set(val) {
  //     emit('update:body', val);
  //   },
  // });

  const bodyContentType = computed({
    get() {
      if (!props.contentType) emit('update:contentType', ParamType.JSON);
      return props.contentType || ParamType.JSON;
    },
    set(val) {
      emit('update:contentType', val);
    },
  });

  const pathParameters = computed({
    get() {
      if (!props.path) emit('update:path', []);
      return props.path ?? [];
    },
    set(val) {
      emit('update:path', val);
    },
  });

  const queryParameters = computed({
    get() {
      if (!props.query) emit('update:query', []);
      return props.query ?? [];
    },
    set(val) {
      emit('update:query', val);
    },
  });

  onMounted(() => {
    if (props.body && props.body.length > 0) {
      bodyData.value = cloneDeep(props.body);
    }
  });

  watch(
    () => bodyData.value,
    (val) => {
      emit('update:body', val);
    },
    {
      deep: true,
    },
  );
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-top) {
    & > .ant-tabs-nav {
      margin-bottom: 0 !important;
    }

    .ant-tabs-content {
      padding: 12px;
      border-right: 1px solid #e8ebf0;
      border-bottom: 1px solid #e8ebf0;
      border-left: 1px solid #e8ebf0;
      border-radius: 0 0 4px 4px;
    }
  }
</style>
