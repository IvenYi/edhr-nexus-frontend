<template>
  <a-spin :spinning="loading">
    <div :class="ns.b()">
      <div :class="ns.b('header')">
        <div :class="ns.be('header', 'left')">
          <div :class="ns.be('header', 'back')" @click="onClose">
            <i class="iconfont icon-a-Leftarrow"></i>
            <div :class="ns.be('header', 'title')" @click="onClose">{{ t('返回列表') }}</div>
          </div>
          <div :class="ns.be('header', 'view-title-edit')">
            <span :class="ns.e('edit-title')">
              <span class="mx-2">|</span>
              <span :title="titleName">{{ titleName }}</span>
            </span>
          </div>
        </div>
        <div :class="ns.be('header', 'right')">
          <div :class="ns.be('header', 'view-actions')" v-if="!rangeFormDisabled">
            <a-button @click="onStyleSetting">
              <template #default>{{ t('sys.kit.qms.allStyleConfig') }}</template>
            </a-button>
            <a-button @click="onRuleSetting">
              <template #default>{{ t('sys.kit.qms.outOfControlRuleConfig') }}</template>
            </a-button>
            <a-button @click="onPropertySetting">
              <template #default>{{ t('sys.kit.qms.propertyConfig') }}</template>
            </a-button>
            <a-button @click="onEdit">
              <template #default>{{ t('sys.kit.qms.edit') }}</template>
            </a-button>
            <a-button @click="onSaveAndPublish" :disabled="isEmptyScene">
              <template #default>{{ t('sys.kit.qms.saveAndPublish') }}</template>
            </a-button>
          </div>
          <div :class="ns.be('header', 'view-actions')" v-if="submitHandleVisible">
            <a-button @click="onSubmitHandle">
              <template #default>{{ t('sys.kit.qms.submitHandle') }}</template>
            </a-button>
          </div>
        </div>
      </div>
      <div :class="ns.b('panel')">
        <div :class="ns.be('panel', 'left')">
          <a-form ref="rangeForm" layout="inline" :model="rangeFormData">
            <a-form-item label="分析开始时间" name="start_time_" :required="!rangeFormDisabled">
              <a-date-picker
                v-model:value="rangeFormData.start_time_"
                :showTime="{ format: dateFormat }"
                :valueFormat="dateFormat"
                :disabled="rangeFormDisabled"
                :disabled-date="disableStartDate"
                :disabled-time="disableStartTime"
                placeholder="请选择开始时间"
              />
            </a-form-item>
            <div class="connector mr-4">{{ $t('sys.webRender.to') }}</div>
            <a-form-item
              v-if="!rangeFormData.isRealTime"
              label="分析结束时间"
              name="end_time_"
              :required="!rangeFormDisabled"
              :disabled="rangeFormDisabled"
            >
              <a-date-picker
                v-model:value="rangeFormData.end_time_"
                :showTime="{ format: dateFormat }"
                :valueFormat="dateFormat"
                placeholder="请选择结束时间"
                :disabled="rangeFormDisabled"
                :disabled-date="disableEndDate"
                :disabled-time="disableEndTime"
              />
            </a-form-item>
            <div v-if="rangeFormData.isRealTime" class="now mr-4">{{ t('当前') }}</div>
            <a-form-item name="isRealTime">
              <a-checkbox
                v-model:checked="rangeFormData.isRealTime"
                :disabled="rangeFormDisabled"
                @change="handleRealTimeChange"
              >
                {{ t('开始实时监控') }}
              </a-checkbox>
            </a-form-item>
          </a-form>
        </div>
        <div :class="ns.be('panel', 'right')">
          <div :class="ns.e('chart-type-wrapper')">
            <a-radio-group v-model:value="mainChartType">
              <a-radio-button
                :value="chart.value"
                v-for="chart in mainChartTypes"
                :key="chart.value"
                >{{ chart.label }}</a-radio-button
              >
            </a-radio-group>
          </div>
        </div>
      </div>
      <div :class="ns.b('content')">
        <div :class="ns.be('content', 'wrapper')">
          <div :class="ns.e('charts')">
            <template v-for="(chart, index) in showCharts">
              <ChartView
                v-if="chart.type"
                :key="chart.label"
                :chartIndex="index"
                :visualType="toCamelCase(chart.type)"
                :chartConfig="chart"
                :parentData="{ ...props.data, ...planData }"
                :originData="chartMapperData(chart)"
                :usage="usage"
                @update:myStyleConfig="updateMyStyle"
              />
            </template>
          </div>
          <div v-if="mainChartType === 'cpkAnalyze'" class="analytics-data-grid_wrapper">
            <ContentWithCpkChart :analyticsData="analyticsData" />
          </div>
        </div>

        <ContentPlan
          v-if="[EAnalyticsViewScene.PLAN_PREVIEW, EAnalyticsViewScene.PLAN_DETAIL].includes(usage)"
          :analyticsData="analyticsData"
        />
        <ContentOutOfControl
          ref="outOfControlRef"
          v-else-if="usage === EAnalyticsViewScene.OUT_OF_CONTROL"
          :analyticsData="analyticsData"
          :parentWidget="props.widget"
          :parentData="props.data"
        />
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
  import { ref, nextTick, onMounted, computed, watch, onBeforeUnmount } from 'vue';
  import { message } from 'ant-design-vue';
  import { useNamespace, IModal } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Events } from '/@web-render/render/Event/baseEvent';
  import { operateSysEnums } from '/@page-designer/enum';
  import {
    postBizServiceByModelKeyByBsKey,
    getBizServiceByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/BsServiceController';
  import ChartView from '../../components/chart-view/chart-view.vue';
  import StyleModal from './modal/style.vue';
  import PropertyModal from './modal/property.vue';
  import RuleModal from './modal/rule.vue';
  import PublishModal from './modal/publish.vue';
  import ContentPlan from './content-minor/content-plan.vue';
  import ContentOutOfControl from './content-minor/content-out-control.vue';
  import ContentWithCpkChart from './content-minor/content-with-cpkchart.vue';
  import { chartConfigs } from '../../configs/index';
  import { EAnalyticsViewScene } from '../../enums';
  import { useDateDisabled } from './useDateDisabled';

  const ns = useNamespace('analytics-view');
  const { t } = useI18n();

  const props = defineProps<{
    data: any;
    usage: EAnalyticsViewScene;
    modal: IModal;
    Event: Events;
    widget;
  }>();
  console.log(props.data, 'props.data');

  const usage = computed(() => props.usage || props.data?.usage);

  const loading = ref(false);

  const dateFormat = 'YYYY-MM-DD HH:mm:ss';
  const rangeForm = ref();
  const rangeFormData = ref({
    start_time_: null,
    end_time_: null,
    isRealTime: false,
  });
  const rangeFormDisabled = computed(() => {
    return props.data.status_ !== 'unpublished';
  });

  const { disableStartDate, disableStartTime, disableEndDate, disableEndTime } = useDateDisabled(
    rangeFormData.value,
  );

  const submitHandleVisible = computed(() => {
    return usage.value === EAnalyticsViewScene.OUT_OF_CONTROL && props.data.status_ !== 'handled';
  });

  const outOfControlRef = ref();

  const titleName = computed(() => {
    return (
      (props.data.name_ || props.data.plan_name_) +
      ' / ' +
      (props.data.code_ || props.data.plan_code_)
    );
  });

  const mainChartTypes = computed(() => {
    const charts = chartConfigs[props.data.chart_type_];
    return Object.keys(charts).map((it) => {
      return {
        label: t(`sys.kit.qms.chart.${it}`),
        value: it,
      };
    });
  });
  const mainChartType = ref<string>();
  const showCharts = computed(() => {
    if (!props.data.chart_type_) return [];
    const charts = chartConfigs[props.data.chart_type_][mainChartType.value];
    if (!charts) return [];

    return charts.map((it) => {
      return {
        ...it,
        label: t(`sys.kit.qms.chart.${it.name}`),
        type: it.type,
      };
    });
  });

  const planData = ref<any>({});
  const analyticsData = ref<{
    measureGroup: Array<any>;
    computeResult;
    plan;
  }>();
  const isEmptyScene = ref(false);

  const chartMapperData = computed(() => (chart) => {
    if (isEmptyScene.value) return null;
    switch (chart.name) {
      case 'ave':
      case 'range':
      case 'demoRunning':
      case 'aveRunning':
      case 'cpkTrend':
      case 'sd':
        return analyticsData.value?.measureGroup;
      case 'cpkAnalyze':
        return analyticsData.value?.computeResult;
      case 'normTest':
        return analyticsData.value?.computeResult;
      // TODO:【待后续需求完善】 other chart data
      default:
        return null;
    }
  });

  // #region button's event
  function onClose() {
    closeModal();
  }
  async function onStyleSetting() {
    const res = await gct.openUtil.drawer<any>(
      StyleModal,
      {
        data: {
          chartType: props.data!.chart_type_,
          masterId: props.data!.id_,
          ...props.data,
        },
        mode: 'all',
      },
      {
        title: '全局样式配置',
        width: 800,
      },
    );
    if (res.ok) {
      closeModal();
    }
  }
  async function onRuleSetting() {
    const res = await gct.openUtil.drawer<any>(
      RuleModal,
      {
        data: {
          chartType: props.data!.chart_type_,
          masterId: props.data!.id_,
          ...props.data,
        },
      },
      {
        title: '判异配置',
        width: 800,
      },
    );
    if (res.ok) {
      closeModal();
    }
  }
  async function onPropertySetting() {
    const res = await gct.openUtil.drawer<any>(
      PropertyModal,
      {
        data: {
          chartType: props.data!.chart_type_,
          masterId: props.data!.id_,
          ...props.data,
          ...planData.value,
        },
      },
      {
        title: '属性配置',
        width: 800,
      },
    );
    if (res.ok) {
      closeModal();
    }
  }
  async function onEdit() {
    return new Promise((res, rej) => {
      const defProps = props.widget?.props;
      // @ts-ignore
      props.Event.context!.$getModal(defProps.refModal).open({
        data: operateSysEnums.EDIT,
        title: '编辑',
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(defProps.refForm);
          const formValue = Object.assign(props.data, {
            ...rangeFormData.value,
            monitoring_approach_: rangeFormData.value.isRealTime ? 'realtime' : 'range',
            monitoring_frequence_: rangeFormData.value.isRealTime
              ? (props.data.monitoring_frequence_ ?? 180)
              : null,
          });
          form.setValue(formValue);
        },
        onClose(arg) {
          res(arg);
          if (arg) {
            closeModal();
          }
        },
      });
    });
  }
  async function onSaveAndPublish() {
    try {
      await rangeForm.value.validate();
      const res = await gct.openUtil.modal<any>(
        PublishModal,
        {
          data: {
            masterId: props.data!.id_,
            ...props.data,
            ...planData.value,
            ...rangeFormData.value,
            monitoring_approach_: rangeFormData.value.isRealTime ? 'realtime' : 'range',
            monitoring_frequence_: rangeFormData.value.isRealTime
              ? (props.data.monitoring_frequence_ ?? 180)
              : null,
          },
          parentWidget: props.widget,
        },
        {
          title: '确认发布',
          width: 600,
          showFooter: false,
        },
      );
      if (res.ok) {
        closeModal();
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 提交判异处理
  async function onSubmitHandle() {
    const res = await outOfControlRef.value.submitHandle();
    if (res.ok) {
      closeModal(true);
    }
  }
  // #endregion

  /** 将连字符转换为驼峰命名 */
  function toCamelCase(str) {
    // 将字符串中的连字符替换为大写字母
    return str
      .replace(/-([a-z])/g, (match, letter) => {
        return letter.toUpperCase();
      })
      .replace(/^\w/, (c) => c.toUpperCase()); // 首字母大写
  }

  function closeModal(status?: boolean) {
    props.modal.dismiss({ ok: !!status });
  }

  async function getAnalyticsData(params?) {
    try {
      isEmptyScene.value = false;
      const bsKey =
        usage.value === EAnalyticsViewScene.PLAN_PREVIEW && props.data.status_ === 'unpublished'
          ? 'biz_preview'
          : 'biz_fetch';
      const bizFn =
        usage.value === EAnalyticsViewScene.PLAN_PREVIEW && props.data.status_ === 'unpublished'
          ? postBizServiceByModelKeyByBsKey
          : getBizServiceByModelKeyByBsKey;
      const paramsData =
        usage.value === EAnalyticsViewScene.PLAN_PREVIEW && props.data.status_ === 'unpublished'
          ? props.data
          : {
              plan_id_: [
                EAnalyticsViewScene.PLAN_PREVIEW,
                EAnalyticsViewScene.PLAN_DETAIL,
              ].includes(usage.value)
                ? props.data.id_
                : undefined,
              plan_execution_history_id_: EAnalyticsViewScene.OUT_OF_CONTROL
                ? props.data.plan_execution_history_id_
                : undefined,
            };
      const res = await bizFn(
        {
          modelKey: 'em_plan',
          bsKey,
        },
        {
          ...paramsData,
          ...params,
        },
      );
      if (!res) {
        message.warn('当前方案未查询到数据');
        isEmptyScene.value = true;
        analyticsData.value = null;
        return;
      }
      const { compute_result_, measure_subgroup_entries_, sample_insufficient_, ...other } =
        res as any;
      if (res && !!sample_insufficient_) {
        message.warn('当前方案样本数据不足');
        isEmptyScene.value = true;
        analyticsData.value = null;
        return;
      }
      analyticsData.value = {
        computeResult: compute_result_,
        measureGroup: measure_subgroup_entries_,
        plan: other, // 方案数据
      };
      const prop_config_ = compute_result_?.prop_config_;
      planData.value = { ...planData.value, prop_config_ };
    } catch (error) {
      isEmptyScene.value = true;
      console.error(error, 'getAnalyticsData error');
    }
  }

  async function getPlanData(planName?, planId?) {
    try {
      const res = await postBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_plan',
          bsKey: 'getOne',
        },
        {
          query: {
            'name_.eq': planName || props.data.plan_name_,
            id_: planId,
          },
        },
      );
      return res.data;
    } catch (error) {
      console.error(error, 'getPlanDataById error');
      return {};
    }
  }

  function handleBackEvent(event) {
    if (event.state && event.state.back) {
      event.preventDefault();
      closeModal();
    }
  }

  function handleRealTimeChange(e) {
    const { checked } = e.target;
    if (checked) {
      rangeFormData.value.end_time_ = null;
    }
  }

  async function updateMyStyle(myStyleConfig) {
    planData.value.my_style_config_ = myStyleConfig;
    const { data_version_ } = await getPlanData(null, props.data.id_);
    planData.value.data_version_ = data_version_;
  }

  // 声明 timer 变量用于定时器
  let timer: ReturnType<typeof setInterval> | null = null;
  watch(
    () => rangeFormData.value,
    (val) => {
      clearIntervalFn();
      const { start_time_: startTime, end_time_: endTime, isRealTime } = val;
      if (isRealTime && startTime) {
        const monitorFrequence = props.data.monitoring_frequence_ ?? 180;
        const params = {
          ...val,
          monitoring_approach_: 'realtime',
          monitoring_frequence_: monitorFrequence,
        };
        if (!timer) {
          getAnalyticsData(params);
        }
        timer = setInterval(() => {
          getAnalyticsData(params);
        }, monitorFrequence * 1000);
      }
      if (!isRealTime && startTime && endTime) {
        getAnalyticsData({
          ...val,
          monitoring_approach_: 'range',
          monitoring_frequence_: null,
        });
      }
    },
    {
      deep: true,
    },
  );

  function clearIntervalFn() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onMounted(async () => {
    if (usage.value === EAnalyticsViewScene.OUT_OF_CONTROL) {
      planData.value = await getPlanData();
    }
    await nextTick();
    const { start_time_, end_time_, monitoring_approach_ } = { ...props.data, ...planData.value };
    rangeFormData.value.start_time_ = start_time_;
    rangeFormData.value.end_time_ = end_time_;
    rangeFormData.value.isRealTime = monitoring_approach_ === 'realtime';
    mainChartType.value = mainChartTypes.value?.[0]?.value;
    window.addEventListener('popstate', handleBackEvent);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', handleBackEvent);
    clearIntervalFn();
  });
</script>

<style lang="scss">
  @import './analytics.scss';
</style>
