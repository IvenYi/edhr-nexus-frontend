import type { GctFlowNode } from '../types/index';
import { FlowNodeTypeEnum, FlowNodeInstStatus } from '../enums/index';

export function isFinished(node: GctFlowNode.Basic, nodeInstStatusMap): boolean {
  if (node.type === FlowNodeTypeEnum.Flow) {
    if (node.children.length === 0) {
      return nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED;
    }
    // 排除隐藏节点
    const notHideChilds = node.children?.filter((n) => !n.hidden);
    const lastNode = notHideChilds[notHideChilds.length - 1];
    return isFinished(lastNode, nodeInstStatusMap);
  } else if (
    node.type === 'bpmnExclusive' ||
    node.type === 'bpmnParallel' ||
    node.type === 'bpmnInclusiveS'
  ) {
    return node.children.some((f) => isFinished(f, nodeInstStatusMap));
  } else {
    return nodeInstStatusMap[node.id]?.status === FlowNodeInstStatus.COMPLETED;
  }
}

function calcColSpans(flows: GctFlowNode.Flow[]): number[] {
  const colSpans = flows.map((flow) => {
    if (flow.children.length === 0) return 1;
    const cols: number[] = flow.children.map((n) => {
      if (
        [
          'bpmnExclusive',
          'bpmnParallel',
          'bizParallel',
          'bizParallelReal',
          'bizExclusive',
          'parallel',
          'loop',
          'exclusive',
        ].includes(n.type) &&
        !n.fold
      ) {
        const res = calcColSpans((n as any).children).reduce((total, value) => {
          total += value;
          return total;
        }, 0);
        return n.type === 'loop' ? res + 1 : res;
      }
      return 1;
    });
    return Math.max(...cols);
  });
  return colSpans;
}

export function getEntrySvgDef(
  nodes: GctFlowNode.Flow[],
  { height = 60, radius = 10, size = 268 } = {},
) {
  const colSpans = calcColSpans(nodes);
  const colSpanTotal = colSpans.reduce((total, value) => {
    total += value;
    return total;
  }, 0);

  const SIZE = size;
  const HEIGHT = height;
  const HALF_HEIGHT = height / 2;
  const RADIUS = radius;
  const width = SIZE * colSpanTotal;
  const center = width / 2;
  let startPos = 0;
  const paths = nodes.map((path, index) => {
    const currentPos = startPos * SIZE + (colSpans[index] * SIZE) / 2;
    startPos += colSpans[index];
    const p: {
      id: string;
      d: string | null;
      no: number;
    } = { id: path.id, no: index, d: null };
    if (currentPos === center) {
      p.d = `M${center},0 L${center},${HEIGHT}`;
    } else if (currentPos < center) {
      p.d = `M${center},0 L${center},${HALF_HEIGHT - RADIUS} Q${center},${HALF_HEIGHT} ${
        center - RADIUS
      },${HALF_HEIGHT} L${
        currentPos + RADIUS
      },${HALF_HEIGHT} Q${currentPos},${HALF_HEIGHT} ${currentPos},${
        HALF_HEIGHT + RADIUS
      } L${currentPos},${HEIGHT}`;
    } else {
      p.d = `M${center},0 L${center},${HALF_HEIGHT - RADIUS} Q${center},${HALF_HEIGHT} ${
        center + RADIUS
      },${HALF_HEIGHT} L${
        currentPos - RADIUS
      },${HALF_HEIGHT} Q${currentPos},${HALF_HEIGHT} ${currentPos},${
        HALF_HEIGHT + RADIUS
      } L${currentPos},${HEIGHT}`;
    }
    return p;
  });
  return {
    width,
    height: HEIGHT,
    paths,
  };
}

export function getExitSvgDef(nodes, { size = 268 } = {}) {
  const colSpans = calcColSpans(nodes);
  const colSpanTotal = colSpans.reduce((total, value) => {
    total += value;
    return total;
  }, 0);

  const SIZE = size;
  const HEIGHT = 20;
  const HALF_HEIGHT = HEIGHT / 2;
  const RADIUS = 10;

  const width = SIZE * colSpanTotal;
  const center = width / 2;
  let startPos = 0;

  const paths = nodes.map((path, index) => {
    const currentPos = startPos * SIZE + (colSpans[index] * SIZE) / 2;
    startPos += colSpans[index];

    const p: {
      id: string;
      d: string | null;
      no: number;
    } = { id: path.id, no: index, d: null };

    if (currentPos === center) {
      p.d = `M${center},0 L${center},${HEIGHT}`;
    } else if (currentPos < center) {
      p.d = `M${currentPos},0 L${currentPos},${
        HALF_HEIGHT - RADIUS
      } Q${currentPos},${HALF_HEIGHT} ${currentPos + RADIUS},${HALF_HEIGHT} L${
        center - RADIUS
      },${HALF_HEIGHT} Q${center},${HALF_HEIGHT} ${center},${
        HALF_HEIGHT + RADIUS
      } L${center},${HEIGHT}`;
    } else {
      p.d = `M${currentPos},0 L${currentPos},${
        HALF_HEIGHT - RADIUS
      } Q${currentPos},${HALF_HEIGHT} ${currentPos - RADIUS},${HALF_HEIGHT} L${
        center + RADIUS
      },${HALF_HEIGHT} Q${center},${HALF_HEIGHT} ${center},${
        HALF_HEIGHT + RADIUS
      } L${center},${HEIGHT}`;
    }
    return p;
  });
  return {
    width,
    height: HEIGHT,
    paths,
  };
}

export function getLoopEntrySvgDef(
  nodes: GctFlowNode.Flow[],
  { height = 60, radius = 10, size = 268 } = {},
) {
  const colSpans = calcColSpans(nodes);
  const colSpanTotal = colSpans.reduce((total, value) => {
    total += value;
    return total;
  }, 0);
  const SIZE = size;
  const HEIGHT = height;
  const HALF_HEIGHT = height / 2;
  const RADIUS = radius;
  const width = SIZE * (colSpanTotal + 1);
  const center = width / 2;
  let startPos = 1;
  const paths = nodes.map((path, index) => {
    const currentPos = startPos * SIZE + (colSpans[index] * SIZE) / 2;
    startPos += colSpans[index];
    const p: {
      id: string;
      d: string | null;
      no: number;
    } = {
      id: path.id,
      no: index + 1,
      d: '',
    };
    const line1 = `M${SIZE / 2},${HEIGHT} L${SIZE / 2},${HEIGHT - RADIUS} Q${SIZE / 2},${HALF_HEIGHT} ${SIZE / 2 + RADIUS},${HALF_HEIGHT} L${center - 6},${HALF_HEIGHT}`;
    const line2 = `M${center},0 L${center},${HALF_HEIGHT - RADIUS} Q${center},${HALF_HEIGHT} ${
      center + RADIUS
    },${HALF_HEIGHT} L${
      currentPos - RADIUS
    },${HALF_HEIGHT} Q${currentPos},${HALF_HEIGHT} ${currentPos},${
      HALF_HEIGHT + RADIUS
    } L${currentPos},${HEIGHT}`;
    p.d = `${line2}${line1}`;
    return p;
  });
  return {
    width,
    height: HEIGHT,
    paths,
  };
}

export function getLoopExitSvgDef(nodes, { size = 268 } = {}) {
  const colSpans = calcColSpans(nodes);
  const colSpanTotal = colSpans.reduce((total, value) => {
    total += value;
    return total;
  }, 0);

  const SIZE = size;
  const HEIGHT = 20;
  const HALF_HEIGHT = HEIGHT / 2;

  const width = SIZE * (colSpanTotal + 1);
  let startPos = 1;

  const paths = nodes.map((path, index) => {
    const currentPos = startPos * SIZE + (colSpans[index] * SIZE) / 2;
    startPos += colSpans[index];

    const p: {
      id: string;
      d: string | null;
      no: number;
    } = {
      id: path.id,
      no: index,
      // d: `M453,0 L453,0 Q453,10 443,10 L161,10 Q151,10 151,0`,
      d: `M${currentPos},0 L${currentPos},0 Q${currentPos},${HALF_HEIGHT} ${currentPos - HALF_HEIGHT},${HALF_HEIGHT} L${SIZE / 2 + HALF_HEIGHT},${HALF_HEIGHT} Q${SIZE / 2},${HALF_HEIGHT} ${SIZE / 2},0`,
    };
    return p;
  });
  return {
    width,
    height: HEIGHT / 2 + 1,
    paths,
  };
}
