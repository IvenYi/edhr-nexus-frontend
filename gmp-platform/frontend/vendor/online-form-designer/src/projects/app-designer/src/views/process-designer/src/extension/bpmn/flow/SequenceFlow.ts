import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core';
import { getBpmnId } from '../../../utils/getBpmnId';

class SequenceFlowModel extends PolylineEdgeModel {
  static extendKey = 'SequenceFlowModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Flow_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
  setAttributes(): void {
    const { sourceNode } = this;
    if (sourceNode?.type === 'bpmn:startEvent') {
      this.menu = [];
    }
  }
}

class SequenceFlowView extends PolylineEdge {
  static extendKey = 'SequenceFlowEdge';
}

const SequenceFlow = {
  type: 'bpmn:sequenceFlow',
  view: SequenceFlowView,
  model: SequenceFlowModel,
};

export { SequenceFlowView, SequenceFlowModel };
export default SequenceFlow;
