<template>
  <div class="data-collection" v-if="!customTableHeader || (customTableHeader && rightCols.length)">
    <a-form :model="tableData" ref="formRef">
      <a-table :data-source="tableData" :columns="rightCols" :pagination="false" size="middle">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'origin_value_'">
            <dynamic-value
              v-model="record.origin_value_"
              :readonly="true"
              :formData="record"
              :index="index"
              :key="record.randomKey"
            />
          </template>
          <template v-else-if="column.key === 'value_'">
            <dynamic-value
              v-if="!record.valueReadonly || record.value_ !== null"
              v-model="record.value_"
              :readonly="record.valueReadonly"
              :formData="record"
              :index="index"
              :key="record.randomKey"
            />
          </template>
          <template v-else-if="column.key === 'ope' && btnChildren.length">
            <template v-for="(item, i) in btnChildren">
              <WidgetRender
                v-if="record.btnVisible === undefined || record.btnVisible[i]"
                :key="item.key"
                :widget="item"
                :formData="record"
                :index="index"
              />
            </template>
          </template>
        </template>
      </a-table>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="gct-dynamic-data-table">
  import { cloneDeep } from 'lodash-es';
  import { ref, onMounted, toRefs, toRef, watch } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DynamicValue from '../txn-data-collection/dynamic-value.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { FormInstance, message } from 'ant-design-vue';
  import WidgetRender from '/@page-designer/components/widgets/web/index.vue';

  const rightCols = ref<any>([]);
  const props = defineProps(widgetProps);
  const children = toRef(() => props.widget?.children || []);
  const { customTableHeader } = toRefs(props.widget?.props);
  const { t } = useI18n();
  const Event = getPageEvent();
  const formRef = ref<FormInstance>();

  const tableData = ref<any[]>([]);
  const dcData = ref<any[]>([]);
  const rowIndex = ref(-1);
  const btnChildren = toRef(() => props.widget?.children || []);

  onMounted(() => {
    if (!customTableHeader.value) {
      rightCols.value = [
        {
          title: '名称',
          dataIndex: 'name_',
          key: 'name_',
        },
        {
          title: '值',
          dataIndex: 'value_',
          key: 'value_',
        },
      ];
    }
  });

  async function validate(msg?: string) {
    try {
      await formRef.value?.validate();
    } catch {
      throw message.warning(msg || '当前数据采集未通过校验');
    }
  }

  defineExpose({
    validate,
    setValue(data, index?) {
      if (index) {
        tableData.value[index].forEach((d, i) => {
          d.value_ = data[i];
        });
      } else {
        tableData.value.forEach((group, k) => {
          group.entries_.forEach((d, i) => {
            d.value_ = data[k][i];
          });
        });
      }
    },
    reset() {
      rowIndex.value = -1;
      dcData.value = [];
      tableData.value = [];
    },

    setDataSource(res) {
      tableData.value = res;
    },
    setTableColumns(columns) {
      const _columns = cloneDeep(columns);
      if (btnChildren.value.length) {
        _columns.push({ title: '操作', dataIndex: 'ope', key: 'ope', width: 150 });
      }
      rightCols.value = _columns;
    },
    getDataSource() {
      return tableData.value;
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-table-tbody) {
    .ant-table-cell {
      padding: 6px 10px !important;

      .ant-btn.ant-btn-link {
        padding: 0 8px;
      }
    }
  }
</style>
