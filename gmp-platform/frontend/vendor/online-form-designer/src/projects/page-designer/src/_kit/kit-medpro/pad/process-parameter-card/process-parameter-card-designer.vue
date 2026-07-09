<template>
  <div class="process-parameter-card">
    <div class="ks-col relative">
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
          :columns="columns"
          @cancel="showPicker = false"
          @confirm="onConfirm"
        />
      </van-popup>

      <div class="process-parameter-card-table">
        <vxe-grid
          class="vxetable"
          round
          :row-config="{ isHover: true, useKey: true, keyField: 'id', isCurrent: true }"
          :data="dcData"
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
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-process-parameter-card">
  import { ref } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';

  // 设计器属性（预留，当前未用到）
  defineProps(widgetProps);

  const columns = [];
  const fieldValue = ref('');
  const showPicker = ref(false);
  const pickerValue = ref<any[]>([]);
  const onConfirm = ({ selectedValues, selectedOptions }) => {
    showPicker.value = false;
    pickerValue.value = selectedValues;
    fieldValue.value = selectedOptions[0].text;
  };

  // 表格数据（示例数据，可由外部注入后替换）
  const dcData = ref([
    { id_: 1, name_: '过程参数1', value_: null },
    { id_: 2, name_: '过程参数1', value_: 21 },
    { id_: 3, name_: '过程参数1', value_: 23 },
  ]);

  // 列定义
  const tableColumns = ref([
    { title: '序号', width: 60, align: 'center', slots: { default: 'seq' } },
    { field: 'name_', title: '工艺参数卡项名称', minWidth: 180 },
    { field: 'value_', title: '值', align: 'center', slots: { default: 'value' } },
  ]);
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
