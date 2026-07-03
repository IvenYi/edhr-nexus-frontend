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
 * 图表名称类型
 */
export enum EChartName {
  // 均值图相关
  Ave = 'ave',
  // 极差图相关
  Range = 'range',
  // CPK分析图相关
  CpkAnalyze = 'cpkAnalyze',
  // 样本运行图相关
  DemoRunning = 'demoRunning',
  // 均值运行图相关
  AveRunning = 'aveRunning',
  // 正态检验相关
  NormTest = 'normTest',
  // CPK趋势图相关
  CpkTrend = 'cpkTrend',
  // 标准差图相关
  Sd = 'sd',
  // 单值图相关
  SingleValue = 'singleValue',
  // 移动极差图相关
  MoveRange = 'moveRange',
  // 中位数图相关
  Median = 'median',
  // 不合格率图相关
  UnqualifiedRate = 'unqualifiedRate',
  // 柏拉图相关
  Plato = 'plato',
  // 单位产品不合格率图相关
  UnitUnqualifiedRate = 'unitUnqualifiedRate',
  // 不合格品数图相关
  UnqualifiedNum = 'unqualifiedNum',
  // 缺陷数图相关
  DefectNum = 'defectNum',
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
  LINE_STEP_LINE = 'line-step-line',
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

/** 视图使用场景 */
export enum EAnalyticsViewScene {
  // 方案预览（创建）
  PLAN_PREVIEW = 'plan-preview',
  // 方案查看
  PLAN_DETAIL = 'plan-detail',
  // 判异处理
  OUT_OF_CONTROL = 'out-of-control',
}