/** 计量型数据字段维度 */

export const sampleColumns = [
  {
    title: '序号',
    dataIndex: 'sort',
    key: 'sort',
    align: 'center',
  },
  {
    title: '样本数据',
    dataIndex: 'sample_data_',
    key: 'sample_data_',
    align: 'center',
  },
  {
    title: '批次号',
    dataIndex: 'containers_',
    key: 'containers_',
    align: 'center',
  },
  {
    title: '平均值',
    dataIndex: 'avg_',
    key: 'avg_',
    align: 'center',
  },
  {
    title: '极差值',
    dataIndex: 'range_',
    key: 'range_',
    align: 'center',
  },
  {
    title: '标准差',
    dataIndex: 'sigma_',
    key: 'sigma_',
    align: 'center',
  },
  {
    title: '最大值',
    dataIndex: 'max_',
    key: 'max_',
    align: 'center',
  },
  {
    title: '最小值',
    dataIndex: 'min_',
    key: 'min_',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status_',
    key: 'status_',
    align: 'center',
  },
  {
    title: '判异规则',
    dataIndex: 'out_of_control_rule_',
    key: 'out_of_control_rule_',
    align: 'center',
  },
];

// 关键指标
export const keyIndicatorColumns = [
  {
    title: '数据摘要',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  },
  {
    title: '值',
    dataIndex: 'value',
    key: 'value',
    align: 'center',
  },
];

// 关键指标字段
export const keyIndicatorFields = [
  'total_',
  'cpk_',
  'ppk_',
  'sigma_',
  'max_',
  'min_',
  'cl_',
  'cp_',
  'pp_',
  // "avg_",
  // "cl_",
  // "cp_",
  // "cpl_",
  // "cpm_",
  // "cpu_",
  // "ppl_",
  // "ppu_",
  // "sigma3_above_",
  // "sigma3_below_",
  // "sigma_",
  // "sigma_between_",
  // "sigma_within_",
  // "sigma_within_between_",
  // "sigmas_",
  // "target_",
];

export const outOfControlFields = [
  'avg_',
  'range_', // 极差
  'sigma_', //标准差
  'max_',
  'min_',
];

// CPK: 统计值
export const statisticsFields = ['total_', 'avg_', 'max_', 'min_'];

// CPK: 常量
export const constantFields = [
  // "subgroup_size_",
  'usl_',
  'target_',
  'lsl_',
];

// CPK: 计算值
export const calculatedFields = [
  'sigma_between_',
  'sigma_within_',
  'sigma_within_between_',
  'sigma_',
  'sigma3_above_',
  'sigma3_below_',
];

// CPK: 工序能力（组内）
export const processCapabilityFields = ['cpk_', 'cp_', 'cpl_', 'cpu_', 'cpm_'];

// CPK: 工序能力（整体）
export const processCapabilityOverallFields = ['ppk_', 'pp_', 'ppl_', 'ppu_'];
