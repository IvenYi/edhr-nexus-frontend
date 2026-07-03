<template>
  <div>
    <div v-if="!taskCardDetail" class="h-full flex items-center flex-col pt-24%">
      <div class="h-148px w-148px">
        <img :src="NoData" alt="" class="w100% h100%" />
      </div>
      <span class="color-[#999999] mt-30px">暂无详情</span>
    </div>
    <div class="p-16px" v-else>
      <DescriptionItem :colon="false" name="生产批次">
        <span class="color--active ellipsis">{{ taskCardDetail?.f_name__jhwd }} </span>
      </DescriptionItem>
      <DescriptionItem :colon="false" name="所属工单" :value="taskCardDetail?.f_code__jhwd" />
      <DescriptionItem :colon="false" name="所属订单" :value="taskCardDetail?.f_order_code__jhwd" />
      <DescriptionItem
        :colon="false"
        name="物料名称"
        :value="taskCardDetail?._DICT.f_product_id__jhwd[taskCardDetail?.f_product_id__jhwd][0]"
      />
      <DescriptionItem
        :colon="false"
        name="物料编码"
        :value="taskCardDetail?.f_product_code__jhwd"
      />
      <DescriptionItem
        :colon="false"
        name="产品家族名称"
        :value="taskCardDetail?.f_product_family_name__jhwd"
      />
      <DescriptionItem
        :colon="false"
        name="产品家族编码"
        :value="taskCardDetail?.f_product_family_code__jhwd"
      />
      <DescriptionItem
        :colon="false"
        name="任务生产总数"
        :value="taskCardDetail?.f_original_qty__jhwd"
      />
      <DescriptionItem
        :colon="false"
        name="工单计划开始时间"
        :value="taskCardDetail?.f_planned_start_date__jhwd"
      />
      <DescriptionItem
        :colon="false"
        name="工单计划结束时间"
        :value="taskCardDetail?.f_planned_completion_date__jhwd"
      />
      <DescriptionItem
        :colon="false"
        name="任务实际开始时间"
        :value="taskCardDetail?.f_real_start_date__jhwd"
      />
      <!-- <DescriptionItem
        :colon="false"
        name="任务状态"
        :value="taskCardDetail?._DICT.f_status__jhwd[taskCardDetail?.f_status__jhwd][0]"
      >
      </DescriptionItem> -->
      <DescriptionItem :colon="false" name="任务状态">
        <StatusTag :value="taskCardDetail?.f_status__jhwd" />
      </DescriptionItem>
      <DescriptionItem
        :colon="false"
        name="当前执行工序"
        :value="taskCardDetail?.f_current_routing_operation_names__jhwd"
      />
      <!-- <DescriptionItem :colon="false" name="任务进度">
        {{ containerOperationInfo?.report_qty_sum_ }}/{{ containerOperationInfo?.original_qty_ }}
      </DescriptionItem> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { watch, reactive } from 'vue';
  import { useProduce } from './useProduce';
  import DescriptionItem from '@mobile/views/edhr/_comps_/description/item.vue';
  import StatusTag from './status-tag.vue';
  import NoData from '@mobile/assets/image/no-app.png';

  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    hook?: Function;
  }>();

  const { taskCardDetail } = (props.hook ?? useProduce)();

  const containerOperationInfo = reactive({
    report_qty_sum_: 0,
    original_qty_: 0,
  });

  watch(
    () => taskCardDetail?.value?.f_id__jhwd,
    async (value) => {
      if (!value) return;
      const { f_id__jhwd, f_current_routing_operation_ids__jhwd } = taskCardDetail.value;
      // const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      //   {
      //     bsKey: 'biz_produce_task_operaion_info_jhwd',
      //     modelKey: 'dm_produce_task_operaion_info_jhwd',
      //     modelCategory: 'data',
      //   },
      //   {
      //     container_id_: f_id__jhwd,
      //     routing_operation_id_: f_current_routing_operation_ids__jhwd.split(',')[0],
      //   },
      // );
      // Object.assign(containerOperationInfo, res);
    },
    {
      immediate: true,
    },
  );
</script>

<style scoped lang="less">
  .edhr-desc-item {
    min-height: 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
