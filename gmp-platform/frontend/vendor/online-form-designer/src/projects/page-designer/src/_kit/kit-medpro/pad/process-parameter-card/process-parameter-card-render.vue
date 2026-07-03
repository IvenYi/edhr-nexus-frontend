<template>
  <div class="process-parameter-card">
    <div class="ks-col relative">
      <template v-if="parameterData.length">
        <div class="process-parameter-card-title">
          <span>工艺参数卡</span>
        </div>
        <van-field
          v-model="fieldValue"
          is-link
          readonly
          class="process-parameter-card-name"
          placeholder=" "
          @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" destroy-on-close round position="bottom">
          <van-picker
            :model-value="pickerValue"
            :columns="parameterOptions"
            @cancel="showPicker = false"
            @confirm="onConfirm"
          />
        </van-popup>

        <div class="process-parameter-card-table">
          <vxe-grid
            class="vxetable"
            round
            :row-config="{ isHover: true, useKey: true, keyField: 'id', isCurrent: true }"
            :data="parameterData"
            :auto-resize="true"
            :columns="tableColumns"
          >
            <template #seq="{ rowIndex }">
              <span>{{ rowIndex + 1 }}</span>
            </template>
            <template #value="{ row }">
              {{ row.value_ || '--' }}
            </template>
            <template #empty>
              <van-empty description="暂无数据" />
            </template>
          </vxe-grid>
        </div>
      </template>
      <van-empty description="暂无数据" v-else />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-process-parameter-card">
  import { ref, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';

  const Event = getPageEvent();

  const fieldValue = ref('');
  const showPicker = ref(false);
  const pickerValue = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const parameterData = ref<any[]>([]);
  const getDict = (item, field) => item?._DICT[field]?.[item[field]]?.toString();

  const parameterOptions = computed(() => {
    return (tableData.value ?? []).map((item) => {
      return {
        ...item,
        value: item.process_parameter_card_id_,
        text: item.name_ || getDict(item, 'process_parameter_card_id_'),
      };
    });
  });
  const onConfirm = ({ selectedValues, selectedOptions }) => {
    showPicker.value = false;
    pickerValue.value = selectedValues;
    fieldValue.value = selectedOptions[0].text;
    parameterData.value = selectedOptions[0].processParameterCard;
  };

  // 列定义
  const tableColumns = ref([
    { title: '序号', width: 60, align: 'center', slots: { default: 'seq' } },
    {
      title: '参数卡名称',
      field: 'name_',
    },
    {
      title: '参数卡属性值',
      field: 'name_',
      align: 'center',
      slots: { default: 'value' },
    },
    {
      title: '单位',
      field: 'uom_',
    },
  ]);

  const getDataSource = async (queryParam = {}) => {
    const res = await Event.context.$customBizService.post(
      {
        action: 'biz_get_process_parameter_card',
        key: 'em_process_parameter_card',
      },
      {
        query: { ...queryParam },
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

  defineExpose({
    async reload(queryParam) {
      tableData.value = await getDataSource(queryParam);
      if (tableData.value.length) {
        parameterData.value = tableData.value[0].processParameterCard;
        pickerValue.value = [tableData.value[0].process_parameter_card_id_];
        fieldValue.value =
          tableData.value[0].name_ ?? getDict(tableData.value[0], 'process_parameter_card_id_');
      } else {
        parameterData.value = [];
        pickerValue.value = [];
        fieldValue.value = '';
      }
    },
    reset() {
      tableData.value = [];
      parameterData.value = [];
      pickerValue.value = [];
    },
    getValue() {
      return {
        tableData: tableData.value,
        parameterData: parameterData.value,
      };
    },
  });
</script>

<style lang="less" scoped>
  .vxetable {
    --vxe-table-border-color: #f0f0f0;
    --vxe-ui-font-size: 14px;
  }
  .process-parameter-card {
    &-title {
      position: relative;
      margin-bottom: 8px;

      span {
        font-weight: 600;
        font-size: 16px;
        color: #000000;
      }
    }
    &-name {
      font-weight: 600;
      font-size: 16px;
      color: #000000;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 8px;
      margin: 0 4px;
      &::after {
        display: none;
      }
    }
    &-table {
      background: #fff;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      padding: 8px 4px 12px;
    }
  }
</style>
