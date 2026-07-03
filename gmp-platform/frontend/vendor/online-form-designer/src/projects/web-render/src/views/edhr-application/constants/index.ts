import { computed } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const SerialNumberColumn = computed<TableColumnsType[number]>(() => {
  const column = {
    title: t('sys.index'),
    key: 'index',
    width: 80,
    customRender: ({ text, record, index }) => {
      return index + 1;
    },
    align: 'center',
  };
  return column;
});
