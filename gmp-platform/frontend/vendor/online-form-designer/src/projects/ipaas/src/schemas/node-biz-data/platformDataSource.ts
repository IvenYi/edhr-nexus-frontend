import type { NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
import { EnvTypeEnum } from '../../enums';

export const NodeBizDataConstant: NodeBizDataSchema.DB = {
  // nodeId: '',
  // nodeName: '',
  // nodeDescription: '',
  endpointType: EndpointType.db,
  nodeConfig: {
    dsKey: undefined,
    env: EnvTypeEnum.dev,
    sql: undefined,
  },
};
