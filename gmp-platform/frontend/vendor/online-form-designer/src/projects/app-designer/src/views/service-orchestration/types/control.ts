import { NodeTypeEnum, ModelSubmitReturnEnum, ParameterStruct } from './index';

export interface BaseControlInterface {
  id: string;
  name: string;
  desc: string;
  shape: NodeTypeEnum;
}
export namespace Control {
  export interface Start extends BaseControlInterface {
    parameter: boolean;
    parameterStruct: ParameterStruct;
  }

  export interface End extends BaseControlInterface {
    return: boolean;
    returnIdentifier: string;
  }

  export interface ModelCreate extends BaseControlInterface {
    model: string;
    modelAssignment: object[];
    returnToIdentifier: string;
  }

  export interface ModelSubmit extends BaseControlInterface {
    model: string;
    modelRefer: string;
    modelSubmitReturn: ModelSubmitReturnEnum;
    returnToIdentifier: string;
  }
}

export interface ControlSchemaInterface {
  [NodeTypeEnum.START]: Control.Start & { shape: NodeTypeEnum.START };
  [NodeTypeEnum.END]: Control.End & { shape: NodeTypeEnum.END };
  [NodeTypeEnum.MODEL_CREATE]: Control.ModelCreate & { shape: NodeTypeEnum.MODEL_CREATE };
  [NodeTypeEnum.MODEL_SUBMIT]: Control.ModelSubmit & { shape: NodeTypeEnum.MODEL_SUBMIT };
}
