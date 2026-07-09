import { getBpmnId } from './getBpmnId';

export function getDefault() {
  const StartId = `__start__`;
  const EndId = `__end__`;
  const SubmitId = `__initiator__`;
  const Flow1 = `Flow_${getBpmnId()}`;
  const Flow2 = `Flow_${getBpmnId()}`;
  return {
    nodes: [
      {
        id: StartId,
        type: 'bpmn:startEvent',
        x: 140,
        y: 280,
        properties: {
          _type_: 'startEvent',
        },
        text: {
          x: 140,
          y: 360,
          value: '开始',
        },
      },
      {
        id: EndId,
        type: 'bpmn:endEvent',
        x: 520,
        y: 280,
        properties: {
          _type_: 'endEvent',
        },
        text: {
          x: 520,
          y: 320,
          value: '结束',
        },
      },
      {
        id: SubmitId,
        type: 'bpmn:userTask',
        x: 320,
        y: 280,
        properties: {
          _type_: 'submitTask',
          _extends_: 'userTask',
          title: '提交',
        },
        text: {
          x: 320,
          y: 280,
          value: '提交',
        },
      },
    ],
    edges: [
      {
        id: Flow1,
        type: 'bpmn:sequenceFlow',
        sourceNodeId: StartId,
        targetNodeId: SubmitId,
        startPoint: {
          x: 158,
          y: 280,
        },
        endPoint: {
          x: 270,
          y: 280,
        },
        properties: {},
        pointsList: [
          {
            x: 158,
            y: 280,
          },
          {
            x: 270,
            y: 280,
          },
        ],
      },
      {
        id: Flow2,
        type: 'bpmn:sequenceFlow',
        sourceNodeId: SubmitId,
        targetNodeId: EndId,
        startPoint: {
          x: 370,
          y: 280,
        },
        endPoint: {
          x: 502,
          y: 280,
        },
        properties: {},
        pointsList: [
          {
            x: 370,
            y: 280,
          },
          {
            x: 502,
            y: 280,
          },
        ],
      },
    ],
  };
}
