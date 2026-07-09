import { IForm } from '@gct/runtime';
import { i18n } from '/@/locales/setupI18n';
import dayjs from 'dayjs';
import { triggerMode, triggerResult } from './code-list';

const { t } = i18n.global;

const today = dayjs();

export const model: IForm = {
  type: 'search',
  fields: ['keyword', 'triggerMode', 'status', 'operator', 'startTime', 'endTime'],
  children: [
    {
      type: 'container',
      layout: 'grid',
      children: [
        {
          label: t('sys.webRender.taskLog.grid.jobName'),
          name: 'keyword',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            placeholder: t('sys.webRender.placeholderInput'),
            type: 'text',
          },
        },
        {
          label: t('sys.webRender.taskLog.grid.triggerMode'),
          name: 'triggerMode',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            type: 'select',
            codeTag: triggerMode.tag,
            placeholder: t('sys.webRender.placeholderSelect'),
          },
        },
        {
          label: t('sys.webRender.taskLog.grid.status'),
          name: 'status',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            type: 'select',
            codeTag: triggerResult.tag,
            placeholder: t('sys.webRender.placeholderSelect'),
          },
        },
      ],
    },
    {
      type: 'container',
      layout: 'grid',
      children: [
        {
          label: t('sys.webRender.taskLog.grid.operator'),
          name: 'operator',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            placeholder: t('sys.webRender.placeholderInput'),
            type: 'text',
          },
        },
        {
          label: t('sys.webRender.taskLog.grid.operatorDateRange'),
          name: 'actionTimeRange',
          type: 'item',
          gridItem: { span: 8 },
          fields: ['startTime', 'endTime'],
          default: [
            today.subtract(1, 'month').format('YYYY-MM-DD') + ' 00:00:00',
            today.format('YYYY-MM-DD') + '23:59:59',
          ],
          editor: {
            placeholder: [
              t('sys.webRender.taskLog.search.startDate'),
              t('sys.webRender.taskLog.search.endDate'),
            ],
            type: 'date-range',
          },
        },
        {
          name: 'startTime',
          type: 'item',
          editor: {
            type: 'hidden',
          },
        },
        {
          name: 'endTime',
          type: 'item',
          editor: {
            type: 'hidden',
          },
        },
      ],
    },
  ],
};
