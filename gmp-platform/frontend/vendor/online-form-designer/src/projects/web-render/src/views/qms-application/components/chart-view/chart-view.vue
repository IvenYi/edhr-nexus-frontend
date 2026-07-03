<template>
  <div :class="ns.b()">
    <div :class="ns.b('header')">
      <div :class="ns.be('header', 'left')">
        <h3>{{ props.chartConfig.label }}</h3>
      </div>
      <div :class="ns.be('header', 'right')" v-if="chartToolVisible">
        <i class="iconfont icon-xiazai" @click="onDownLoad"></i>
        <i class="iconfont icon-a-shezhi1" @click="onStyleSetting"></i>
      </div>
    </div>
    <div ref="containerRef" :class="ns.b('content')"></div>
  </div>
</template>

<script setup lang="ts">
  import { isEmpty } from 'lodash-es';
  import { ref, shallowRef, onMounted, nextTick, computed, onBeforeUnmount, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import StyleModal from '../../render/analytics/modal/style.vue';
  import { EAnalyticsViewScene, EChartType } from '../../enums';
  import { deepMergeWithBPriority } from '../../utils';

  const props = defineProps<{
    chartIndex: number;
    chartConfig: {
      label: string;
      name: string;
      type: EChartType;
      property: string[];
      loadChartData: (data: any) => {
        xAxisData: any;
        seriesData: any;
      };
      // 指定图表配置属性
      specifyOptions?: (params?) => Record<string, any>;
    };
    parentData: any; // 父级数据
    originData: any; // 传入图表的数据
    visualType: string;
    usage: EAnalyticsViewScene;
  }>();

  const emit = defineEmits<{
    (e: 'update:myStyleConfig', value: string): void;
  }>();

  const ns = useNamespace('chart-view');
  const containerRef = ref();
  const chartInstance = shallowRef();

  const uniqConnector = ';__;';
  const chartUniqKey = computed(() => {
    return props.parentData.chart_type_ + uniqConnector + props.chartConfig.name;
  });

  const chartToolVisible = computed(() => {
    return (
      props.usage === EAnalyticsViewScene.PLAN_PREVIEW &&
      props.parentData?.status_ === 'unpublished'
    );
  });

  watch(
    () => props.originData,
    async () => {
      // 实时监控，数据变动需要触犯图表的重新渲染
      const dataset =
        props.originData && props.chartConfig.loadChartData
          ? props.chartConfig.loadChartData(props.originData)
          : null;
      const { propertyConfig, allStyleConfig, singleStyleConfig } = getChartConfig();
      const _displaySetting = {
        markLine: propertyConfig,
      };
      const _styleConfig = getChartStyleConfig(allStyleConfig, singleStyleConfig);
      if (!chartInstance.value?.chart) {
        await chartInstance.value?.reRender(
          containerRef.value,
          dataset,
          _displaySetting,
          _styleConfig,
        );
      } else {
        chartInstance.value?.update(containerRef.value, dataset, _displaySetting, _styleConfig);
      }
      if (props.chartConfig?.specifyOptions) {
        const _specifyOptions = props.chartConfig?.specifyOptions(props.originData);
        chartInstance.value?.setEchartsOption(_specifyOptions);
      }
    },
  );

  function onDownLoad() {
    const dataUrl = chartInstance.value.getDataURL();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${props.chartConfig.label}.png`;
    a.click();
    a.remove();
  }

  async function onStyleSetting() {
    const res = await gct.openUtil.drawer<any>(
      StyleModal,
      {
        data: {
          ...props.chartConfig,
          ...props.parentData,
        },
        mode: 'single',
        chartKey: chartUniqKey.value,
        connector: uniqConnector,
      },
      {
        title: '样式配置',
        width: 800,
      },
    );
    if (res.ok && res.data) {
      // 更新样式配置
      const { allStyleConfig, myStyleConfig, propertyConfig } = getChartConfig();
      myStyleConfig[chartUniqKey.value] = JSON.stringify(res.data);
      const singleStyleConfig = res.data;
      const newStyleConfig = getChartStyleConfig(allStyleConfig, singleStyleConfig);
      const _displaySetting = {
        markLine: propertyConfig,
      };
      const dataset =
        props.originData && props.chartConfig.loadChartData
          ? props.chartConfig.loadChartData(props.originData)
          : null;
      emit('update:myStyleConfig', JSON.stringify(myStyleConfig));
      await nextTick();
      chartInstance.value.reRender(containerRef.value, dataset, _displaySetting, newStyleConfig);
      if (props.chartConfig?.specifyOptions) {
        const _specifyOptions = props.chartConfig?.specifyOptions(props.originData);
        chartInstance.value.setEchartsOption(_specifyOptions);
      }
    }
  }

  // 默认获取后端ucl相关数据，这边需要处理下字段的逻辑，ucl_ 和 r_ucl_ 相关
  function getChartPropertyFields(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    if (isEmpty(data)) return {};

    const chartPropertyFields = props.chartConfig.property;
    if (isEmpty(chartPropertyFields)) return {};

    // 只获取图表配置中定义的字段
    chartPropertyFields.forEach((key) => {
      if (key in data) {
        result[key] = data[key];
      }
    });
    return result;
  }

  function getChartStyleConfig(all, single) {
    const config = deepMergeWithBPriority(all, single);
    return config;
  }

  function getChartConfig() {
    const propertyConfig =
      typeof props.parentData.prop_config_ === 'string'
        ? JSON.parse(props.parentData.prop_config_)
        : {};
    const _propertyConfig = getChartPropertyFields(propertyConfig);
    const allStyleConfig =
      typeof props.parentData.style_config_ === 'string'
        ? JSON.parse(props.parentData.style_config_)
        : {};
    // 当前图表样式自有配置
    const myStyleConfig =
      typeof props.parentData.my_style_config_ === 'string'
        ? JSON.parse(props.parentData.my_style_config_)
        : {};
    const singleStyleConfig =
      typeof myStyleConfig[chartUniqKey.value] === 'string'
        ? JSON.parse(myStyleConfig[chartUniqKey.value])
        : {};

    return {
      propertyConfig: _propertyConfig,
      allStyleConfig,
      myStyleConfig,
      singleStyleConfig,
    };
  }

  async function init(dataset?) {
    const { propertyConfig, allStyleConfig, singleStyleConfig } = getChartConfig();
    const _displaySetting = {
      markLine: propertyConfig,
    };
    const _styleConfig = getChartStyleConfig(allStyleConfig, singleStyleConfig);
    const modules = import.meta.glob('./visuals/*.ts');
    const VisualConstructor = (await modules[`./visuals/Visual${props.visualType}.ts`]()) as any;
    chartInstance.value = new VisualConstructor.default();
    await nextTick();
    chartInstance.value.beforeUpdate(containerRef.value, dataset, _displaySetting, _styleConfig);
  }

  onMounted(async () => {
    try {
      await nextTick();
      const dataset =
        props.originData && props.chartConfig.loadChartData
          ? props.chartConfig.loadChartData(props.originData)
          : null;
      await init(dataset);
      chartInstance.value.update(containerRef.value, dataset);
      if (props.chartConfig?.specifyOptions) {
        const _specifyOptions = props.chartConfig?.specifyOptions(props.originData);
        chartInstance.value.setEchartsOption(_specifyOptions);
      }
    } catch (err) {
      console.error(err);
    }

    window.addEventListener('resize', () => {
      chartInstance.value && chartInstance.value.resize();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', () => containerRef.value);
    chartInstance.value?.dispose?.();
    chartInstance.value = null;
  });
</script>

<style lang="scss">
  @include b(chart-view) {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    min-height: 300px;
    max-height: 400px;
    min-width: 200px;
  }

  @include b(chart-view-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 34px;
    margin: 12px;
    margin-bottom: 0;

    @include e(left) {
      display: flex;
      align-items: center;
    }

    @include e(right) {
      align-items: center;
      display: flex;

      .iconfont {
        color: var(--ant-primary-color);
        margin-right: 8px;
        cursor: pointer;
      }
    }
  }

  @include b(chart-view-content) {
    height: calc(100% - 34px);
  }
</style>
