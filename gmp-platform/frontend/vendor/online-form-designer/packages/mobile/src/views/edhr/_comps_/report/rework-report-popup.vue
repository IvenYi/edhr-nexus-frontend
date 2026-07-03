<template>
  <basic-popup v-model:show="show" title="不良处置" :popup-props="popupProps">
    <div class="p-8px">
      <div class="rounded-8px bg-white">
        <van-form ref="ReportFormRef">
          <van-field
            :model-value="report_qty_"
            label="报工总数"
            placeholder="请输入报工总数"
            disabled
            input-align="right"
          />
          <van-field
            :required="isRequired"
            v-model.number="reportFormData.good_qty_"
            label="良品数"
            :rules="[{ validator: validateGoodQty }]"
            placeholder="请输入良品数"
            input-align="right"
            type="number"
            :max="9999999"
          />
          <van-field
            :model-value="scrap_qty_"
            label="报废数"
            placeholder="请输入报废数"
            disabled
            input-align="right"
          />
          <van-field
            :required="isRequired"
            v-model.number="reportFormData.duration_"
            label="报工时长（时）"
            label-width="8em"
            placeholder="请输入报工时长"
            input-align="right"
            :rules="[{ required: isRequired, message: '报工时长不能为空' }]"
            @blur="handleDurationChange"
          />
          <van-field
            v-model="reportFormData.start_time_"
            readonly
            is-link
            label="上工时间"
            placeholder="请输入上工时间"
            @click="handleEditStartTime"
            input-align="right"
          />
          <van-field
            v-model="reportFormData.end_time_"
            readonly
            is-link
            label="下工时间"
            placeholder="请输入下工时间"
            @click="handleEditEndTime"
            input-align="right"
          />
        </van-form>
      </div>

      <div class="rounded-8px bg-white mt-8px">
        <AddNgForm @add="handleScrapAdd" />
      </div>

      <div class="rounded-8px bg-white mt-8px">
        <template v-if="reportFormData.scrap_entries_.length > 0">
          <div
            class="pt-12px pb-12px pl-10px pr-34px relative"
            v-for="(e, index) in reportFormData.scrap_entries_"
            :key="index"
          >
            <div class="flex items-center justify-between">
              <div>
                {{ e.scrap_group_name_ }}
              </div>
              <div class="color-[#606266] flex items-center">
                报废数：
                <span class="color-[#309C41] text-24px">{{ e.scrap_qty_ }}</span>
              </div>
            </div>
            <div
              class="bg-[#F5F7FA] pl-10px pr-10px pt-2px pb-2px rounded-4px color-[#606266] mt-8px text-12px"
              >报废原因：{{ e.scrap_reason_name_ }}</div
            >
            <div
              class="h-24px w-24px absolute top-50% -translate-y-50% right-4px color-[#F54547] flex justify-center items-center"
              @click="handleDelete(index)"
            >
              <van-icon name="delete-o" />
            </div>
          </div>
        </template>
        <van-empty v-else image-size="80" />
      </div>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleSubmit">报工</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed, onBeforeMount } from 'vue';
  import { debounce } from 'lodash-es';
  import { EntityModelCategoryEnum, FIELD_TYPE } from '@gct/runtime';
  import AddNgForm from '../scrap/add-form.vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import {
    getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { showSuccessToast } from 'vant';
  import { useDuration } from './useDuration';

  interface IReworkReport {
    duration_?: number;
    good_qty_?: number;
    scrap_qty_?: number;
    report_qty_?: number;
    routing_operation_id_?: string;
    task_type_?: string;
    txn_subject_id_?: string;
    start_time_?: string;
    end_time_?: string;
    scrap_entries_: Array<{
      scrap_group_id_?: string;
      scrap_group_name_?: string;
      scrap_qty_?: number;
      scrap_reason_id_?: string;
      scrap_reason_name_?: string;
    }>;
  }

  type INgItem = IReworkReport['scrap_entries_'][number];

  const props = defineProps<{
    popupProps: any;
    context: {
      containerId: string;
      containerOperationId: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const isRequired = ref<boolean>(true);
  const reportFormData = ref<IReworkReport>({
    scrap_entries_: [],
  });
  const ReportFormRef = ref();
  const { handleDurationChange, handleEditStartTime, handleEditEndTime } =
    useDuration(reportFormData);

  onBeforeMount(async () => {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey({
      bsKey: 'disable_required',
      modelKey: 'em_txn_report',
      modelCategory: EntityModelCategoryEnum.ENTITY,
    });

    console.log(res);
    isRequired.value = !Boolean(res);
  });

  // 报废数
  const scrap_qty_ = computed(() => {
    return reportFormData.value.scrap_entries_.reduce((total, ngItem) => {
      total += ngItem.scrap_qty_ ?? 0;
      return total;
    }, 0);
  });

  // 报工统计
  const report_qty_ = computed(() => {
    return scrap_qty_.value + (reportFormData.value.good_qty_ ?? 0);
  });

  const handleScrapAdd = (payload: INgItem) => {
    console.log('payload', payload);
    const { scrap_group_id_, scrap_reason_id_, scrap_qty_ } = payload;
    const record = reportFormData.value.scrap_entries_.find(
      (item) =>
        item.scrap_group_id_ === scrap_group_id_ && item.scrap_reason_id_ === scrap_reason_id_,
    );
    if (record) {
      record.scrap_qty_! += scrap_qty_!;
    } else {
      reportFormData.value.scrap_entries_.push(payload);
    }
  };

  const handleDelete = (index: number) => {
    reportFormData.value.scrap_entries_!.splice(index, 1);
  };

  /**
   * 良品数量校验
   */
  const validateGoodQty = () => {
    if (isRequired.value && [undefined, ''].includes(reportFormData.value.good_qty_ as any))
      return '良品数不能为空';
    if (reportFormData.value.good_qty_! < 0) return '良品数不能小于0';
    if (reportFormData.value.good_qty_! > 9999999) return '良品数不能大于999999';
    return true;
  };

  const submit = async () => {
    try {
      await ReportFormRef.value?.validate();
      const { duration_, good_qty_, start_time_, end_time_, scrap_entries_ } = reportFormData.value;
      const data = {
        duration_,
        good_qty_,
        scrap_qty_: scrap_qty_.value,
        report_qty_: good_qty_! + scrap_qty_.value,
        routing_operation_id_: props.context.containerOperationId,
        task_type_: 'rework',
        txn_subject_id_: props.context.containerId,
        start_time_: start_time_ ? start_time_ + ':00' : undefined,
        end_time_: end_time_ ? end_time_ + ':00' : undefined,
        scrap_entries_: scrap_entries_.map((item) => {
          const { scrap_group_id_, scrap_qty_, scrap_reason_id_ } = item;
          return {
            scrap_group_id_,
            scrap_qty_,
            scrap_reason_id_,
          };
        }),
      };

      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'execute',
          modelKey: 'em_txn_report',
          modelCategory: 'entity',
        },
        data as any,
      );

      showSuccessToast('报工成功');
      if (props.onOk && typeof props.onOk === 'function') {
        props.onOk();
      }
      show.value = false;
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSubmit = debounce(submit, 1000, { leading: true, trailing: false });
</script>

<style scoped lang="less"></style>
