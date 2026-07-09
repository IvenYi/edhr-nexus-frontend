import type { EChartsOption, LegendComponentOption, } from "echarts";
import { LegendLocations, IntervalTypes, BarRoundedTypes, NullTexts, AggregationTypes } from "./options";

type AddExtra<T, K> = T extends any[] ? (T[number] & K)[] : T & K;

export type ExtendedLegendComponentOption = LegendComponentOption & {
  _position_: (typeof LegendLocations)[number]["id"];
};

export type ExtendedSeries = AddExtra<
  EChartsOption["series"],
  {
    itemStyle?: {
      _borderRadiusType_: (typeof BarRoundedTypes)[number]["id"];
      _borderRadiusValue_: number;
    };
    tooltip?: {
      _autoLoop_: {
        enabled: boolean;
        interval: number;
      };
    };
  }
>;

export type ExtendedXAxis = AddExtra<
  EChartsOption["xAxis"],
  {
    _nameShow_: boolean;
    axisLabel: {
      _intervalType_: (typeof IntervalTypes)[number]["id"];
    };
  }
>;

export type ExtendedYAxis = AddExtra<
  EChartsOption["yAxis"],
  {
    _nameShow_: boolean;
    _minAuto_: boolean;
    _maxAuto_: boolean;
    _userInterval_: boolean;
    _userIntervalBy_: "splitNumber" | "interval";
  }
>;

export type ExtendedEChartsOption = Omit<EChartsOption, "legend" | "xAxis" | "yAxis"> & {
  legend?: ExtendedLegendComponentOption | ExtendedLegendComponentOption[];
  xAxis?: ExtendedXAxis;
  yAxis?: ExtendedYAxis;
};

/**
 * 维度字段
 */
export interface DimensionField {
  field: string;
}

/**
 * 指标字段
 */
export interface MetricField {
  field: string;
  alias?: string;
  nullText?: (typeof NullTexts)[number]["id"];
  aggregation: (typeof AggregationTypes)[number]["id"];
}

export interface ColorProp {
  field?: string;
}

export interface LabelProp {
  field?: string;
}

export interface TooltipProp {
  field?: string;
}

export interface ComponentAttr {
  x: number;
  y: number;
  w: number;
  h: number;
  deg: number;
  opacity: number;
  filpV: boolean;
  filpH: boolean;
}

export interface IDisplaySetting {
  markLine: Record<string, number>;
}

export interface IChartData {
  xAxis: string | number[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export interface IStyle {
  axisSetting: Record<string, string>;
  markLineColors: Record<string, string>;
}


