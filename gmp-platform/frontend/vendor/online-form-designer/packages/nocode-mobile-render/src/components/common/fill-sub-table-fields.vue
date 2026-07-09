<template>
  <div class="sub-table-wrap">
    <div class="sub-table-item" v-for="tdId in mainWidgetIds" :key="tdId">
      <WidgetComponent
        :widget="widgetCenter[tdId].cellWidget"
        v-bind="getWidgetAttributes(tdId)"
        :isField="true"
      />
    </div>

    <Teleport to="#fill-in-modal-footer-right">
      <SubTableBtn
        :is-inserting-before="isInsertingBefore"
        :is-inserting-after="isInsertingAfter"
        :is-deleting="isDeleting"
        :showDelete="visibleData.data.length > 1"
        @before="handleAddRow({ index: currentIndex, position: 'before',rowData:currentData })"
        @after="handleAddRow({ index: currentIndex, position: 'after' ,rowData:currentData})"
        @copy="handleAddRow({ index: currentIndex,actionType:'copyRow', position: 'after',rowData:currentData })"
        @delete="handleDeleteRow(currentData, currentIndex)"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts" name="fill-sub-table-fields">
  import { computed, reactive, ref, toRef } from 'vue';
  import WidgetComponent from '../_common_/widget-component.vue';
  import { usePaginationControl, useSubTableData } from '../../hooks';
  // import PaginationControls from './pagination-controls.vue';

  import type { ITd } from '@gct/nocode-base';
  import SubTableBtn from './sub-table-btn.vue';

  const props = defineProps<{
    /** 点击的单元格 id */
    clickTdId: string;
    /** 动态表点击的所属数据行数 */
    clickSbRowIndex: number;
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

  const { rowSubFieldKey: subFieldId = '' } = reactive(props.subInfo);

  const isInsertingBefore = ref(false);
  const isInsertingAfter = ref(false);
  const isDeleting = ref(false);

  const { visibleData, handleAddRow, handleDeleteRow } = useSubTableData(
    toRef(props, 'formState'),
    {
      subField: subFieldId,
      lockMap: {
        before: isInsertingBefore,
        after: isInsertingAfter,
        delete: isDeleting,
      },
      callback: () => {
        if (!currentData.value) {
          currentIndex.value = visibleData.value.data.length - 1;
        }
      },
    },
  );

  const { currentIndex, handlePagination, paginationStatus } = usePaginationControl(
    computed(() => visibleData.value.data.length),
    Math.max(0, props.clickSbRowIndex ?? -1),
  );

  const currentData = computed(() => visibleData.value.data?.[currentIndex.value]);

  const getWidgetAttributes = (tdId: string) => {
    return {
      formData: currentData.value,
      subtableFieldId: subFieldId,
      realRowIndex: currentIndex.value,
      pageRowIndex: currentIndex.value,
    };
  };

  defineExpose({
    currentIndex: () => currentIndex.value,
    paginationStatus,
    handlePagination,
  });
</script>

<style scoped lang="less">
  .sub-table-wrap {
    .van-field {
      border-radius: 8px;
    }

    .sub-table-item + .sub-table-item {
      margin-top: 8px;
    }
  }
</style>
