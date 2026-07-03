<template>
  <div class="fixed-table-wrap">
    <div class="fixed-table-item" v-for="tdId in groupedTdIds[currentIndex]" :key="tdId">
      <WidgetComponent
        :widget="widgetCenter[tdId].cellWidget"
        v-bind="getWidgetAttributes(tdId)"
        :isField="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="fill-fixed-table-fields">
  import { computed } from 'vue';
  import WidgetComponent from '../_common_/widget-component.vue';
  import { usePaginationControl } from '../../hooks';

  import type { ITd } from '@gct/nocode-base';
  import type { GroupKey } from '../../types';

  const props = defineProps<{
    /** 点击的单元格 id */
    clickTdId: string;
    /** tdIds集合(主模型、固定表、动态表、二维表、检验表) */
    mainWidgetIds: string[];
    /** tdIds集合(二维表关联子表、检验表关联子表) */
    linkWidgetIds: string[];
    /** 子表的信息 */
    subInfo: { rowSubFieldKey: string; colSubFieldKey?: string };
    /** 组件信息中心 */
    widgetCenter: Record<string, ITd>;
    /** 表单数据 */
    formState: Record<string, any>;
  }>();

  const groupByIndex = (
    items: string[],
    getIndex: (item: string) => GroupKey,
  ): Record<GroupKey, string[]> => {
    return items.reduce((acc, item) => {
      const index = getIndex(item);
      acc[index] = acc[index] || [];
      acc[index].push(item);
      return acc;
    }, {} as Record<GroupKey, string[]>);
  };

  // 分组逻辑
  const groupedTdIds = computed(() =>
    Object.values(
      groupByIndex(props.mainWidgetIds, (id) => props.widgetCenter[id].cellFixedTableDataIdx ?? 0),
    ),
  );

  const { currentIndex, handlePagination, paginationStatus } = usePaginationControl(
    computed(() => groupedTdIds.value.length),
    Math.max(0, groupedTdIds.value?.findIndex((row) => row.includes(props.clickTdId)) ?? -1),
  );

  const getWidgetAttributes = (tdId: string) => {
    const td = props.widgetCenter[tdId];
    const baseAttrs = {
      formData: props.formState,
    };
    if (td.props?.isNewFixedTableTd) {
      const subField = td.props.fixedTableFieldId ?? '';
      const index = td.cellFixedTableDataIdx ?? 0;
      return {
        ...baseAttrs,
        formData: props.formState?.[subField]?.[index] ?? {},
        subtableFieldId: subField,
        realRowIndex: index,
        pageRowIndex: index,
      };
    }
    return baseAttrs;
  };

  defineExpose({
    currentIndex: () => currentIndex.value,
    paginationStatus,
    handlePagination,
  });
</script>

<style scoped lang="less">
  .fixed-table-wrap {
    .van-field {
      border-radius: 8px;
    }

    .fixed-table-item + .fixed-table-item {
      margin-top: 8px;
    }
  }
</style>
