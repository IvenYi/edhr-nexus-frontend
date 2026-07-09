import type { IGctBpmnEventConfig, IGctBpmnButtonConfig } from '@gct/flow/src/plugins/bpmn/types';

export interface IBaseButtonConfig extends Omit<IGctBpmnButtonConfig, 'type' | 'enable'> {
  title: string;
  type: string;
  enable: 0 | 1;
  buttonType: 'builtin' | 'custom';
  events?: IGctBpmnEventConfig[];
}
