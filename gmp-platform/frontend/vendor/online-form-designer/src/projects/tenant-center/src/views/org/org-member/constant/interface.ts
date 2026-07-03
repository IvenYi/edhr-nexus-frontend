import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { computed } from 'vue';
import { useDeploySetting } from '@/hooks/platform/useDeploySetting';
import { useAppInfoStore } from '/@/store/modules/app-info';

const { t } = useI18n();
const appInfoStore = useAppInfoStore();
const { isIndependentApp } = useDeploySetting();

export const columns = computed<BasicColumn[]>(() => {
  const columns: Array<BasicColumn | null> = [
    appInfoStore.appInfo.suiteKey === 'eDHR'
      ? null
      : {
          title: t('sys.index'),
          dataIndex: 'no',
          fixed: 'left',
          width: 72,
        },
    {
      title: t('sys.fullname'),
      dataIndex: 'fullname',
      fixed: 'left',
    },
    {
      title: t('sys.userName'),
      dataIndex: 'username',
    },
    {
      title: t('sys.mobile'),
      dataIndex: 'mobile',
      width: 136
    },
    {
      title: t('sys.status'),
      dataIndex: 'enabled',
    },

    {
      title: t('sys.Dept'),
      dataIndex: 'orgNames',
    },

    {
      title: t('sys.createUser'),
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      width: 170
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      width: 170
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 80,
      align: 'left',
      fixed: 'right',
    },
  ];
  return columns.filter((item) => item !== null);
});
