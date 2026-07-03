<template>
  <div class="process-parameter">
    <div class="process-parameter__type my-2">
      <a-select
        style="width: 33%"
        v-model:value="parameterType"
        :options="parameterOptions"
        placeholder="请选择工艺参数卡类型"
        @change="handleParameterChange"
      />
    </div>
    <a-table :pagination="false" :data-source="parameterData" :columns="rightCols">
      <template #bodyCell="{ column, index, record, text }">
        <template v-if="column.key === 'index'">
          {{ index + 1 }}
        </template>
        <template v-else>
          <span>{{ text ? record._DICT?.[column.key][text].join('') || text : text }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" name="gct-process-parameter-card">
  import { ref, toRef, toRefs, watch, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';

  const Event = getPageEvent();

  const props = defineProps(widgetProps);
  const { deviceGroupForm, batchRefForm, refFormField, refSearchField, txnType, collation } =
    toRefs(props.widget?.props);
  const tableData = ref<any[]>([]);
  const parameterData = ref<any[]>([]);
  const refFormData = toRef(() => {
    const data: any = {};
    if (!props.widget.props.noNeedAutoQuery) {
      refFormField.value?.forEach((i) => {
        data[i] = formMap.value[deviceGroupForm.value]?.[i];
      });
      refSearchField.value.forEach((i) => {
        data[i] = formMap.value[batchRefForm.value]?.[i];
      });
    }
    return data;
  });

  const parameterType = ref<string>();
  const parameterOptions = computed(() => {
    const getDict = (item, field) => item?._DICT[field]?.[item[field]]?.toString();
    return (tableData.value ?? []).map((item) => {
      return {
        ...item,
        value: item.process_parameter_card_id_,
        label: item.name_ || getDict(item, 'process_parameter_card_id_'),
      };
    });
  });

  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });

  const rightCols = ref([
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '参数卡名称',
      dataIndex: 'name_',
      key: 'name_',
    },
    {
      title: '参数卡属性值',
      dataIndex: 'value_',
      key: 'value_',
    },
    {
      title: '单位',
      dataIndex: 'uom_',
      key: 'uom_',
    },
  ]);

  function handleParameterChange(val, opt) {
    parameterData.value = opt.processParameterCard;
  }

  const getDataSource = async (queryParam = {}) => {
    const param = Object.assign(
      {
        ...refFormData.value,
        txn_key_: txnType?.value,
      },
      queryParam,
    );
    const res = await Event.context.$customBizService.post(
      {
        action: 'biz_get_process_parameter_card',
        key: 'em_process_parameter_card',
      },
      {
        query: { ...param },
        sorts: [...querySort],
      },
    );
    return (
      transformSourceData(res.data, res.dict).map((d, index) => {
        return {
          index,
          ...d,
        };
      }) || []
    );
  };
  watch(
    () => refFormData.value,
    async () => {
      if (props.widget.props.noNeedAutoQuery) return;
      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[batchRefForm.value]?.[i]) {
          needQueryFlag = false;
        }
      });
      if (needQueryFlag) {
        tableData.value = await getDataSource();
        if (tableData.value.length) {
          parameterData.value = tableData.value[0].processParameterCard;
          parameterType.value = tableData.value[0].process_parameter_card_id_;
        } else {
          parameterData.value = [];
          parameterType.value = '';
        }
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
  defineExpose({
    async reload(queryParam) {
      tableData.value = await getDataSource(queryParam);
      if (tableData.value.length) {
        parameterData.value = tableData.value[0].processParameterCard;
        parameterType.value = tableData.value[0].process_parameter_card_id_;
      } else {
        parameterData.value = [];
        parameterType.value = '';
      }
    },
    reset() {
      tableData.value = [];
      parameterData.value = [];
      parameterType.value = '';
    },
    getValue() {
      return {
        tableData: tableData.value,
        parameterData: parameterData.value,
      };
    },
  });
</script>

<style lang="less" scoped></style>
