<template>
  <div class="p-16px">
    <DescriptionItem :colon="false" name="生产批次">
      <span class="color--active">{{ containerOperationInfo?.container_name_ }} </span>
    </DescriptionItem>
    <DescriptionItem
      :colon="false"
      name="所属工单"
      :value="containerOperationInfo?.f_mfg_order_jhwd"
    />
    <DescriptionItem :colon="false" name="所属订单" :value="containerOperationInfo?.order_code_" />
    <DescriptionItem
      :colon="false"
      name="物料名称"
      :value="`${containerOperationInfo?.f_product_name_jhwd}:${containerOperationInfo?.product_version}`"
    />
    <DescriptionItem
      :colon="false"
      name="物料编码"
      :value="containerOperationInfo?.material_code"
    />
    <DescriptionItem
      :colon="false"
      name="产品家族名称"
      :value="containerOperationInfo?.product_family_name"
    />
    <DescriptionItem
      :colon="false"
      name="产品家族编码"
      :value="containerOperationInfo?.product_family_code"
    />
    <DescriptionItem
      :colon="false"
      name="任务生产总数"
      :value="containerOperationInfo?.original_qty_"
    />
    <DescriptionItem
      :colon="false"
      name="工单计划开始时间"
      :value="containerOperationInfo?.order_planned_start_date_"
    />
    <DescriptionItem
      :colon="false"
      name="工单计划结束时间"
      :value="containerOperationInfo?.order_planned_completion_date_"
    />
    <DescriptionItem
      :colon="false"
      name="任务实际开始时间"
      :value="containerOperationInfo?.start_work_date_"
    />
    <DescriptionItem :colon="false" name="任务状态">
      <StatusTag :value="containerOperationInfo?.status_" />
    </DescriptionItem>
    <DescriptionItem
      :colon="false"
      name="当前执行工序"
      :value="containerOperationInfo?.current_routing_operation_names_"
    />
  </div>
</template>

<script setup lang="ts">
  import { useReworkRun } from './useReworkRun';
  import DescriptionItem from '@mobile/views/edhr/_comps_/description/item.vue';
  import StatusTag from '../produce/status-tag.vue';

  const props = defineProps<{
    hook?: Function;
  }>();

  const { containerOperationInfo } = (props.hook ?? useReworkRun)();
</script>

<style scoped lang="less">
  .edhr-desc-item {
    min-height: 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
