<template>
  <a-table :pagination="false" :data-source="dcData" :columns="rightCols">
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'type_'">
        {{ t(`sys.pageDesigner.dynamicFormType.${record.type_}`) }}
      </template>
      <template v-if="column.key === 'value_'">
        <span v-if="widget.props.readonly">{{ record.value_ }}</span>
        <a-input v-model:value="record.value_" disabled v-else />
      </template>
      <template v-if="column.key === 'ope'">
        <slot :children="btnChildren"></slot>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts" name="gct-dynamic-data-table">
  import { ref, toRef, watch } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps(widgetProps);
  const btnChildren = toRef(() => props.widget?.children || []);

  const dcData = ref([
    {
      type_: 'boolean',
      value_: true,
    },
  ]);
  const rightCols = ref([
    {
      title: '名称',
      dataIndex: 'type_',
      key: 'type_',
    },
    {
      title: '值',
      dataIndex: 'value_',
      key: 'value_',
    },
  ]);

  watch(
    () => btnChildren.value,
    (val) => {
      if (val.length && !rightCols.value.some((item) => item.dataIndex === 'ope')) {
        rightCols.value.push({
          title: '操作',
          dataIndex: 'ope',
          key: 'ope',
        });
      }
    },
    { deep: true, immediate: true },
  );
</script>

<style lang="less" scoped></style>
