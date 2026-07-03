import type { TableColumnsType } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const columns: TableColumnsType = [
  {
    title: t('sys.pageDesigner.index'),
    dataIndex: 'index',
    key: 'index',
    width: 60,
  },
  {
    title: t('sys.name'),
    dataIndex: 'name',
    key: 'name',
    resizable: true,
    ellipsis: true,
  },
  {
    title: t('sys.status'),
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: t('sys.type'),
    dataIndex: 'type',
    key: 'type',
  },
];

export const switchIcons = [
  {
    icon: 'icon-liebiaozhanshi',
    name: 'List',
    key: 'switch_icon_list',
  },
  {
    icon: 'icon-kapianzhanshi',
    name: 'Card',
    key: 'switch_icon_card',
  },
];

export enum StatusEnum {
  INITIAL = 'initial',
  STASH = 'stash',
  SUBMITTED = 'submitted',
}

export const StatusNames = {
  [StatusEnum.INITIAL]: t('sys.kit.dataCollection.initial'),
  [StatusEnum.STASH]: t('sys.kit.dataCollection.stash'),
  [StatusEnum.SUBMITTED]: t('sys.kit.dataCollection.submitted'),
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

export const rightCols = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
  },
  {
    title: '名称',
    dataIndex: 'name_',
    key: 'name_',
  },
  {
    title: '类型',
    dataIndex: 'type_',
    key: 'type_',
  },
  {
    title: '值',
    dataIndex: 'value_',
    key: 'value_',
  },
  {
    title: '参考值',
    dataIndex: 'tip_text_',
    key: 'tip_text_',
  },
];

export const typeParser = (item) => {
  if (item?.type === CollectionTypeEnum.ONLINEFORM) {
    return 'kit-file02';
  }
  return 'kit-file01';
};
