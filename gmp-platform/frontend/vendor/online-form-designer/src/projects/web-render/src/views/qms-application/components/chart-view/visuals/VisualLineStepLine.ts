import VisualEchart, { DimensionDataset, VisualColors, } from "./VisualEchart"
import { isEmpty } from 'lodash-es';
import { IDisplaySetting } from '../type';


export default class VisualLineStepLine extends VisualEchart {
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
  constructor() {
    super('BasicLineStepLine', { w: 500, h: 300 })
  }

  update(el: HTMLElement, dataset: DimensionDataset<unknown>,  displaySetting?: IDisplaySetting, style?,): void {
    if (!isEmpty(dataset)) {
      this.renderEmpty(el)
      return
    }
    const _option = {
      textStyle: this.textStyle,
      grid: {
        ...this.gridDefaultOptions,
        top: 50
      },
      tooltip: {
        ...this.tooltipDefaultOptions,
        trigger: 'axis',
      },
      xAxis: {
        ...this.firstDimensionCategoryAxis,
        data: dataset?.[0] || [1, 2, 3, 4, 5, 6, 7], // 测试数据
      },
      yAxis: [
        {
          ...this.valueAxis
        },
        {
          ...this.valueAxis
        }
      ],
      series: [
        {
          name: 'Line',
          type: 'line',
          data: dataset?.[0] || [120, 132, 101, 134, 90, 230, 210], // 测试数据
          itemStyle: {
            color: VisualColors[0]
          },
          markLine: {
            ...this.markLineDefaultOptions,
          }
        },
        {
          name: 'StepLine1',
          type: 'line',
          step: 'end',
          itemStyle: {
            color: VisualColors[2],
            type: 'dashed'
          },
          lineStyle: {
            color: VisualColors[2],
            type: 'dashed'
          },
          data: dataset?.[1] || [220, 182, 191, 234, 290, 330, 310] // 测试数据
        },
        {
          name: 'StepLine2',
          type: 'line',
          step: 'start',
          itemStyle: {
            color: VisualColors[2],
            type: 'solid'
          },
          lineStyle: {
            color: VisualColors[2],
            type: 'solid'
          },
          data: dataset?.[1] || [120, 100, 131, 134, 190, 130, 210] // 测试数据
        },
      ]
    }
    this.chart.setOption(_option as any);
  }
}