<template>
  <div class="p20px">
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane v-for="item in tabs" :key="item.key" :tab="item.label">
        <RequestParamsExpression
          v-if="item.key !== 'body'"
          v-model:data="paramsDataMap[item.field]"
          :name="item.label"
          :disableExpression="true"
        />
        <div v-else class="h396px overflow-hidden ks-column">
          <div class="w100% mb10px">
            <a-radio-group v-model:value="bodyConfigType" @change="handleBodyConfigTypeChange">
              <a-radio value="1">{{ $t('sys.ipaas.steps.setting') }}</a-radio>
              <a-radio value="2">Raw JSON</a-radio>
            </a-radio-group>
          </div>
          <div class="ks-col overflow-auto">
            <jsonExpressionEditor
              v-if="bodyConfigType === '1'"
              :list="bodyJson"
              :isDebugMode="true"
            />
            <template v-else>
              <div class="ks-row">
                <div class="flex mr12px">
                  <span class="text-16px">{{ item.label }}</span>
                </div>
                <div class="w-full">
                  <a-textarea
                    v-model:value="paramsDataMap.body"
                    allowClear
                    :placeholder="$t('sys.inputText')"
                    :rows="5"
                    style="width: 100%"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import RequestParamsExpression from '../../components/request-params-expression.vue';
  import jsonExpressionEditor from '../../components/ParameterStruct/json-expression-editor.vue';
  import {
    ParameterStruct,
    ParameterTypeEnum,
    ValueTypeEnum,
  } from '../../components/ParameterStruct';
  import { useModal } from '@gct/runtime';
  import { useGctFlow } from '@gct/flow';
  import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { isEmpty } from 'lodash-es';

  const activeKey = ref('header');
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

  const paramsDataMap = ref<{
    headerParameters?: ParameterStruct;
    queryParameters?: ParameterStruct;
    uriParameters?: ParameterStruct;
    body?: string;
  }>({
    headerParameters: [],
    queryParameters: [],
    uriParameters: [],
  });

  const { gctFlowData } = useGctFlow();
  const bodyConfigType = ref('1');
  const bodyJson = ref<ParameterStruct>([]);

  onMounted(() => {
    getWebhookParamsConfig();
  });

  const getDataStructure = (data): ParameterStruct => {
    return Object.entries(data).reduce((list: any[], [key, value]: [string, any]) => {
      const obj = {
        valueType: ValueTypeEnum.INPUT,
        key,
        value: undefined,
        keyType: value.type,
        description: value.description,
        required: value.required,
      };
      if (value.type === ParameterTypeEnum.Object) {
        obj['children'] = getDataStructure(value.properties);
      } else if (value.type === ParameterTypeEnum.Array) {
        obj['children'] = [{ valueType: ValueTypeEnum.INPUT, key: 0, keyType: value.items.type }];
      }
      list.push(obj);
      return list;
    }, []);
  };

  const getWebhookParamsConfig = () => {
    const webhookNode = gctFlowData.value?.children[0];
    if (!webhookNode || !webhookNode.data) return;
    const { endpointType, nodeConfig } = webhookNode.data.bizData;
    if (endpointType !== EndpointType.webhook) return;
    paramsDataMap.value = {
      headerParameters: getDataStructure(nodeConfig.metaHeader?.properties || {}),
      queryParameters: getDataStructure(nodeConfig.metaQuery?.properties || {}),
      uriParameters: getDataStructure(nodeConfig.metaUri?.properties || {}),
      body: '',
    };
    bodyJson.value = [
      {
        key: 'body',
        keyType: ParameterTypeEnum.Object,
        valueType: ValueTypeEnum.INPUT,
        value: '',
        children: getDataStructure(nodeConfig.metaBody?.properties || {}),
      },
    ];
  };

  const handleBodyConfigTypeChange = (e) => {
    // if (paramsDataMap.value.body) {
    //   const body = paramsDataMap.value.body;
    //   paramsDataMap.value.body = e.target.value === '1' ? JSON.parse(body) : JSON.stringify(body);
    // }
  };

  const formatBodyData = (data) => {
    if (data.keyType === ParameterTypeEnum.Object) {
      return data.children?.reduce((obj, e) => {
        const value = formatBodyData(e);
        if (!isEmpty(value)) {
          obj[e.key] = value;
        }
        return obj;
      }, {});
    } else if (data.keyType === ParameterTypeEnum.Array) {
      return data.children?.reduce((list, e) => {
        const value = formatBodyData(e);
        if (!isEmpty(value)) {
          list.push(value);
        }
        return list;
      }, []);
    } else {
      return data.value;
    }
  };

  useModal(() => {
    const config = Object.entries(paramsDataMap.value).reduce((obj, [k, list]) => {
      if (k !== 'body' && list && list.length > 0) {
        obj[k] = list.reduce((o, e) => {
          if (e.key) {
            o[e.key] = e.value;
          }
          return o;
        }, {});
      } else if (k === 'body') {
        if (bodyConfigType.value === '1') {
          const temp = bodyJson.value.reduce((obj, e) => {
            const value = formatBodyData(e);
            if (!isEmpty(value)) {
              obj[e.key] = value;
            }
            return obj;
          }, {});
          obj[k] = temp.body;
        } else {
          try {
            obj[k] = JSON.parse(list);
          } catch {
            obj[k] = list;
          }
        }
      }
      // 空数组，空对象都删除不传
      if (isEmpty(obj[k])) {
        delete obj[k];
      }

      return obj;
    }, {});
    return {
      ok: true,
      params: {
        config,
      },
    };
  });
</script>
<style lang="less" scoped></style>
