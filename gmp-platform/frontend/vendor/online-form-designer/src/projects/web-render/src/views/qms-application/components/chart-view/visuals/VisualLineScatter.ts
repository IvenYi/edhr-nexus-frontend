import VisualEchart, { DimensionDataset, getMarkLineName, getMaxMarkLineNameWidth, VisualColors } from "./VisualEchart"
import { isNil } from 'lodash-es';
import { isEmpty } from '/@/utils/is';
import { IDisplaySetting } from "../type";
export default class VisualLineScatter extends VisualEchart {
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
  styleConfig

  constructor() {
    super('BasicLineScatter', { w: 500, h: 300 })
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
    console.log('Scatter Data:', dataset, gridRight);
    const { xAxisData, seriesData } = dataset;

    const option = {
      textStyle: this.textStyle,
      grid: {
        ...this.gridDefaultOptions,
        right: gridRight
      },
      tooltip: {
        ...this.tooltipDefaultOptions,
        trigger: 'axis'
      },
      yAxis: {
        ...this.valueAxis,
      },
      xAxis: {
        ...this.firstDimensionCategoryAxis,
        type: 'value',
        scale: true,
        data: xAxisData,
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 10,
          data: seriesData?.scatter,
          itemStyle: {
            color: VisualColors[0]
          },
        },
        {
          type: 'line',
          symbolSize: 5,
          data: seriesData?.line,
          itemStyle: {
            color: VisualColors[1]
          },
          markLine: {
            ...this.markLineDefaultOptions,
            data: markLineData
          },
          showSymbol: false,
          // yAxisIndex: 1
        }
      ]
    }
    this.setEchartsOption(option as any);
  }
}