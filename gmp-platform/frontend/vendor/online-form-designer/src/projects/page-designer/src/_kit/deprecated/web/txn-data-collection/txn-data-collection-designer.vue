<template>
  <div class="my2">
    <a-select :option="groupData" v-model:value="collectionType" style="width: 33%"></a-select>
  </div>
  <a-table :pagination="false" :data-source="dcData" :columns="rightCols">
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
      <template v-if="column.key === 'type_'">
        {{ t(`sys.pageDesigner.dynamicFormType.${record.type_}`) }}
      </template>
      <template v-if="column.key === 'value_'">
        <span v-if="widget.props.readonly">{{ record.value_ }}</span>
        <a-input v-model:value="record.value_" v-else></a-input>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  defineProps(widgetProps);
  const collectionType = ref('数据采集1');
  const groupData = ref([
    {
      name: '数据采集1',
      spec: '工艺1',
      product: '产品1',
      device: '设备1',
    },
    {
      name: '数据采集2',
      spec: '工艺1',
      product: '产品1',
      device: '设备2',
    },
  ]);

  const dcData = ref([
    {
      type_: 'boolean',
      value_: true,
    },
    {
      type_: 'integer',
      value_: 1,
    },
    {
      type_: 'decimal',
      value_: 0.1,
    },
    {
      type_: 'string',
      value_: '123333',
    },
  ]);
  const rightCols = ref([
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '类型',
      dataIndex: 'type_',
      key: 'type_',
    },
    {
      title: '值',
      dataIndex: 'value_',
      key: 'value_',
    },
  ]);
</script>

<style lang="less" scoped></style>
