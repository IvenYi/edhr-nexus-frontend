import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType, LdapScopeEnum } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { AppTypes } from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.Ldap = {
  nodeId: '',
  nodeName: '',
  nodeDescription: '',
  endpointType: EndpointType.ldap,
  appType: AppTypes.External,
  nodeConfig: {
    authId: undefined,
    baseDn: '',
    objectClass: '',
    filter: '',
    scope: LdapScopeEnum.Sub,
    branchId: '',
    env: '',
    platformAppId: '',
  },
};
