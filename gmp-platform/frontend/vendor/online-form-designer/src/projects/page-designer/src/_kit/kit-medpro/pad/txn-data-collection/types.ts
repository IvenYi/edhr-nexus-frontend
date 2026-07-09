export enum StatusEnum {
  INITIAL = 'initial',
  STASH = 'stash',
  SUBMITTED = 'submitted',
}

export const StatusNames = {
  [StatusEnum.INITIAL]: '待填报',
  [StatusEnum.STASH]: '填报中',
  [StatusEnum.SUBMITTED]: '已填报',
};

export enum EDataStatus {
  INIT = 'init',
  TEMPORARY = 'temporary',
}

export enum CollectionTypeEnum {
  ONLINEFORM = 'onlineForm',
  DATACOLLECTION = 'dataCollection',
}

export interface CollectionData {
  id: string;
  name?: string;
  status: StatusEnum;
  type: CollectionTypeEnum;
  typeName?: string;
  snContainerName?: string;
}

export const TypeNames = {
  [CollectionTypeEnum.ONLINEFORM]: '在线表单',
  [CollectionTypeEnum.DATACOLLECTION]: '数据采集',
};

export const typeParser = (item) => {
  if (item?.type === CollectionTypeEnum.ONLINEFORM) {
    return 'kit-file02';
  }
  return 'kit-file01';
};
