<template>
  <a-form ref="formRef" :model="formData" class="p16px">
    <div class="font-bold mt-4 mb-2" v-if="visibleAxisSettings?.length">线轴配置</div>
    <a-row :gutter="16">
      <a-col v-for="field in visibleAxisSettings" :key="field" :span="12">
        <a-form-item :label="axisSettingLabels[field]" :name="field">
          <a-input
            v-model:value="formData.axisSetting[field]"
            :placeholder="getAxisPlaceholder(field)"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <div class="font-bold mt-4 mb-2" v-if="visibleMarkLineColors?.length">区间线配置</div>
    <a-row :gutter="16">
      <a-col v-for="field in visibleMarkLineColors" :key="field" :span="12">
        <a-form-item :label="markLineLabels[field]" :name="field">
          <a-input
            v-model:value="formData.markLineColors[field]"
            placeholder="请输入HEX颜色，例如：#000000"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>

  <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
    <a-button style="margin-right: 8px" @click="onCancel">取消</a-button>
    <a-button type="primary" @click="onSubmit" :loading="confirmLoading">确认</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, computed } from 'vue';
  import { IModal, EntityModelCategoryEnum } from '@gct/runtime';
  import { message as Message } from 'ant-design-vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { isEmpty } from 'lodash-es';
  import { EControlChart, EChartName } from '../../../enums/index';

  // ==================== Props ====================
  const defProps = defineProps<{
    modal: IModal;
    data: any;
    mode: 'all' | 'single';
    chartKey: string;
    connector: string;
  }>();

  // ==================== Types ====================
  interface AxisSetting {
    yAxisMaxRate?: string;
    yAxisMinRate?: string;
    yAxisMax?: string;
    yAxisMin?: string;
    labelRotation?: string;
    labelFontSize?: string;
  }

  interface MarkLineColors {
    usl?: string;
    lsl?: string;
    ucl?: string;
    lcl?: string;
    target?: string;
    cl?: string;
  }

  interface ChartConfig {
    axisSetting: AxisSetting;
    markLineColors: MarkLineColors;
  }

  // ==================== 表单数据 ====================
  const formRef = ref();
  const confirmLoading = ref(false);
  const formData = ref<ChartConfig>({
    axisSetting: {},
    markLineColors: {},
  });

  // ==================== 图表配置映射 ====================
  const chartFieldMapping = {
    default: {
      axisSettingFields: [
        'yAxisMaxRate',
        'yAxisMinRate',
        'yAxisMax',
        'yAxisMin',
        'labelRotation',
        'labelFontSize',
      ],
      markLineColorsFields: ['usl', 'lsl', 'ucl', 'lcl', 'target', 'cl'],
    },
    // XBar_r
    [`${EControlChart.X_BAR_R}${defProps.connector}${EChartName.Range}`]: {
      axisSettingFields: [
        'yAxisMaxRate',
        'yAxisMinRate',
        'yAxisMax',
        'yAxisMin',
        'labelRotation',
        'labelFontSize',
      ],
      markLineColorsFields: ['ucl', 'lcl', 'target', 'cl'],
    },
    [`${EControlChart.X_BAR_R}${defProps.connector}${EChartName.CpkAnalyze}`]: {
      axisSettingFields: ['yAxisMaxRate', 'yAxisMinRate', 'labelRotation', 'labelFontSize'],
      markLineColorsFields: ['usl', 'lsl', 'target'],
    },
    [`${EControlChart.X_BAR_R}${defProps.connector}${EChartName.DemoRunning}`]: {
      axisSettingFields: [
        'yAxisMaxRate',
        'yAxisMinRate',
        'yAxisMax',
        'yAxisMin',
        'labelRotation',
        'labelFontSize',
      ],
      markLineColorsFields: ['usl', 'lsl', 'target'],
    },
    [`${EControlChart.X_BAR_R}${defProps.connector}${EChartName.AveRunning}`]: {
      axisSettingFields: [
        'yAxisMaxRate',
        'yAxisMinRate',
        'yAxisMax',
        'yAxisMin',
        'labelRotation',
        'labelFontSize',
      ],
      markLineColorsFields: ['usl', 'lsl', 'target'],
    },
    [`${EControlChart.X_BAR_R}${defProps.connector}${EChartName.NormTest}`]: {
      axisSettingFields: ['labelRotation', 'labelFontSize'],
      markLineColorsFields: [],
    },
    [`${EControlChart.X_BAR_R}${defProps.connector}${EChartName.CpkTrend}`]: {
      axisSettingFields: ['labelRotation', 'labelFontSize'],
      markLineColorsFields: [],
    },
    // X_BAR_S
    [`${EControlChart.XBar_S}${defProps.connector}${EChartName.Sd}`]: {
      axisSettingFields: [
        'yAxisMaxRate',
        'yAxisMinRate',
        'yAxisMax',
        'yAxisMin',
        'labelRotation',
        'labelFontSize',
      ],
      markLineColorsFields: ['ucl', 'lcl', 'target', 'cl'],
    },
    // 后续新增图表类型只需添加到这里即可
  };

  // ==================== 计算属性控制可见字段 ====================
  const currentChartConfig = computed(() => {
    return chartFieldMapping[defProps.chartKey] || chartFieldMapping.default;
  });

  const visibleAxisSettings = computed(() => currentChartConfig.value.axisSettingFields);
  const visibleMarkLineColors = computed(() => currentChartConfig.value.markLineColorsFields);

  // ==================== 字段标签和占位符 ====================
  const axisSettingLabels = {
    yAxisMaxRate: 'Y轴上比例（%）',
    yAxisMinRate: 'Y轴下比例（%）',
    yAxisMax: 'Y轴最大数值',
    yAxisMin: 'Y轴最小数值',
    labelRotation: '标签角度（°）',
    labelFontSize: '标签文字大小',
  };

  const markLineLabels = {
    usl: 'USL颜色',
    lsl: 'LSL颜色',
    ucl: 'UCL颜色',
    lcl: 'LCL颜色',
    target: '目标值(Target)颜色',
    cl: 'CL颜色',
  };

  function getAxisPlaceholder(field: string): string {
    const placeholders: Record<string, string> = {
      yAxisMaxRate: '请输入Y轴上比例',
      yAxisMinRate: '请输入Y轴下比例',
      yAxisMax: '请输入Y轴最大数值',
      yAxisMin: '请输入Y轴最小数值',
      labelRotation: '请输入标签角度',
      labelFontSize: '请输入标签文字大小',
    };
    return placeholders[field] || '';
  }

  // ==================== 提交逻辑 ====================
  async function onSubmit() {
    try {
      await formRef.value.validate();
      if (!defProps.data.id_) return;

      const allConfig = JSON.stringify(formData.value);
      const styleConfig =
        defProps.mode === 'all'
          ? { style_config_: allConfig }
          : { my_style_config_: handleSingleSetting() };

      confirmLoading.value = true;
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_plan',
          bsKey: 'submit',
        },
        {
          id_: defProps.data.id_,
          ...styleConfig,
        },
      );
      Message.success('提交成功');
      defProps.modal.dismiss({ ok: true, data: formData.value });
    } catch (error) {
      console.error('表单校验失败:', error);
    } finally {
      confirmLoading.value = false;
    }
  }

  function handleSingleSetting() {
    if (defProps.mode !== 'single') return;

    const singleSetting = defProps.data.my_style_config_;
    const styleConfig = typeof singleSetting === 'string' ? JSON.parse(singleSetting) : {};
    styleConfig[defProps.chartKey] = JSON.stringify(formData.value);
    return JSON.stringify(styleConfig);
  }

  // ==================== 初始化数据 ====================
  onMounted(async () => {
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_plan',
        bsKey: 'getOne',
      },
      {
        query: {
          id_: defProps.data.id_,
        },
      },
    );

    const { data } = res as any;
    const styleConfig =
      typeof data?.style_config_ === 'string' ? JSON.parse(data.style_config_) : {};
    const myStyleConfig =
      typeof data?.my_style_config_ === 'string' ? JSON.parse(data.my_style_config_) : {};
    const singleStyleConfig =
      typeof myStyleConfig[defProps.chartKey] === 'string'
        ? JSON.parse(myStyleConfig[defProps.chartKey])
        : {};

    const _data = defProps.mode === 'all' ? styleConfig : singleStyleConfig;
    if (isEmpty(_data)) return;

    formData.value = mergeDefaultConfig(_data);
  });

  function mergeDefaultConfig(config: Partial<ChartConfig>): ChartConfig {
    return {
      axisSetting: {
        ...chartFieldMapping.default.axisSettingFields.reduce((acc, field) => {
          acc[field] = '';
          return acc;
        }, {} as Record<string, string>),
        ...config.axisSetting,
      },
      markLineColors: {
        ...chartFieldMapping.default.markLineColorsFields.reduce((acc, field) => {
          acc[field] = '';
          return acc;
        }, {} as Record<string, string>),
        ...config.markLineColors,
      },
    };
  }

  // ==================== 取消按钮 ====================
  function onCancel() {
    defProps.modal.dismiss();
  }
</script>
