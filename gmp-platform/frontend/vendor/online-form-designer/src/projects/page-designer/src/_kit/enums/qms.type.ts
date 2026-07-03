export enum EMonitorType {
  /**
   * 实时监控
   */
  REALTIME = 'realtime_',
  /**
   * 范围监控
   */
  RANGE = 'realtime_',
}

export enum EAnalyzeType {
  /**
   * 计量型
   */
  COUNT = 'count',
  /** 
   * 计数型
   */
  MEASURE = 'measure',
}


// 控制图类型
export enum EControlChart {
  X_BAR_R = 'xbar_r',
  XBar_S = 'xbar_s',
  I_MR = 'i_mr',
  M_R = 'm_r',
  P = 'p',
  NP = 'np',
  C = 'c',
  U = 'u',
}

/**
 * 图表类型
 */
export enum EChartType {
  LINE = 'line',
  LINE_BAR = 'line-bar',
  LINE_SCATTER = 'line-scatter',
  MUL_LINE_BAR = 'mul-line-bar',
  LIN_BAR = 'lin-bar',
}

/** 
 * 关键指标
 */
export enum EKeyIndicator {
  /**
   * 累计
   */
  TOTAL = 'total',
  // ...
}

/** 异常规则 */
export enum EAbnormalRule {

}