<template>
  <div :class="ns.be('content', 'grids')">
    <DataGrid :title="'关键指标数据'" :dataSource="keyIndicatorData" />
    <DataGrid
      :title="'失控点样本数据'"
      :columns="[{ title: '样本数据', dataIndex: 'value', align: 'center' }]"
      :dataSource="outSampleData"
    />
    <DataGrid :title="'失控点指标数据'" :dataSource="outIndicatorData" />
    <DataGrid
      ref="outControlGridRef"
      :title="'失控点判异信息'"
      :columns="[
        { title: '失控判异信息', dataIndex: 'name', align: 'center', scopedSlots: 'rowCell' },
      ]"
      :dataSource="outRulesData"
      :config="{ clickable: true, highlight: true }"
      @rowClick="onRowClick"
    >
      <template #rowCell="{ record, column, rowIndex }">
        <div class="analytics-data-grid_row">
          <div class="analytics-data-grid_row-content"> {{ record[column.dataIndex] }}</div>
          <div
            class="analytics-data-grid_row-label"
            :style="{
              color: record.handled_ ? '#52c41a' : '#f5222d',
            }"
          >
            {{ record.handled_ ? '已处理' : '未处理' }}
          </div>
        </div>
      </template>
    </DataGrid>
    <div class="analytics-data-grid">
      <div class="analytics-data-grid_title"> {{ t('失控点处理') }}</div>
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item>
          <div class="flex items-center justify-between">
            <a-checkbox
              v-model:checked="formData.to_experience_library_"
              :disabled="ruleFormDisabled"
              @change="onSelectLibrary"
            >
              {{ t('是否入经验库') }}
            </a-checkbox>
            <span
              v-if="!ruleFormDisabled"
              class="cursor-pointer"
              style="color: var(--ant-primary-color)"
              @click="toExperienceLibrary"
            >
              {{ t('从经验库中选择') }}</span
            >
          </div>
        </a-form-item>
        <a-form-item
          label="处理结论"
          name="result_"
          :rules="ruleFormDisabled ? undefined : [{ required: true, message: '请输入处理结论' }]"
        >
          <a-textarea
            v-model:value="formData.result_"
            :disabled="ruleFormDisabled"
            placeholder="请输入"
            :rows="2"
          />
        </a-form-item>
        <a-form-item
          label="失控原因"
          name="reason_"
          :rules="ruleFormDisabled ? undefined : [{ required: true, message: '请输入失控原因' }]"
        >
          <a-textarea
            v-model:value="formData.reason_"
            :disabled="ruleFormDisabled"
            placeholder="请输入"
            :rows="2"
          />
        </a-form-item>
        <a-form-item
          label="处理措施"
          name="action_"
          :rules="ruleFormDisabled ? undefined : [{ required: true, message: '请输入处理措施' }]"
        >
          <a-textarea
            v-model:value="formData.action_"
            :disabled="ruleFormDisabled"
            placeholder="请输入"
            :rows="2"
          />
        </a-form-item>
        <a-form-item
          label="通知人员"
          name="notify_range_"
          :rules="ruleFormDisabled ? undefined : [{ required: true, message: '请选择通知人员' }]"
        >
          <WidgetRender :key="ruleFormDisabled" :widget="notifyRangeField" :formData="formData" />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, nextTick } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { keyIndicatorFields, outOfControlFields } from '../../../constants/measureColumns';
  import DataGrid from '../../../components/data-grid/data-grid.vue';
  import WidgetRender from '/@web-render/render/widget/widget-async.vue';
  import ExpHistoryModal from '../modal/exp-history.vue';
  import ExpLibraryModal from '../modal/exp-library.vue';
  import { message } from 'ant-design-vue';
  import { getOutOfRuleEnums } from '../../../utils';

  const defProps = defineProps<{
    analyticsData: any;
    parentWidget: any;
    parentData: any;
  }>();

  const emit = defineEmits<{
    (event: 'rowClick', data: any): void;
    (event: 'toExperienceLibrary', data: any): void;
  }>();

  const { t } = useI18n();
  const ns = useNamespace('analytics-view');

  const formRef = ref();
  const formData = ref({
    to_experience_library_: false,
    result_: '',
    reason_: '',
    action_: '',
    notify_range_: '',
    experience_library_id_: '1', // 默认全部
  });

  const outControlGridRef = ref();

  const outRule = ref<any>({});
  const ruleFormDisabled = computed(() => {
    return outRule.value && !!outRule.value?.handled_;
  });

  const computeResult = computed(() => {
    return defProps.analyticsData?.computeResult;
  });

  const keyIndicatorData = computed(() => {
    return keyIndicatorFields.map((it) => {
      return {
        name: it.replace('_', '').replace(/^\w/, (c) => c.toUpperCase()),
        value: computeResult.value?.[it],
      };
    });
  });

  const outSampleData = computed(() => {
    const measureGroup = defProps.analyticsData?.measureGroup ?? [];
    const outMeasure = measureGroup.find((it) => it.id_ === defProps.parentData?.subgroup_id_);
    if (!outMeasure) return [];
    const sampleData = outMeasure?.sample_data_;
    const _sampleData = sampleData.split(',') ?? [];
    return _sampleData.map((it) => {
      return {
        name: it,
        value: it,
      };
    });
  });
  const outIndicatorData = computed(() => {
    const measureGroup = defProps.analyticsData?.measureGroup ?? [];
    const outMeasure = measureGroup.find((it) => it.id_ === defProps.parentData?.subgroup_id_);
    return outOfControlFields.map((it) => {
      return {
        name: t(`sys.kit.qms.indicator.${it.replaceAll('_', '')}`),
        value: outMeasure?.[it],
      };
    });
  });

  const outRuleOptions = ref<any[]>([]);
  const outRulesData = ref<{ name: string; value: string }[]>([]);

  const rangeUserField = computed(() => {
    return defProps.parentWidget.children?.[0];
  });
  const notifyRangeField = computed(() => {
    return {
      ...rangeUserField.value,
      disabled: ruleFormDisabled.value,
      props: {
        ...rangeUserField.value?.props,
        field: 'notify_range_',
        disabled: ruleFormDisabled.value,
      },
    };
  });

  async function getOutRulesMaps() {
    try {
      outRuleOptions.value = await getOutOfRuleEnums();
    } catch (error) {
      outRuleOptions.value = [];
    }
  }

  async function getOutRuleHistory() {
    const outRules = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_out_of_control_history_entry',
        bsKey: 'listAll',
      },
      {
        query: {
          ref_master_id_: defProps.parentData.id_,
        },
      },
    );
    outRulesData.value = (outRules?.data ?? []).map((it) => {
      const findRule = outRuleOptions.value.find((i) => i.value === it.out_of_control_rule_);
      const label = (findRule?.label ?? '').replace('N', it.n_ ?? 'N');
      return {
        name: label,
        value: it.out_of_control_rule_,
        disabled: !!it.handled_,
        ...it,
      };
    });
    if (outRulesData.value.length) {
      await nextTick();
      outControlGridRef.value.handleRowClick(outRulesData.value[0]);
    }
  }

  async function onRowClick(row: any) {
    console.log('onRowClick', row);
    outRule.value = row;
    if (row.handled_) {
      formData.value.to_experience_library_ = row.to_experience_library_ ?? false;
      formData.value.result_ = row.result_;
      formData.value.reason_ = row.reason_;
      formData.value.action_ = row.action_;
      formData.value.notify_range_ = row.notify_range_;
      formData.value.experience_library_id_ = row.experience_library_id_;
      await nextTick();
      formRef.value.clearValidate();
    } else {
      formData.value.to_experience_library_ = false;
      formData.value.result_ = '';
      formData.value.reason_ = '';
      formData.value.action_ = '';
      formData.value.notify_range_ = '';
      formData.value.experience_library_id_ = '';
    }
    emit('rowClick', row);
  }

  async function toExperienceLibrary() {
    const res = await gct.openUtil.modal<any>(
      ExpHistoryModal,
      {
        data: {},
      },
      {
        title: '从经验库引用',
        width: 800,
        showFooter: false,
      },
    );
    if (res.ok && res.data) {
      Object.assign(formData.value, res.data);
    }
  }
  async function onSelectLibrary(val) {
    const checked = val.target.checked;
    if (!checked) {
      formData.value.experience_library_id_ = '';
      return;
    }
    const res = await gct.openUtil.modal<any>(
      ExpLibraryModal,
      {
        data: {},
      },
      {
        title: '经验组',
        width: 600,
        showFooter: false,
      },
    );
    if (res.ok && res.data) {
      Object.assign(formData.value, res.data);
    } else {
      formData.value.experience_library_id_ = '1'; // 默认全部
    }
  }

  // 提交判异处理
  async function onSubmitHandle() {
    if (!outRule.value.out_of_control_rule_) {
      message.warn('请选择判异规则');
      return;
    }
    if (outRule.value.handled_) {
      message.warn('当前判异规则已处理，请重新选择后再提交');
      return;
    }
    await formRef.value.validate();
    await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_out_of_control_history_entry',
        bsKey: 'biz_handle',
      },
      {
        ...formData.value,
        ref_master_id_: defProps.parentData.id_,
        ref_field_key_: 'entries_',
        out_of_control_rule_: outRule.value?.out_of_control_rule_,
        n_: outRule.value?.n_,
        experience_library_id_: formData.value?.experience_library_id_,
        id_: outRule.value?.id_,
      },
    );
    message.success('处理成功');
    return { ok: true };
  }

  onMounted(async () => {
    await getOutRulesMaps();
    await getOutRuleHistory();
  });

  defineExpose({
    outRulesData,
    outRuleOptions,
    submitHandle: onSubmitHandle,
  });
</script>
<style lang="scss">
  .gct-analytics-view-content {
    &__grids {
      display: flex;
      justify-content: space-between;

      & > div:not(:last-child) {
        margin-right: 12px;
      }
    }

    .analytics-data-grid {
      flex: 1;
      background: #ffffff;

      &_title {
        font-weight: bold;
      }

      &_row {
        position: relative;
        padding-right: 32px;
        &-label {
          position: absolute;
          right: -12px;
          bottom: -8px;
          padding: 0 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      }
    }
  }
</style>
