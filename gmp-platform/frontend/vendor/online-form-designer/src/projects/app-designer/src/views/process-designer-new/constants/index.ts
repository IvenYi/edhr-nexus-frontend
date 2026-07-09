import {
  BpmnNodeTypeEnum,
  ButtonEventsEnum,
  ButtonTypeEnum,
} from '@gct/flow/src/plugins/paas-bpmn/enums';

export enum BpmnVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HISTORY = 'HISTORY',
}

export enum FieldsPermissionEnum {
  hidden = 'hidden',
  readonly = 'readonly',
  disabled = 'disabled',
  editable = 'editable',
}

export const NodeEventsGroupByType = {
  ['global']: [ButtonEventsEnum.StartInstance, ButtonEventsEnum.EndInstance],
  [BpmnNodeTypeEnum.BpmnSubmit]: [
    {
      type: ButtonTypeEnum.Resubmit,
      value: ButtonEventsEnum.BeforeReSubmit,
    },
    {
      type: ButtonTypeEnum.Resubmit,
      value: ButtonEventsEnum.AfterReSubmit,
    },
    {
      type: ButtonTypeEnum.End,
      value: ButtonEventsEnum.BeforeEnd,
    },
    {
      type: ButtonTypeEnum.End,
      value: ButtonEventsEnum.AfterEnd,
    },
    {
      type: ButtonTypeEnum.Withdraw,
      value: ButtonEventsEnum.BeforeWithdraw,
    },
    {
      type: ButtonTypeEnum.Withdraw,
      value: ButtonEventsEnum.AfterWithdraw,
    },
  ],
  [BpmnNodeTypeEnum.BpmnApproval]: [
    {
      type: ButtonTypeEnum.Approve,
      value: ButtonEventsEnum.BeforeApprove,
    },
    {
      type: ButtonTypeEnum.Approve,
      value: ButtonEventsEnum.AfterApprove,
    },
    {
      type: ButtonTypeEnum.Refuse,
      value: ButtonEventsEnum.BeforeRefuse,
    },
    {
      type: ButtonTypeEnum.Refuse,
      value: ButtonEventsEnum.AfterRefuse,
    },
    {
      type: ButtonTypeEnum.Reassign,
      value: ButtonEventsEnum.BeforeReassign,
    },
    {
      type: ButtonTypeEnum.Reassign,
      value: ButtonEventsEnum.AfterReassign,
    },
    {
      type: ButtonTypeEnum.Countersign,
      value: ButtonEventsEnum.BeforeCountersign,
    },
    {
      type: ButtonTypeEnum.Countersign,
      value: ButtonEventsEnum.AfterCountersign,
    },
    {
      type: ButtonTypeEnum.Reject,
      value: ButtonEventsEnum.BeforeReject,
    },
    {
      type: ButtonTypeEnum.Reject,
      value: ButtonEventsEnum.AfterReject,
    },
  ],
};
