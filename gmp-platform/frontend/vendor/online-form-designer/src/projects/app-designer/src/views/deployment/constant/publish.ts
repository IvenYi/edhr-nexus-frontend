import { computed } from 'vue';
import { StateEnum } from '../types/type';
import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const publishColumns: BasicColumn[] = [
  {
    title: t('sys.appDesigner.executionVersion'),
    dataIndex: 'appVersionTag',
  },
  {
    title: t('sys.status'),
    dataIndex: 'state',
  },
  {
    title: t('sys.appDesigner.publisher'),
    dataIndex: 'createUserName',
  },
  {
    title: t('sys.appDesigner.releaseTime'),
    dataIndex: 'createTime',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'actions',
    width: 200,
    align: 'center',
    fixed: 'right',
  },
];

export const colorMap = new Map([
  ['PREPARING', '#0DAA9C'],
  ['DEPLOYING', '#0DAA9C'],
  ['FAILURE', '#FF4D4F'],
  ['SUCCESS', '#0DCF8D '],
]);

export const deployState = computed(() => (state: StateEnum) => {
  let text = '';
  switch (state) {
    case StateEnum.PREPARING:
      text = t('sys.appDesigner.preparing');
      break;
    case StateEnum.DEPLOYING:
      text = t('sys.appDesigner.deploying');
      break;
    case StateEnum.SUCCESS:
      text = t('sys.appDesigner.success');
      break;
    case StateEnum.FAILURE:
      text = t('sys.appDesigner.failure');
      break;
    default:
  }
  return text;
});
