import { EControlChart, EChartType } from "../enums/qms.type"
export const chartView = {
  [EControlChart.X_BAR_R]: {
    "control": [
      {
        name: 'ave',
        type: EChartType.LINE, // 均值图
        indicator: ['ave', 'index'],
      },
      {
        name: 'range',
        type: EChartType.LINE, // 极差图
        indicator: ['range', 'index'],
      }
    ],
    "cpkAnalyze": [{
      name: 'cpkAnalyze',
      type: EChartType.MUL_LINE_BAR, // CPK分析图
      indicator: ['sample', 'index'],
    }],
    "demoRunning": [{
      name: 'demoRunning',
      type: EChartType.LINE, // 样本运行图
      indicator: ['sample', 'index'],
    }],
    "aveRunning": [{
      name: 'aveRunning',
      type: EChartType.LINE_SCATTER, // 均值运行图
      indicator: ['sample', 'ave', 'index'],
    }],
    "normTest": [{
      name: 'normTest',
      type: EChartType.LINE_SCATTER, // 正态检验
      indicator: ['sample', 'ave', 'index'],
    }],
    "cpkTrend": [{
      name: 'cpkTrend',
      type: EChartType.LINE, // CPK趋势图
      indicator: ['cpk', 'index'],
    }]
  },
  [EControlChart.XBar_S]: {
    "control": [
      {
        name: 'ave',
        type: EChartType.LINE, // 均值图
        indicator: ['ave', 'index'],
      },
      {
        name: 'sd',
        type: EChartType.LINE, // 标准差图
        indicator: ['sd', 'index'],
      }
    ]
  },

  [EControlChart.I_MR]: {
    "control": [
      {
        name: 'singleValue',
        type: EChartType.LINE, // 单值图
        indicator: [],
      },
      {
        name: 'moveRange',
        type: EChartType.LINE, // 移动极差图
        indicator: [],
      }
    ]
  },

  [EControlChart.M_R]: {
    "control": [
      {
        name: 'median',
        type: EChartType.LINE, // 中位数图
        indicator: [],
      },
      {
        name: 'range',
        type: EChartType.LINE, // 极差图
        indicator: [],
      }
    ]
  },

  [EControlChart.P]: {
    "control": [
      {
        name: 'unqualifiedRate',
        type: EChartType.LINE, // 不合格率图
        indicator: [],
      }
    ],
    "plato": [
      {
        name: 'plato',
        type: EChartType.LINE, // 柏拉图
        indicator: [],
      }
    ]
  },

  [EControlChart.NP]: {
    "control": [
      {
        name: 'unitUnqualifiedRate',
        type: EChartType.LINE, // 单位产品不合格率图
        indicator: [],
      }
    ],
    "plato": [
      {
        name: 'plato',
        type: EChartType.LINE_BAR, // 柏拉图
        indicator: [],
      }
    ]
  },

  [EControlChart.C]: {
    "control": [
      {
        name: 'unqualifiedNum',
        type: EChartType.LINE, // 不合格品数图
        indicator: [],
      }
    ],
    "plato": []
  },

  [EControlChart.U]: {
    "control": [
      {
        name: 'defectNum',
        type: EChartType.LINE, // 缺陷数图
        indicator: [],
      }
    ],
    "plato": []
  },
}