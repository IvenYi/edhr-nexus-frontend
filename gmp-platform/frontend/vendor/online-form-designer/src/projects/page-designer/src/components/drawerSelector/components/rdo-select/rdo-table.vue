<template>
  <div class="px-4 pt-3">
    <vxeRefTable
      ref="xtable"
      v-model="tableData"
      :tableColumns="columns"
      :rowSelection="multiple"
      :selectTheEntireRow="true"
      :headerSort="false"
      :rowSelectionRadio="!multiple"
      @radioEvent="radioEvent"
      :checkbox-config="checkConfig"
      @checkboxEvent="checkboxEvent"
      isTree
      checkStrictly
      :tree-config="treeConfig"
      keyField="value"
    >
      <template #field="{ widget, row, rowIndex }">
        <div
          v-if="row.base_id_ && row.default_ && widget.props.field === 'name_'"
          class="text-[#000] text-[16px]"
        >
          {{ row[widget.props.field] }}
          <van-tag color="#E0E3EB" plain class="ml6px bg-[#F9FAFB]!">
            <span class="text-[#5A5F6B] p2px text-12px"> 默认 </span>
          </van-tag>
        </div>
        <div v-else-if="row.children && row.children.length" class="text-[#000] text-[16px]">
          {{ row[widget.props.field] || '' }}
        </div>
      </template>
    </vxeRefTable>
  </div>
</template>
<script setup lang="ts">
  import {
    vxeRefTable,
    tableCell,
  } from '/@page-designer/components/widgets/pad/data/data-table/component/vxeRenderTable';
  import { computed, nextTick, ref, onMounted, watch } from 'vue';
  import type { Option } from '../../types';

  const emit = defineEmits(['load', 'change']);

  const props = defineProps<{
    options: Option[];
    selectedValues: string[];
    isLoading: boolean;
    isFinished: boolean;
    multiple?: boolean;
    displayFields?: any;
  }>();
  console.log('displayFields', props.displayFields);
  const treeConfig = {
    transform: true,
    rowField: 'id_',
    parentField: 'base_id_',
    expandAll: true,
  };
  const xtable = ref();

  const handleLoad = async () => {
    emit('load');
  };
  handleLoad();

  const columns = computed(() => {
    return props.displayFields.map((i) => {
      return {
        ...i,
        props: {
          ...i.props,
          disabled: false,
        },
      };
    });
  });

  const radioEvent = (option) => {
    emit('change', option.value, option);
  };

  const checkboxEvent = (value, option) => {
    emit('change', option.value, option);
  };

  const checkConfig = computed(() => {
    return {
      checkRowKeys: props.selectedValues, // 回显选中的行
      checkStrictly: true, // 取消父子联动
    };
  });
  //表格数据
  const tableData = computed(() => {
    return props.options
      .map((i) => {
        return [
          {
            ...i,
          },
          ...i.children,
        ];
      })
      .flat()
      .map((p) => {
        return {
          ...p._protoValue,
          ...p,
          name_: p.label,
        };
      });
  });
  // 设置单选选中
  const setSelection = (key) => {
    const $grid = xtable.value;
    if ($grid && !props.multiple) {
      const row = tableData.value.find((item) => item.value === key);
      if (row) {
        $grid.setRadioRow(row);
      }
    }
    if ($grid && props.multiple) {
      $grid.setSeleckedByKeys('value', key);
    }
  };

  watch(
    () => tableData.value,
    (val) => {
      if (props.selectedValues && props.selectedValues.length && tableData.value.length) {
        setSelection(props.multiple ? props.selectedValues : props.selectedValues.toString());
      }
    },
    {
      immediate: true,
    },
  );
  watch(
    () => props.selectedValues,
    (val) => {
      if (
        props.selectedValues &&
        // props.selectedValues.length &&
        tableData.value.length &&
        props.multiple
      ) {
        setSelection(props.selectedValues);
      }
    },
    {
      immediate: true,
    },
  );
</script>
<style scoped lang="less"></style>
