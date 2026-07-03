export enum SEARCH_SEVICE {
  /** 等于 */
  EQ = 'eq',
  /** 等于(忽略大小写) */
  IEQ = 'iEq',
  /** 不等于 */
  NE = 'ne',
  /** 不等于(忽略大小写) */
  INE = 'ine',
  /** 大于 */
  GT = 'gt',
  /** 大于等于  */
  GE = 'ge',
  /** 小于  */
  LT = 'lt',
  /** 小于等于 */
  LE = 'le',
  /** 为空 */
  ISNULL = 'isNull',
  /** 不为空 */
  ISNOTNULL = 'isNotNull',
  /** 匹配 */
  LIKE = 'like',
  /** 匹配(忽略大小写)  */
  ILIKE = 'iLike',
  /** 不匹配 */
  NOTLIKE = 'notLike',
  /** 不匹配(忽略大小写)  */
  NOTILIKE = 'iNotLike',
  /** 左匹配 */
  LEFTLIKE = 'leftLike',
  /** 左匹配(忽略大小写) */
  ILEFTLIKE = 'iLeftLike',
  /** 右匹配 */
  RIGHTLIKE = 'rightLike',
  /** 右匹配(忽略大小写) */
  IRIGHTLIKE = 'iRightLike',
  /** 在集合中 */
  IN = 'in',
  /** 不在集合中 */
  NOTIN = 'notIn',
  /** 包含任意 */
  CONTAINANY = 'containAny',
  /** 包含全部 */
  CONTAINALL = 'containAll',
  /** 闭区间 */
  RANGE = 'range',
  /** 开区间 */
  ORANGE = 'oRange',
  /** 左开右闭 */
  LORANGE = 'loRange',
  /**左闭右开  */
  RORANGE = 'roRange',
  /**rdo 在集合中*/
  VERSIONIN = 'versionIn',
  /**rdo 不在集合中*/
  VERSIONNOTIN = 'versionNotIn',
  /**rdo 等于*/
  VERSIONEQ = 'versionEq',
  /**rdo 不等于*/
  VERSIONNE = 'versionNe',
  //ignoreCase
}

// 非单选算子
export const notSingleArr = [
  SEARCH_SEVICE.IN,
  SEARCH_SEVICE.NOTIN,
  SEARCH_SEVICE.CONTAINANY,
  SEARCH_SEVICE.CONTAINALL,
  SEARCH_SEVICE.VERSIONIN,
  SEARCH_SEVICE.VERSIONNOTIN,
];

/**设计页面对齐方式 */
export enum AGLINE_ENUMS {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  BETWEEN = 'between',
}

export const presetColor = [
  '#DBDBDB',
  '#FFE4E4',
  '#D1D1D1',
  '#838383',
  '#838383',
  '#FFEECB',
  '#D8E3FF',
  '#FF8888',
  '#FF8888',
  '#0DAA9C',
  '#3370FF',
];
export enum ButtonOpeEnum {
  /**单行 */
  SINGLELINE = 0,
  /**头部 右边*/
  HEAD = 1,
  /**批量 左边 */
  BATCH = 2,
  /**单行RDO */
  SINGLELINE_RDO = 3,
}

/**rdo 单行按钮类型 */
export enum RdoButtonOpeEnum {
  /**父版本 */
  parentVersion = 0,
  /**子版本*/
  childVersion = 1,
}
