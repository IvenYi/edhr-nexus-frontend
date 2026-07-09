import { ComponentAttr, IDisplaySetting, IStyle, } from "../type";
import { ECharts, EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import BigNumber from "bignumber.js";

export const VisualColors = [
  "#026ac8",
  "#687084",
  "#f5222d",
  "#fa8c16",
  "#fadb14",
  "#a0d911",
  "#52c41a",
]

export const VisualMarkLineColors = [
  "#52c41a",
  "#f5222d",
  "#fa8c16",
  "#fadb14",
  "#a0d911",
  "#13c2c2",
  "#1890ff",
  "#722ed1",
  "#eb2f96",
  "#ff4d4f",
  "#ff8c00",
  "#ffd700",
  "#ffff00",
]

export function getMarkLineName(name) {
  const isR = name.indexOf('r_') !== -1
  const _name = isR ? name.replace('r_', '').replaceAll('_', '') : name.replaceAll('_', '')
  return _name.toUpperCase()
}

export function getTextWidth(text) {
  let div = document.createElement('div')
  document.body.appendChild(div);
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.innerHTML = text;
  const width = div.clientWidth;
  document.body.removeChild(div);
  return width;
}

export function getMaxMarkLineNameWidth(keys, config) {
  if (!keys || !keys.length) return 24;

  const widthArr = keys.map((it) => {
    if (!config[it]) return 24;
    const text = getMarkLineName(it) + ": " + config[it]
    const width = getTextWidth(text)
    return width
  });
  const max = Math.max(...widthArr)
  return max + 12
}

export type EChartsGetDataURLArg = Parameters<ECharts['getDataURL']>[0]

export interface VisualEChartItemMinStyle {
  widthPx: number
  widthNumber: number
  heightPx: number
  heightNumber: number
  needAdapt: boolean
}

export interface DimensionDataset<T> {
  columns?: unknown,
  rows?: Array<T>,
  originData?: Array<T> | Record<string, Array<T>>
  xAxisData: Array<T>
  seriesData: Array<T> | Record<string, Array<T>>
}

function removeChildren(parent?: HTMLElement): HTMLElement | undefined {
  if (!parent) return parent;
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
  return parent;
}

export default abstract class VisualEchart {
  name: string;

  /** 挂载（DOM）节点 */
  _el!: HTMLElement;

  /** 图标实例属性 */
  chart!: echarts.ECharts;

  options: EChartsOption = {};

  // 图表数据集合
  _dataset: DimensionDataset<any> | undefined;

  // 图表配置样式（markLine）
  _style: IStyle | undefined;

  //  显示设置(markLine)
  _displaySetting: IDisplaySetting | undefined;

  // 是否支持坐标轴文字旋转
  supportAxisLabelRotate = true;

  get showPercentageValue() {
    return false;
  }

  /**
   * X 轴标题
   * @description 实现一个 getter, 配置 X 轴标题
   */
  abstract xAxisTitle: string

  /**
   * Y 轴标题
   * @description 实现一个 getter, 配置 Y 轴标题
   */
  abstract yAxisTitle: string
  abstract xAxis2Title: string
  abstract yAxis2Title: string

  /**
   * VisualEChart 定义的坐标轴轴线的默认样式
   * @description https://echarts.apache.org/zh/option.html#xAxis.axisLine
   */
  get axisLineDefaultOptions() {
    return {
      show: true,
      lineStyle: {
        color: '#BCC2CC'
      }
    };
  }
  /**
   *  VisualEChart 定义的坐标轴轴线的分割样式
   */
  get splitLineDefaultOptions() {
    return {
      show: true,
      lineStyle: {
        color: '#BCC2CC',
        type: 'dashed'
      }
    };
  }
  get textStyle() {
    return {
      color: '#061632',
      fontFamily: 'Rubik,PingFang SC,Helvetica Neue,Helvetica,Hiragino Sans GB,Microsoft YaHei,ST Heiti,SimHei,Arial,sans-serif'
    };
  }
  get tooltipDefaultOptions() {
    return {
      confine: true,
      backgroundColor: '#FEFEFE',
      enterable: true,
      extraCssText: 'max-width: 400px;max-height:280px;box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.3); text-align: left; overflow-y: auto; overflow-x: auto;white-space: normal;z-index: 99;border-color: rgb(254,254,254) !important;',
      textStyle: {
        color: '#020A1A',
        fontSize: 12
      }
    };
  }
  /**
   * VisualEChart 定义的 axis trigger tooltip options
   */
  get axisTooltipOptions() {
    return {
      ...this.tooltipDefaultOptions,
      trigger: 'axis',
      // axisPointer: {
      //   type: 'shadow',
      //   z: 1,
      //   color: '#FEFEFE'
      // },
      // formatter: (params: ({ marker: string, name: string, seriesName: string, data: { value: number } })[]) => {
      //   return (params);
      // }
    };
  }
  get gridDefaultOptions() {
    return {
      ...{
        left: 12,
        right: 15,
        bottom: 15,
        top: 15,
        containLabel: true
      }
    };
  }

  get markLineDefaultOptions() {
    return {
      silent: true,
      symbol: ['none', 'none'],
      lineStyle: {
        color: VisualMarkLineColors[0],
        type: 'dashed'
      },
      emphasis: {
        disabled: true
      },
      label: {
        show: true,
        position: 'end',
        distance: 10,
        color: VisualMarkLineColors[0],
        fontSize: 12,
        overflow: 'truncate',
        formatter: (params) => {
          return params.name + ': ' + params.value;
        }
      },
      /**data: [] 决定线的位置，由具体的图表自己去决定绘制 */
      // data: [
      //   { name: 'Y 轴值为【10】的水平线', yAxis: 10, }
      // ]
    };
  }

  get firstDimensionCategoryAxis() {
    return {
      type: 'category',
      axisTick: {
        show: true
      },
      axisLabel: {
        show: true,
        rotate: this.supportAxisLabelRotate ? this._style?.axisSetting?.labelRotation : undefined,
        fontSize: this._style?.axisSetting?.labelFontSize ?? 12,
      },
      tooltip: this.tooltipDefaultOptions,
      axisLine: this.axisLineDefaultOptions
    }
  }

  get valueAxis() {
    return {
      type: 'value',
      axisTick: {
        show: false
      },
      axisLabel: {
        show: true,
        formatter: (value: number) => {
          if (!value) {
            return 0;
          }
          if (this.showPercentageValue) {
            return `${value}%`;
          }
          return value;
        },
        showMaxLabel: false,
        showMinLabel: false,
        splitLine: {
          showMaxLine: false,
          showMinLine: false,
        },
        fontSize: this._style?.axisSetting?.labelFontSize ?? 12,
      },
      // TODO: 因为图表支持配置最大最小值，为了展示效果，相应的需要动态去计算刻度范围
      interVal: this._style?.axisSetting?.interVal ?? undefined,
      max: (value) => {
        const propertyValues = Object.values(this._displaySetting?.markLine || {}).filter(v => v || v === 0);
        const maxValue = Math.max(...propertyValues, value.max);
        console.log('maxValue', maxValue, propertyValues);
        const _maxValue = new BigNumber(maxValue);
        if (this._style?.axisSetting?.yAxisMax) {
          return this._style.axisSetting.yAxisMax;
        };
        if (this._style?.axisSetting?.yAxisMaxRate) {
          const maxRate = new BigNumber(this._style.axisSetting.yAxisMaxRate).toNumber();
          return _maxValue.multipliedBy(1 + (maxRate / 100) * Math.sign(_maxValue.toNumber())).toNumber();
        };
        return _maxValue.multipliedBy(1 + 0.1 * Math.sign(_maxValue.toNumber())).toNumber();
      },
      min: (value) => {
        const propertyValues = Object.values(this._displaySetting?.markLine || {}).filter(v => v || v === 0);
        const minValue = Math.min(...propertyValues, value.min);
        console.log('minValue', minValue, propertyValues);

        const _minValue = new BigNumber(minValue);
        if (this._style?.axisSetting?.yAxisMin) {
          return this._style.axisSetting.yAxisMin;
        };
        if (this._style?.axisSetting?.yAxisMinRate) {
          const minRate = new BigNumber(this._style.axisSetting.yAxisMinRate).toNumber();
          return _minValue.multipliedBy(1 - (minRate / 100) * Math.sign(_minValue.toNumber())).toNumber();
        };
        return _minValue.multipliedBy(1 - 0.1 * Math.sign(_minValue.toNumber())).toNumber();
      }
    };
  }

  constructor(name: string, attr: Partial<ComponentAttr>) {
    this.name = `Gv${name}`;
  }

  abstract update(el: HTMLElement, dataset: DimensionDataset<unknown>): void;

  getMarkLineColors(type) {
    const colorIndex = type.indexOf('cl') !== -1 ? 1 : 0;
    const defaultColor = VisualMarkLineColors[colorIndex];
    const lineColor = this._style?.markLineColors?.[type];
    return lineColor || defaultColor;
  }

  minStyle(): VisualEChartItemMinStyle {
    return {
      widthPx: 0,
      widthNumber: 0,
      heightPx: 0,
      heightNumber: 0,
      needAdapt: false
    };
  }

  reRender(el?: HTMLElement, dataset?, displaySetting?: IDisplaySetting, style?): void {
    this.trueUpdate(this._el || el, dataset, displaySetting, style);
  }

  trueUpdate(el: HTMLElement, dataset?, displaySetting?: IDisplaySetting, style?): void {
    this.dispose();
    this._el = el;

    if (dataset?.error) {
      this.renderError(el);
      return;
    }

    if (!dataset) {
      this.renderEmpty(el);
      return;
    }
    this.beforeUpdate(el, dataset, displaySetting, style);
    this.update(el, dataset);
  }

  beforeUpdate(el: HTMLElement, dataset?, displaySetting?: IDisplaySetting, style?,): void {
    // const div = this.createChartInitDom(this.minStyle());
    // el.appendChild(div);
    this.chart = echarts.init(el, null, { renderer: 'canvas', });
    this._dataset = dataset;
    this._el = el;
    this._displaySetting = displaySetting;
    this._style = style;
    console.log(this._style, 'style: chart-config===', this._displaySetting, 'displaySetting: chart-config===');
  }

  createChartInitDom(ItemMinStyle: VisualEChartItemMinStyle): HTMLDivElement {
    const div = document.createElement('div');
    div.style.height = '100%';
    div.style.width = '100%';
    div.style.overflow = 'hidden';
    if (ItemMinStyle.needAdapt) {
      let fullWidth = 0;
      let fullHeight = 0;
      let viewWidth = window.innerWidth - 320;
      let viewHeight = window.innerHeight - 146;
      /**
       * widthCost 实际绘图宽度
       * heightCost 实际绘图高度
       */
      const widthCost = ItemMinStyle.widthNumber * ItemMinStyle.widthPx;
      const heightCost = ItemMinStyle.heightNumber * ItemMinStyle.heightPx;
      if (widthCost > 0 && widthCost > viewWidth - fullWidth) {
        div.style.width = `${widthCost + fullWidth}px`;
      }
      if (heightCost > 0 && heightCost > viewHeight - fullHeight) {
        div.style.height = `${heightCost + fullHeight}px`;
      }
      if (widthCost > 0 || heightCost > 0) {
        div.style.flexShrink = '0';
      }
    }
    return div;
  }

  getDataURL(data: EChartsGetDataURLArg = { backgroundColor: '#ffffff' }): string {
    return this.chart && this.chart.getDataURL(data);
  }

  setEchartsOption(options: EChartsOption, notMerge?: boolean, lazyUpdate?: boolean) {
    if (!this.chart) {
      console.warn('[VisualEChart] (setEchartsOption): chart is not initialized');
      return;
    }
    this.chart?.setOption(options, notMerge, lazyUpdate);
  }

  resize(opt = {}): void {
    this.chart && this.chart.resize({ ...opt });
  }

  dispose() {
    this.chart && this.chart!.dispose();
    this.chart = null as any;
    removeChildren(this._el)
    console.log('[VisualEChart] (dispose): chart.dispose()');
  }

  renderEmpty(el: HTMLElement) {
    this.dispose();
    const div = document.createElement('div');
    div.innerHTML = '<image style="width: 72px; height: 72px" src="/assets/images/empty.png"></image><div style="text-align: center;color: #cdcdcd;">暂无数据</div>';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.height = '100%';
    el.appendChild(div);
  }

  renderError(el: HTMLElement) {
    this.dispose();
    const div = document.createElement('div');
    div.innerHTML = '<image style="width: 72px; height: 72px" src="/assets/images/empty.png"></image><div style="text-align: center;color: #cdcdcd;">数据错误</div>';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.height = '100%';
    el.appendChild(div);
  }

  changeVisualWithContainer(el) {
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const option = this.chart.getOption() as any;
    if (!option) {
      return;
    }
    if (!option) {
      return;
    }
    if (!option.grid) {
      option.grid = [{}];
    }
    if ((width < 1028 || height < 600) && option.legend) {
      delete option.legend;
    }
    if (width < 514 && height < 344) {
      delete option.tooltip;
    }
    this.chart.setOption(option);
    this.chart.resize();
  }

  clickHandler!: (event: { data: unknown; }) => void;
  clickable(data?: (data) => void): void {
    if (!this.chart) return;
    if (data) {
      this.chart.off('click', this.clickHandler);
      this.clickHandler = (event) => {
        if (!event.data) {
          return;
        }
        const item = event.data;

        data({ ...item });
      };
      this.chart.on('click', 'series', this.clickHandler);
    } else {
      this.chart.off('click', this.clickHandler);
    }
  }
}