import { isNil, isEmpty } from 'lodash-es';
import VisualEchart, { DimensionDataset, getMarkLineName, getMaxMarkLineNameWidth, VisualColors } from './VisualEchart';
import { IDisplaySetting } from '../type';

export default class VisualLine extends VisualEchart {
  get xAxisTitle() {
    return ''
  }

  get yAxisTitle() {
    return ''
  }

  get xAxis2Title() {
    return ''
  }

  get yAxis2Title() {
    return ''
  }

  showLabel = false
  constructor() {
    super('BasicLine', { w: 500, h: 300 })
  }

  update(el: HTMLElement, dataset: DimensionDataset<unknown>, displaySetting?: IDisplaySetting, style?,): void {
    if (!dataset) {
      this.renderEmpty(el);
      return;
    };
    this._displaySetting = displaySetting || this._displaySetting
    const markLineConfig = this._displaySetting?.markLine ?? {}
    const _markLineConfigKeys = (Object.keys(markLineConfig) ?? []).filter(key => !isNil(markLineConfig[key]))
    const markLineData = _markLineConfigKeys.map(item => {
      return {
        name: getMarkLineName(item),
        yAxis: markLineConfig[item],
        lineStyle: {
          color: this.getMarkLineColors(getMarkLineName(item).toLowerCase()),
        },
        label: {
          color: this.getMarkLineColors(getMarkLineName(item).toLowerCase()),
        }
      }
    })
    const gridRight = !isEmpty(markLineConfig) ? getMaxMarkLineNameWidth(_markLineConfigKeys, markLineConfig) : 50
    const _option = {
      textStyle: this.textStyle,
      grid: {
        ...this.gridDefaultOptions,
        right: gridRight,
      },
      tooltip: {
        ...this.tooltipDefaultOptions,
        trigger: 'axis',
      },
      xAxis: {
        ...this.firstDimensionCategoryAxis,
        data: dataset.xAxisData,
      },
      yAxis: {
        ...this.valueAxis,
        // axisLine: this.axisLineDefaultOptions, // y轴不需要坐标轴线
        // splitLine: this.splitLineDefaultOptions // 坐标分割线
      },
      series: [
        {
          type: 'line',
          smooth: true,
          label: {
            show: this.showLabel,
            position: 'top',
          },
          itemStyle: {
            color: VisualColors[0]
          },
          lineStyle: {
            color: VisualColors[0]
          },
          tooltip: {
            trigger: 'item',
          },
          markLine: {
            ...this.markLineDefaultOptions,
            data: markLineData
          },
          data: dataset.seriesData,
        },
      ]
    }
    this.chart.setOption(_option)
  }

  todo() { }
}