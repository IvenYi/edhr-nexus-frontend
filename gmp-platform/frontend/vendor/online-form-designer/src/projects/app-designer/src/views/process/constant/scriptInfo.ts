import { ref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const scriptInfo = ref([
  {
    key: 'name',
    label: t('sys.appDesigner.scriptName'),
    value: '',
  },
  {
    key: 'key',
    label: t('sys.appDesigner.scriptKey'),
    value: '',
  },
  {
    key: 'version',
    label: t('sys.appDesigner.version'),
    value: [],
  },
  {
    key: 'description',
    label: t('sys.description'),
    value: '',
  },
  {
    key: 'createUserName',
    label: t('sys.createUser'),
    value: '',
  },
  {
    key: 'createTime',
    label: t('sys.createTime'),
    value: '',
  },
  {
    key: 'modifyUserName',
    label: t('sys.appDesigner.modifier'),
    value: '',
  },
  {
    key: 'modifyTime',
    label: t('sys.appDesigner.modificationTime'),
    value: '',
  },
]);
