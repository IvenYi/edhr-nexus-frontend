import { ControlSchemaInterface } from '../types/control';
import { NodeTypeEnum, ModelSubmitReturnEnum } from '../types';

export const controlSchema: ControlSchemaInterface = {
  [NodeTypeEnum.START]: {
    id: '',
    name: '',
    desc: '',
    shape: NodeTypeEnum.START,
    parameter: false,
    parameterStruct: [
      {
        key: 'argument',
        type: 'object',
      },
    ],
  },
  [NodeTypeEnum.END]: {
    id: '',
    name: '',
    desc: '',
    shape: NodeTypeEnum.END,
    return: false,
    returnIdentifier: '',
  },
  [NodeTypeEnum.MODEL_CREATE]: {
    id: '',
    name: '',
    desc: '',
    shape: NodeTypeEnum.MODEL_CREATE,
    model: '',
    modelAssignment: [],
    returnToIdentifier: '',
  },
  [NodeTypeEnum.MODEL_SUBMIT]: {
    id: '',
    name: '',
    desc: '',
    shape: NodeTypeEnum.MODEL_SUBMIT,
    model: '',
    modelRefer: '',
    modelSubmitReturn: ModelSubmitReturnEnum.NONE,
    returnToIdentifier: '',
  },
};
