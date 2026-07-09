<template>
  <div class="p20px">
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="imports" tab="IMPORT">
        <RfcJsonEditor
          title="IMPORT"
          :list="paramsDataMap.imports"
          :disabled="readonly"
          rootType="import"
        />
      </a-tab-pane>
      <a-tab-pane key="tables" tab="TABLES">
        <RfcJsonEditor
          title="TABLES"
          :list="paramsDataMap.tables"
          :disabled="readonly"
          rootType="tables"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
  import { onBeforeMount, ref, toRaw } from 'vue';
  import { NodeBizDataSchema } from '/@ipaas/types';
  import { ParameterStruct, ParameterTypeEnum, ValueTypeEnum } from './type/index.ts';
  import { cloneDeep, pick } from 'lodash-es';
  import { IModal, useModal } from '@gct/runtime';
  import RfcJsonEditor from './rfc-json-editor.vue';

  const props = withDefaults(
    defineProps<{
      modal: IModal;
      readonly?: boolean;
      form: NodeBizDataSchema.ApiConnector['nodeConfig'];
      hideTabs?: string[];
    }>(),
    {},
  );

  const paramsDataMap = ref<{
    imports?: ParameterStruct;
    tables?: ParameterStruct;
  }>({});

  onBeforeMount(() => {
    paramsDataMap.value = cloneDeep(toRaw(pick(props.form, ['imports', 'tables'])));
    let imports = paramsDataMap.value.imports;
    if (!imports || imports.length <= 0) {
      paramsDataMap.value.imports = [
        {
          key: 'import',
          keyType: ParameterTypeEnum.STRUCTURES,
          valueType: ValueTypeEnum.INPUT,
          value: '',
        },
      ];
    }
    let tables = paramsDataMap.value.tables;
    if (!tables || tables.length <= 0) {
      paramsDataMap.value.tables = [
        {
          key: '',
          keyType: ParameterTypeEnum.TABLES,
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

  const filterImportEmpty = (data) => {
    return data.reduce((data, item) => {
      if (isEmpty(item)) {
        return data;
      }
      if (item.children && item.children.length) {
        item.children = filterImportEmpty(item.children);
      }
      data.push(item);
      return data;
    }, []);
  };

  const onSave = () => {
    const params = Object.entries(toRaw(paramsDataMap.value)).reduce((obj, [k, list]) => {
      // 如果tables的key没有配置，则忽略tables
      if (k === 'tables' && !list[0].key) {
        return obj;
      }
      obj[k] = filterImportEmpty(list);
      return obj;
    }, {});
    console.log('save----', params);
    return {
      ok: true,
      params,
    };
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
