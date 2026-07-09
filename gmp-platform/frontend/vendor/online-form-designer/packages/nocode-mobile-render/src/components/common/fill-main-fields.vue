<template>
  <div class="main-field-wrap">
    <template v-if="props.mainWidgetIds.length">
      <widget-component
        v-if="currentTdId"
        :key="currentTdId"
        :widget="widgetCenter[currentTdId].cellWidget"
        :formData="formState"
        :isField="true"
      />
    </template>
    <div class="empty" v-else>
      <van-empty :image="emptyPng" description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts" name="fill-main-fields">
  import { computed } from 'vue';
  import WidgetComponent from '../_common_/widget-component.vue';
  import { usePaginationControl } from '../../hooks';
  import emptyPng from '/@/assets/images/empty.png';
  import type { ITd } from '@gct/nocode-base';

  const props = defineProps<{
    /** 点击的单元格 id */
    clickTdId: string;
    /** tdIds集合(主模型、固定表、动态表、二维表、检验表) */
    mainWidgetIds: string[];
    /** tdIds集合(二维表关联子表、检验表关联子表) */
    linkWidgetIds: string[];
    /** 组件信息中心 */
    widgetCenter: Record<string, ITd>;
    /** 表单数据 */
    formState: Record<string, any>;
  }>();

  const { currentIndex, handlePagination, paginationStatus } = usePaginationControl(
    computed(() => props.mainWidgetIds.length),
    Math.max(0, props.mainWidgetIds?.findIndex((k) => k === props.clickTdId) ?? -1),
  );

  const currentTdId = computed(() => props.mainWidgetIds[currentIndex.value]);

  defineExpose({
    currentIndex: () => currentIndex.value,
    paginationStatus,
    handlePagination,
  });
</script>

<style lang="scss" scoped>
  .main-field-wrap {
    :deep(.van-field) {
      border-radius: 8px;
    }

    + .main-field-wrap {
      margin-top: 8px;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 700px;
    }

    :deep(.van-empty__description) {
      margin-top: 4px;
      color: #8f8f8f;
    }

    :deep(.van-empty__image) {
      width: 90px;
      height: 90px;
    }
  }
</style>
