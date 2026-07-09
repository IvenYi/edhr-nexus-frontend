<template>
  <basic-popup v-model:show="show" title="生产报工" :popup-props="popupProps">
    <div class="p-8px">
      <div class="rounded-8px bg-white">
        <van-form ref="ReportFormRef">
          <van-field
            :model-value="report_qty_"
            label="报工总数"
            placeholder="请输入用户名"
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
            :model-value="not_good_qty_"
            label="不良数"
            placeholder="请输入不良数"
            disabled
            input-align="right"
          />
          <van-field
            :required="isRequired"
            v-model.number="reportFormData.duration_"
            label="报工时长（时）"
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
        <AddNgForm @add="handleNgAdd" />
      </div>

      <div class="rounded-8px bg-white mt-8px">
        <template v-if="reportFormData.entries_.length > 0">
          <div
            class="pt-12px pb-12px pl-10px pr-34px relative"
            v-for="(e, index) in reportFormData.entries_"
            :key="index"
          >
            <div class="flex items-center justify-between">
              <div>
                {{ e.not_good_group_name_ }}
              </div>
              <div class="color-[#606266] flex items-center">
                不良数量：
                <span class="color-[#309C41] text-24px">{{ e.not_good_qty_ }}</span>
              </div>
            </div>
            <div
              class="bg-[#F5F7FA] pl-10px pr-10px pt-2px pb-2px rounded-4px color-[#606266] mt-8px text-12px"
              >不良原因：{{ e.not_good_reason_name_ }}</div
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
  import AddNgForm from '../ng/add-form.vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import {
    getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { showSuccessToast } from 'vant';
  import { useDuration } from './useDuration';

  interface IProduceReport {
    duration_?: number;
    good_qty_?: number;
    not_good_qty_?: number;
    report_qty_?: number;
    routing_operation_id_?: string;
    task_type_?: string;
    txn_subject_id_?: string;
    start_time_?: string;
    end_time_?: string;
    entries_: Array<{
      not_good_group_id_?: string;
      not_good_group_name_?: string;
      not_good_qty_?: number;
      not_good_reason_id_?: string;
      not_good_reason_name_?: string;
    }>;
  }

  type INgItem = IProduceReport['entries_'][number];

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
  const reportFormData = ref<IProduceReport>({
    entries_: [],
  });
  const ReportFormRef = ref();
  const { handleDurationChange, handleEditStartTime, handleEditEndTime, durationFormatter } =
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

  // 不良统计
  const not_good_qty_ = computed(() => {
    return reportFormData.value.entries_.reduce((total, ngItem) => {
      total += ngItem.not_good_qty_ ?? 0;
      return total;
    }, 0);
  });

  // 报工统计
  const report_qty_ = computed(() => {
    return not_good_qty_.value + (reportFormData.value.good_qty_ ?? 0);
  });

  const handleNgAdd = (payload: INgItem) => {
    console.log('payload', payload);
    const { not_good_group_id_, not_good_reason_id_, not_good_qty_ } = payload;
    const record = reportFormData.value.entries_.find(
      (item) =>
        item.not_good_group_id_ === not_good_group_id_ &&
        item.not_good_reason_id_ === not_good_reason_id_,
    );
    if (record) {
      record.not_good_qty_! += not_good_qty_!;
    } else {
      reportFormData.value.entries_.push(payload);
    }
  };

  const handleDelete = (index: number) => {
    reportFormData.value.entries_!.splice(index, 1);
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
      const { duration_, good_qty_, start_time_, end_time_, entries_ } = reportFormData.value;
      const data = {
        duration_,
        good_qty_,
        not_good_qty_: not_good_qty_.value,
        report_qty_: good_qty_! + not_good_qty_.value,
        routing_operation_id_: props.context.containerOperationId,
        task_type_: 'production',
        txn_subject_id_: props.context.containerId,
        start_time_: start_time_ ? start_time_ + ':00' : undefined,
        end_time_: end_time_ ? end_time_ + ':00' : undefined,
        entries_: entries_.map((item) => {
          const { not_good_group_id_, not_good_qty_, not_good_reason_id_ } = item;
          return {
            not_good_group_id_,
            not_good_qty_,
            not_good_reason_id_,
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
