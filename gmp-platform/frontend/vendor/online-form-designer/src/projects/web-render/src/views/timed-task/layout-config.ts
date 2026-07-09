import { IForm } from '@gct/runtime';
import { i18n } from '/@/locales/setupI18n';
import { triggerPolicy, resourceType, status } from './code-list';

const { t } = i18n.global;

export const model: IForm = {
  type: 'search',
  fields: ['keyword', 'triggerPolicy', 'resourceType', 'resourceName', 'status'],
  children: [
    {
      type: 'container',
      layout: 'grid',
      children: [
        {
          label: t('sys.webRender.timedTask.grid.jobName'),
          name: 'keyword',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            placeholder: t('sys.webRender.placeholderInput'),
            type: 'text',
          },
        },
        {
          label: t('sys.webRender.timedTask.grid.triggerPolicy'),
          name: 'triggerPolicy',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            type: 'select',
            codeTag: triggerPolicy.tag,
            placeholder: t('sys.webRender.placeholderSelect'),
          },
        },
        {
          label: t('sys.webRender.timedTask.grid.resourceType'),
          name: 'resourceType',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            type: 'select',
            codeTag: resourceType.tag,
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
          label: t('sys.webRender.timedTask.grid.resourceName'),
          name: 'resourceName',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            placeholder: t('sys.webRender.placeholderInput'),
            type: 'text',
          },
        },
        {
          label: t('sys.webRender.timedTask.grid.status'),
          name: 'status',
          type: 'item',
          gridItem: { span: 8 },
          editor: {
            type: 'select',
            codeTag: status.tag,
            placeholder: t('sys.webRender.placeholderSelect'),
          },
        },
      ],
    },
  ],
};
