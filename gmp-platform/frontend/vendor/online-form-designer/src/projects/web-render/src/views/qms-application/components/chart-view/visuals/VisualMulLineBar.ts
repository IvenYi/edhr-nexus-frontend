import { isNil, isEmpty } from 'lodash-es';
import VisualEchart, { DimensionDataset, VisualColors, getMarkLineName } from "./VisualEchart"
import { IDisplaySetting } from '../type';
import BigNumber from 'bignumber.js';
export default class VisualMulLineBar extends VisualEchart {
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
    super('BasicMulLineBar', { w: 500, h: 300 })
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
        xAxis: markLineConfig[item],
        lineStyle: {
          color: this.getMarkLineColors(getMarkLineName(item).toLowerCase()),
        },
        label: {
          color: this.getMarkLineColors(getMarkLineName(item).toLowerCase()),
        }
      }
    })
    const { xAxisData, seriesData, originData } = dataset
    const max = new BigNumber(originData[originData.length - 1]?.end_)
    const min = new BigNumber(originData[0]?.start_)
    const interval = max.minus(min).div(originData?.length ?? 16).toNumber()
    const _option = {
      textStyle: this.textStyle,
      grid: {
        ...this.gridDefaultOptions,
        top: 50
      },
      tooltip: {
        ...this.tooltipDefaultOptions,
        trigger: 'axis',
        formatter(params) {
          let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">${params?.[0]?.name}</div>`
          params.forEach(item => {
            const dataIndex = item.dataIndex;
            if (dataIndex !== 8 && item.seriesType === 'line') {
              return;
            }
            temp += `<div>
              <div style="margin-bottom: 4px;"><span style="font-weight: bold;">${item.marker} ${item.seriesName}：${item.value?.[1]}</div>
            </div>`
          })
          return temp
        }
      },
      xAxis: {
        type: 'value',
        min: originData[0].start_,
        max: originData[originData.length - 1].end_,
        data: xAxisData,
        scale: true,
        splitNumber: originData?.length ?? 16,
        interval: interval,
        axisLabel: {
          show: true,
          rotate: this.supportAxisLabelRotate ? this._style?.axisSetting?.labelRotation : undefined,
          fontSize: this._style?.axisSetting?.labelFontSize ?? 12,
        },
      },
      yAxis: [
        {
          ...this.valueAxis,
          max: (value) => {
            const _maxValue = new BigNumber(value.max);
            if (this._style?.axisSetting?.yAxisMaxRate) {
              const maxRate = new BigNumber(this._style.axisSetting.yAxisMaxRate).toNumber();
              return _maxValue.multipliedBy(1 + (maxRate / 100) * Math.sign(_maxValue.toNumber())).toNumber();
            };
            return undefined;
          },
          min: (value) => {
            const _minValue = new BigNumber(value.min);
            if (this._style?.axisSetting?.yAxisMinRate) {
              const minRate = new BigNumber(this._style.axisSetting.yAxisMinRate).toNumber();
              return _minValue.multipliedBy(1 - (minRate / 100) * Math.sign(_minValue.toNumber())).toNumber();
            };
            return undefined;
          },
          axisLabel: {
            showMaxLabel: true,
            showMinLabel: true,
            show: true,
            rotate: this.supportAxisLabelRotate ? this._style?.axisSetting?.labelRotation : undefined,
            fontSize: this._style?.axisSetting?.labelFontSize ?? 12,
          }
        },
        {
          ...this.valueAxis,
          max: (value) => {
            const _maxValue = new BigNumber(value.max);
            if (this._style?.axisSetting?.yAxisMaxRate) {
              const maxRate = new BigNumber(this._style.axisSetting.yAxisMaxRate).toNumber();
              return _maxValue.multipliedBy(1 + (maxRate / 100) * Math.sign(_maxValue.toNumber())).toNumber();
            };
            return undefined;
          },
          min: (value) => {
            const _minValue = new BigNumber(value.min);
            if (this._style?.axisSetting?.yAxisMinRate) {
              const minRate = new BigNumber(this._style.axisSetting.yAxisMinRate).toNumber();
              return _minValue.multipliedBy(1 - (minRate / 100) * Math.sign(_minValue.toNumber())).toNumber();
            };
            return undefined;
          },
          axisLabel: {
            showMaxLabel: true,
            showMinLabel: true,
            rotate: this.supportAxisLabelRotate ? this._style?.axisSetting?.labelRotation : undefined,
            fontSize: this._style?.axisSetting?.labelFontSize ?? 12,
          },
        }
      ],
      series: [
        {
          name: '频数',
          type: 'bar',
          data: seriesData.barData,
          barWidth: '80%',
          itemStyle: {
            color: VisualColors[0],
          },
          markLine: {
            ...this.markLineDefaultOptions,
            data: markLineData
          },
        },
        {
          name: 'Cpk',
          type: 'line',
          smooth: true,
          showSymbol: false,
          yAxisIndex: 1,
          itemStyle: {
            color: VisualColors[2]
          },
          data: seriesData.line1Data
        },
        {
          name: 'Ppk',
          type: 'line',
          smooth: true,
          showSymbol: false,
          yAxisIndex: 1,
          itemStyle: {
            color: VisualColors[1]
          },
          data: seriesData.line2Data
        }
      ]
    }
    this.chart.setOption(_option as any);
  }
}