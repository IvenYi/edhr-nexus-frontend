import { useStorage } from '@vueuse/core';
import { EControlChart, EChartType, EChartName } from '../enums/index';
import { uniq, size } from 'lodash-es';
import { VisualColors } from '../components/chart-view/visuals/VisualEchart';
import { message as Message } from 'ant-design-vue';

export const chartConfigs = {
  [EControlChart.X_BAR_R]: {
    control: [
      {
        name: EChartName.Ave,
        type: EChartType.LINE,
        indicator: ['avg_', 'index'],
        property: ['usl_', 'lsl_', 'ucl_', 'lcl_', 'target_', 'cl_'],
        loadChartData: (data = [] as any[]) => {
          return {
            xAxisData: data.map((it, index) => index + 1),
            seriesData: data.map((item) => {
              return {
                value: item.avg_,
                itemStyle: {
                  color: item.status_ === 'out_of_control' ? 'red' : VisualColors[0],
                },
              };
            }),
            originData: data,
          };
        },
        specifyOptions(option) {
          return {
            tooltip: {
              formatter: (params) => {
                const current = option?.[params.dataIndex];
                const rulesEnums = useStorage('outOfRulesEnums', []) as any;
                const rules = rulesEnums.value.filter((it) =>
                  current['out_of_control_rule_']?.includes?.(it?.value),
                );
                const rulesNValues = current.n_?.split?.(',');
                const ruleDict = (rules ?? []).map((it, idx) => {
                  return `${idx + 1}. ${it?.label}`.replace('N', rulesNValues?.[idx] ?? 'N');
                });
                const outRules = ruleDict.join('<br />');
                let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${current?.sample_data_}】</div>`;
                temp += `
                  ${
                    current?.containers_
                      ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                      : ''
                  }
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">平均值：</span>${
                    params.value
                  }</div>
                  ${
                    outRules
                      ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">判异规则：</span>${outRules}</div>`
                      : ''
                  } 
                  ${
                    current.out_of_control_index_
                      ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">发生点位：</span>${current.out_of_control_index_}</div>`
                      : ''
                  }
                `;
                return temp;
              },
            },
          };
        },
      },
      {
        name: EChartName.Range,
        type: EChartType.LINE,
        indicator: ['range_', 'index'],
        property: ['r_ucl_', 'r_lcl_', 'r_cl_', 'r_target_'],
        loadChartData: (data = [] as any[]) => {
          return {
            xAxisData: data.map((it, index) => index + 1),
            seriesData: data.map((item) => item.range_),
          };
        },
        specifyOptions(option) {
          return {
            tooltip: {
              formatter: (params) => {
                const current = option?.[params.dataIndex];
                let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${current?.sample_data_}】</div>`;
                temp += `
                ${
                  current?.containers_
                    ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                    : ''
                }
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">极差值：</span>${
                    params.value
                  }</div>
                `;
                return temp;
              },
            },
          };
        },
      },
    ],
    cpkAnalyze: [
      {
        name: EChartName.CpkAnalyze,
        type: EChartType.MUL_LINE_BAR,
        indicator: ['cpk', 'index'],
        property: ['usl_', 'lsl_', 'target_'],
        loadChartData: (computeResult) => {
          const { cpk_bins_: data, ...others } = computeResult;
          // cpk分析图默认分成16等分，当后端数据不能等分时按产品需求展示无数据样式
          if (data && size(data) !== 16) {
            Message.error('最大值与最小值相等，无法计算');
            return null;
          }
          const formSeriesData = (data = [] as any[], indicator = 'frequency_') => {
            return data.map((item) => {
              const centerPoint = (item.start_ + item.end_) / 2;
              return {
                value: [centerPoint, item[indicator]],
                start: item.start_,
                end: item.end_,
                name: `区间范围【${item.start_} ~ ${item.end_}】`,
              };
            });
          };
          const barData = formSeriesData(data, 'frequency_');
          const line1Data = formSeriesData(data, 'cpk_');
          const line2Data = formSeriesData(data, 'ppk_');
          const addXSite = data?.[7].end_;
          line1Data.splice(8, 0, [addXSite, others?.cpk_]);
          line2Data.splice(8, 0, [addXSite, others?.ppk_]);
          const xAxisData = [...data.map((it, index) => it.start_), data[data.length - 1].end_];
          return {
            originData: data,
            xAxisData: xAxisData,
            seriesData: {
              barData,
              line1Data,
              line2Data,
            },
          };
        },
      },
    ],
    demoRunning: [
      {
        name: EChartName.DemoRunning,
        type: EChartType.LINE,
        indicator: ['sample_data_', 'index'],
        property: ['usl_', 'target_', 'lsl_'],
        loadChartData: (data: Array<{ sample_data_: string }> = []) => {
          const seriesData = data.reduce((acc, cur) => {
            const sampleData = cur.sample_data_.split(',');
            return acc.concat(sampleData);
          }, []);
          const xAxisData = [] as number[];
          data?.forEach?.((item, index) => {
            const len = item.sample_data_.split(',').length;
            for (let i = 0; i < len; i++) {
              xAxisData.push(index + 1);
            }
          });
          return {
            xAxisData,
            seriesData,
          };
        },
        specifyOptions(option) {
          return {
            tooltip: {
              formatter: (params) => {
                const current = option?.[Number(params.name) - 1];
                let temp = '';
                temp += `
                <div style="margin-bottom: 4px;"><span style="font-weight: bold;">组数：</span>${
                  params.name
                }</div>
                <div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${
                  current?.sample_data_
                }】</div>
                ${
                  current?.containers_
                    ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                    : ''
                }
                <div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本值：</span>${
                  params.value
                }</div>
              `;
                return temp;
              },
            },
          };
        },
      },
    ],
    aveRunning: [
      {
        name: EChartName.AveRunning,
        type: EChartType.LINE_SCATTER,
        indicator: ['sample_data_', 'avg_', 'index'],
        property: ['usl_', 'target_', 'lsl_'],
        loadChartData: (
          data: Array<{ sample_data_: string; avg_: string; index: number }> = [],
        ) => {
          const xAxisData = data.map((it, index) => index + 1);
          const scatterData = data.reduce?.((acc, cur, index) => {
            const sampleData = cur.sample_data_.split(',');
            const sub = sampleData.map((it, i) => [index + 1, it]);
            return [...acc, ...sub];
          }, []);
          const lineData = data.map((it, i) => {
            return [i + 1, it.avg_];
          });
          return {
            xAxisData,
            seriesData: {
              line: lineData,
              scatter: scatterData,
            },
          };
        },
        specifyOptions(option) {
          return {
            tooltip: {
              formatter: (params) => {
                const dataIndex = params?.[0]?.axisValue - 1;
                const current = option?.[dataIndex];
                let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${current?.sample_data_}】</div>`;
                temp += `
                ${
                  current?.containers_
                    ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                    : ''
                }
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">均值：</span>${
                    current.avg_
                  }</div>
                `;
                return temp;
              },
            },
          };
        },
      },
    ],
    normTest: [
      {
        name: EChartName.NormTest,
        type: EChartType.LINE_SCATTER,
        indicator: ['sample_data_', 'avg_', 'index'],
        property: [],
        loadChartData: (
          data = { normal_distribution_points_: [], normal_distribution_line_points_: [] } as any,
        ) => {
          const { normal_distribution_points_, normal_distribution_line_points_ } = data;
          const _xAxisData = uniq(normal_distribution_points_.map((it) => it.x_));
          const _scatterData = normal_distribution_points_.map((it) => [it.x_, it.y_]);
          const _lineData = normal_distribution_line_points_.map((it) => [it.x_, it.normal_line_]);
          return {
            xAxisData: _xAxisData,
            seriesData: {
              line: _lineData,
              scatter: _scatterData,
            },
          };
        },
        specifyOptions(option) {
          return {
            yAxis: {
              min: 0,
              max: 100,
              axisLabel: {
                showMaxLabel: true,
                showMinLabel: true,
                formatter: (val) => val + '%',
              },
            },
            tooltip: {
              trigger: 'item',
              borderWidth: 0,
              formatter: (params) => {
                let temp = '';
                temp += `
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">值：</span>${params?.value?.[0]}</div>
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">概率：</span>${params?.value?.[1]}%</div>
                `;
                return temp;
              },
            },
          };
        },
      },
    ],
    cpkTrend: [
      {
        name: EChartName.CpkTrend,
        type: EChartType.LINE,
        indicator: ['cpk_', 'index'],
        property: [],
        loadChartData: (data = [] as any[]) => {
          return {
            xAxisData: data.map((it, index) => index + 1),
            seriesData: data.map((item) => item.cpk_),
          };
        },
        specifyOptions(option) {
          return {
            yAxis: {
              min: undefined,
              max: undefined,
            },
            tooltip: {
              formatter: (params) => {
                const current = option?.[params.dataIndex];
                let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${current?.sample_data_}】</div>`;
                temp += `
                ${
                  current?.containers_
                    ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                    : ''
                }
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">CPK：</span>${
                    params.value
                  }</div>
                `;
                return temp;
              },
            },
          };
        },
      },
    ],
  },
  [EControlChart.XBar_S]: {
    control: [
      {
        name: EChartName.Ave,
        type: EChartType.LINE,
        indicator: ['avg_', 'index'],
        property: ['usl_', 'lsl_', 'ucl_', 'lcl_', 'target_', 'cl_'],
        loadChartData: (data = [] as any[]) => {
          return {
            xAxisData: data.map((it, index) => index + 1),
            seriesData: data.map((item) => {
              return {
                value: item.avg_,
                itemStyle: {
                  color: item.status_ === 'out_of_control' ? 'red' : VisualColors[0],
                },
              };
            }),
            originData: data,
          };
        },
        specifyOptions(option) {
          return {
            tooltip: {
              formatter: (params) => {
                const current = option?.[params.dataIndex];
                const rulesEnums = useStorage('outOfRulesEnums', []) as any;
                const rules = rulesEnums.value.filter((it) =>
                  current['out_of_control_rule_']?.includes?.(it?.value),
                );
                const rulesNValues = current.n_?.split?.(',');
                const ruleDict = (rules ?? []).map((it, idx) => {
                  return `${idx + 1}. ${it?.label}`.replace('N', rulesNValues?.[idx] ?? 'N');
                });
                const outRules = ruleDict.join('<br />');
                let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${current?.sample_data_}】</div>`;
                temp += `
                ${
                  current?.containers_
                    ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                    : ''
                }
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">平均值：</span>${
                    params.value
                  }</div>
                  ${
                    outRules
                      ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">判异规则：</span>${outRules}</div>`
                      : ''
                  } 
                  ${
                    current.out_of_control_index_
                      ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">发生点位：</span>${current.out_of_control_index_}</div>`
                      : ''
                  }
                `;
                return temp;
              },
            },
          };
        },
      },
      {
        name: EChartName.Sd,
        type: EChartType.LINE,
        indicator: ['sigma_', 'index'],
        property: ['r_ucl_', 'r_lcl_', 'r_cl_', 'r_target_'],
        loadChartData: (data = [] as any[]) => {
          return {
            xAxisData: data.map((it, index) => index + 1),
            seriesData: data.map((item) => item.sigma_),
          };
        },
        specifyOptions(option) {
          return {
            tooltip: {
              formatter: (params) => {
                const current = option?.[params.dataIndex];
                let temp = `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">样本数据：</span>【${current?.sample_data_}】</div>`;
                temp += `
                ${
                  current?.containers_
                    ? `<div style="margin-bottom: 4px;"><span style="font-weight: bold;">批次号：</span>【${current.containers_}】</div>`
                    : ''
                }
                  <div style="margin-bottom: 4px;"><span style="font-weight: bold;">极差值：</span>${
                    params.value
                  }</div>
                `;
                return temp;
              },
            },
          };
        },
      },
    ],
  },

  [EControlChart.I_MR]: {
    control: [
      {
        name: EChartName.SingleValue,
        type: EChartType.LINE,
        indicator: [],
      },
      {
        name: EChartName.MoveRange,
        type: EChartType.LINE,
        indicator: [],
      },
    ],
  },

  [EControlChart.M_R]: {
    control: [
      {
        name: EChartName.Median,
        type: EChartType.LINE,
        indicator: [],
      },
      {
        name: EChartName.Range,
        type: EChartType.LINE,
        indicator: [],
      },
    ],
  },

  [EControlChart.P]: {
    control: [
      {
        name: EChartName.UnqualifiedRate,
        type: EChartType.LINE_STEP_LINE,
        indicator: [],
      },
    ],
    plato: [
      {
        name: EChartName.Plato,
        type: EChartType.LINE,
        indicator: [],
      },
    ],
  },

  [EControlChart.NP]: {
    control: [
      {
        name: EChartName.UnitUnqualifiedRate,
        type: EChartType.LINE,
        indicator: [],
      },
    ],
    plato: [
      {
        name: EChartName.Plato,
        type: EChartType.LINE_BAR,
        indicator: [],
      },
    ],
  },

  [EControlChart.C]: {
    control: [
      {
        name: EChartName.UnqualifiedNum,
        type: EChartType.LINE,
        indicator: [],
      },
    ],
    plato: [],
  },

  [EControlChart.U]: {
    control: [
      {
        name: EChartName.DefectNum,
        type: EChartType.LINE,
        indicator: [],
      },
    ],
    plato: [],
  },
};
