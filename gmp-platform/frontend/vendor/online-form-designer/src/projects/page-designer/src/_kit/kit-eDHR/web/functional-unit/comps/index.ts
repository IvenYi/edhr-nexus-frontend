import CreateFormMoudle from './create-release-order';
import IPaasConnectionSelector, { postIpaasWebhookFunc } from './ipaas-connection-selector';
import LaunchApprovalProcess from './launch-approval-process';

export * from './create-release-order';
export * from './ipaas-connection-selector';
export * from './launch-approval-process';

export const moudleNameMaps = {
  CreateFormMoudle: $t('sys.edhr.field.createReleaseTmpl'),
  IPaasConnectionSelector: '选择ipaas连接流',
  LaunchApprovalProcess: '发起审核流程',
};

export default {
  CreateFormMoudle,
  IPaasConnectionSelector,
  postIpaasWebhookFunc,
  LaunchApprovalProcess,
};
