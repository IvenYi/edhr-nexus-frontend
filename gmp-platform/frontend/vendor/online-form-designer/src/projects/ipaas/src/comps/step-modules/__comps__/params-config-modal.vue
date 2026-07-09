<template>
  <div class="p20px">
    <ParamsConfigTabs
      v-model:header="paramsDataMap.headerParameters"
      v-model:body="paramsDataMap.body"
      v-model:content-type="paramType"
      v-model:path="paramsDataMap.uriParameters"
      v-model:query="paramsDataMap.queryParameters"
      :readonly="readonly"
      :hideTabs="hideTabs"
    />
  </div>
</template>
<script setup lang="ts">
  import { onBeforeMount, ref } from 'vue';
  import { NodeBizDataSchema } from '../../../types';
  import {
    ParameterStruct,
    ParameterTypeEnum,
    ValueTypeEnum,
  } from '../../components/ParameterStruct';
  import { cloneDeep, pick } from 'lodash-es';
  import { IModal, useModal } from '@gct/runtime';
  import ParamsConfigTabs from '../../components/params-config-tabs.vue';
  import { ParamType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { message } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      modal: IModal;
      readonly?: boolean;
      form: NodeBizDataSchema.ApiConnector['nodeConfig'];
      type?: 'output' | 'input';
      hideTabs?: string[];
    }>(),
    {
      type: 'output',
    },
  );

  const paramsDataMap = ref<{
    headerParameters?: ParameterStruct;
    queryParameters?: ParameterStruct;
    uriParameters?: ParameterStruct;
    body?: ParameterStruct;
  }>({});

  const paramType = ref<ParamType>(ParamType.JSON);

  onBeforeMount(() => {
    paramsDataMap.value = cloneDeep(
      pick(props.form, ['headerParameters', 'queryParameters', 'uriParameters', 'body']),
    );
    paramType.value = props.form?.paramType;
    let body = paramsDataMap.value.body;
    if (!body || body.length <= 0) {
      paramsDataMap.value.body = [
        {
          key: 'body',
          keyType: ParameterTypeEnum.Object,
          valueType: ValueTypeEnum.INPUT,
          value: '',
        },
      ];
    }
  });

  /** 判断是否为空 */
  const isEmpty = (item) => {
    /** 第一行的表达式值为空的时候，判定为空 */
    if (item.valueType === ValueTypeEnum.EXPRESSION && item.key === '*' && !item.value) {
      return true;
    }
    return (
      (typeof item.key === 'string' && !item.key?.trim()) ||
      (typeof item.key === 'number' && item.key !== 0 && !item.key)
    );
  };

  const filterBodyEmpty = (data) => {
    let emptyKeyCount = 0;
    return data.reduce((data, item) => {
      if (isEmpty(item)) {
        emptyKeyCount++;
        if (paramType.value === ParamType.X_WWW_FORM_URLENCODED) {
          // 校验body的参数是否只有一个空key的参数
          if (emptyKeyCount > 1) {
            throw new Error('x-www-form-urlencoded类型只支持一个key为空的参数');
          }
        } else {
          // 跳过，省略该节点
          return data;
        }
      }
      if (item.children && item.children.length) item.children = filterBodyEmpty(item.children);
      data.push(item);
      return data;
    }, []);
  };

  const onSave = () => {
    try {
      const params = Object.entries(paramsDataMap.value).reduce((obj, [k, list]) => {
        if (k === 'body') {
          obj[k] = filterBodyEmpty(list);
        } else {
          obj[k] = Array.isArray(list) && list.filter((e) => !isEmpty(e));
        }
        return obj;
      }, {});
      params['paramType'] = paramType.value;
      console.log('save----', params);
      return {
        ok: true,
        params,
      };
    } catch (e) {
      message.error(e.message);
      return {
        ok: false,
        message: e.message,
      };
    }
  };

  useModal(onSave);
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-top) {
    & > .ant-tabs-nav {
      margin-bottom: 0 !important;
    }
    .ant-tabs-content {
      padding: 12px;
      border-left: 1px solid #e8ebf0;
      border-right: 1px solid #e8ebf0;
      border-bottom: 1px solid #e8ebf0;
      border-radius: 0 0 4px 4px;
    }
  }
</style>
