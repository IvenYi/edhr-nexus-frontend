export enum TypeEnum {
  FIXED = 'fixed',
  PLACEHOLDER = 'placeholder',
  DATE = 'date',
  LETTER = 'letter',
  INCREASE = 'increase',
}

export enum PatternEnum {
  yyyyMMdd = 'sys.model.yyyyMMdd',
  yyyyMM = 'sys.model.yyyyMM',
  MMddyyyy = 'sys.model.MMddyyyy',
  ddMMyyyy = 'sys.model.ddMMyyyy',
  MMyyyy = 'sys.model.MMyyyy',
  yyyywk = 'sys.model.yyyywk',
  yyyyMMddHH = 'sys.model.yyyyMMddHH',
  yyyyMMddHHmm = 'sys.model.yyyyMMddHHmm',
  yyyyMMddHHmmss = 'sys.model.yyyyMMddHHmmss',
  CUSTOM = 'sys.customize',
}

export enum ResetConditionEnum {
  YEAR = 'year',
  WEEK = 'week',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  // NONE = 'none',
}

export enum ModelFieldEnum {
  SEX = '性别',
  CUSTOM = 'custom',
}

export interface SerialConfigType {
  value: string;
  modelKey: string;
  reset: boolean;
  pattern: string;
  patternType: string;
  condition: ResetConditionEnum;
  minLength: number;
  from: number;
  padding: string;
  step: number;
  upper: number;
  to: number;
  descName?: string;
}

export interface SerialListType {
  id: string;
  type: TypeEnum;
  config: Partial<SerialConfigType>;
}

const seriesNumberData: SerialListType[] = [
  {
    id: '',
    type: TypeEnum.FIXED,
    config: {
      value: '',
    },
  },

  {
    id: '',
    type: TypeEnum.PLACEHOLDER,
    config: {
      modelKey: ModelFieldEnum.SEX, // 实体模型的key
      reset: true,
    },
  },
  {
    id: '',
    type: TypeEnum.DATE,
    config: {
      pattern: PatternEnum.yyyyMMdd,
      reset: true,
      condition: ResetConditionEnum.YEAR, // none , year,month,day,hour
    },
  },
  {
    id: '',
    type: TypeEnum.INCREASE,
    config: {
      minLength: 10, //最小长度
      from: 1, // 起始序号
      padding: '0', // 填充
    },
  },
  {
    id: '',
    type: TypeEnum.LETTER,
    config: {
      upper: 0, //大小写
    },
  },
];

export const getSeriesList = (): Promise<SerialListType[]> => {
  return new Promise((resolve, reject) => {
    if (seriesNumberData) {
      resolve(seriesNumberData);
    } else {
      reject('没有值');
    }
  });
};
