export enum StateEnum {
  PREPARING = 'PREPARING',
  DEPLOYING = 'DEPLOYING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface StepList {
  createTime: string;
  content: string;
}

export interface TableDataType {
  appVersionTag: string;
  state: StateEnum;
  createUserName: string;
  createTime: string;
  content: string;
  stepList: StepList[] | null;
  problemList: string[] | null;
}
