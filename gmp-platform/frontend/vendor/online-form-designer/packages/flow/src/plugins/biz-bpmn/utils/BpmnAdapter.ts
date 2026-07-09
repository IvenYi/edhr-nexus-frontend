import nodeModules from '../models';
import type { ITransformOpts, ITransformResult, GctBpmnNode, IGctBpmnNode } from '../types';
import { BpmnNodeTypeEnum, FieldTypeToCaseType } from '../enums';
import { FlowNodeTypeEnum } from '../../../enums';
import { Base64 } from 'js-base64';
import { ValueTypeEnum } from '/@/projects/web-render/src/views/user-group/constant/config';

function getSpaces(len: number = 0): string {
  return len === 0 ? '' : Array(len).fill(' ').join('');
}

function caseXml(formulaType, json, caseId) {
  if (formulaType) {
    return '<![CDATA[${' + 'bizProcChoiceExecutor.executeExp(execution,' + `'${json}'` + ')}]]>';
  } else {
    return '<![CDATA[${bizProcChoiceExecutor.execute(execution,' + `'${json}'` + ')}]]>';
  }
}

/**
 * 根据 json 定义转换为流程定义 xml
 * @param json
 * @param indent 当前缩进
 * @returns
 */
function buildXml(json, indent: number = 0): string {
  const { tag, attrs = {}, children = [], text } = json;
  const attrsStr =
    Object.keys(attrs).length > 0
      ? ' ' +
        Object.keys(attrs)
          .map((key) => `${key}="${attrs[key]}"`)
          .join(' ')
      : '';
  if (text) {
    return `${getSpaces(indent)}<${tag}${attrsStr}>${text}</${tag}>`;
  } else if (children.length > 0) {
    return (
      `${getSpaces(indent)}<${tag}${attrsStr}>` +
      `\n${children.map((child) => buildXml(child, indent + 2)).join('\n')}\n` +
      `${getSpaces(indent)}</${tag}>`
    );
  } else {
    return `${getSpaces(indent)}<${tag}${attrsStr} />`;
  }
}

function formatValue(params) {
  const { result, valueType } = params;
  if (valueType === ValueTypeEnum.FIELD) {
    return '${' + (result.split('$')[1] || result) + '}';
  } else if (valueType === ValueTypeEnum.FIXED) {
    return result;
  } else return '${' + result + '}';
}

function getRightValue(data) {
  if (data.length > 1) {
    return data.map((e) => formatValue(e));
  } else {
    return formatValue(data[0]);
  }
}

function caseJsonTransfer(configArr): any {
  const elements: any = [];
  configArr.forEach((e: any) => {
    if (e.type === 'group') {
      elements.push({
        type: 'conditionGroup',
        element: {
          logicalOperators: e.operatorType.toLowerCase(),
          elements: caseJsonTransfer(e.children),
        },
      });
    } else {
      const { key, type } = e.leftValue;
      elements.push({
        type: 'condition',
        element: {
          left: '${' + key + '}',
          operator: e.operatorValue,
          right: getRightValue(e.rightValue),
          type: FieldTypeToCaseType[type],
        },
      });
    }
  });
  return elements;
}

/**
 * 根据业务数据生成对应 xml 需要的 json
 * @param data
 * @returns
 */
const buildXmlJson = function (data, callback?: Function): any {
  const bpmnFlowSet: Set<string> = new Set();
  const bpmnNodeArrayTmp: Array<{
    data: any;
    flowId?: string;
    nodeId?: string;
    type?: string;
  }> = [];
  const bpmnFlowArray: any[] = [];
  // 所有节点 map
  const bpmnNodeMap: Record<string, IGctBpmnNode> = {};
  // 所有路径
  let bpmnFlowPaths: string[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach((node) => {
      const { type } = node;

      if (callback && typeof callback === 'function') {
        callback(JSON.parse(JSON.stringify(node.data)));
      }
      const bpmnData = nodeModules[type].bpmnTransformer(node);
      const bpmnItem = {
        data: bpmnData,
        nodeId: node.id,
        type,
      };

      // 记录业务节点
      bpmnNodeMap[node.id] = node;
      bpmnNodeArrayTmp.push(bpmnItem);

      // 节点包含子 Flow
      if (
        (node.type === BpmnNodeTypeEnum.BpmnExclusive ||
          node.type === BpmnNodeTypeEnum.BpmnParallel) &&
        node.children
      ) {
        const flowPaths: string[] = node.children.map((item) => {
          // 记录 flow 节点
          bpmnNodeMap[item.id] = item;
          return item.children.length > 0
            ? node.id +
                ' -> ' +
                item.id +
                ' -> ' +
                item.children.map((item) => item.id).join(' -> ')
            : node.id + ' -> ' + item.id;
        });
        bpmnFlowPaths = bpmnFlowPaths
          .map((p) => {
            return p.includes(node.id) ? flowPaths.map((fp) => p.replace(node.id, fp)) : p;
          })
          .flat();

        // 去重
        bpmnFlowPaths = [...new Set(bpmnFlowPaths)];

        node.children.forEach((item) => {
          traverse(item.children);
        });
      }
    });
  };
  bpmnFlowPaths.push(data.children.map((item) => item.id).join(' -> '));
  traverse(data.children);

  console.log('bpmnPaths', bpmnFlowPaths);
  console.log('bpmnNodeArrayTmp', bpmnNodeArrayTmp);

  bpmnFlowPaths.forEach((fp) => {
    const nodes = fp.split(' -> ');
    nodes.forEach((n, index) => {
      if ((bpmnNodeMap[n].type as any) === FlowNodeTypeEnum.Flow) return;
      const next = nodes[index + 1];
      if (!next) return;
      if ((bpmnNodeMap[next].type as any) === FlowNodeTypeEnum.Flow) {
        const next2 = nodes[index + 2];
        if (!next2) return;
        bpmnFlowSet.add(`${n} -> ${next2}:${next}`);
      } else {
        bpmnFlowSet.add(`${n} -> ${next}`);
      }
    });
  });

  console.log('bpmnFlowSet', bpmnFlowSet);
  console.log('bpmnNodeMap', bpmnNodeMap);

  // 生成sequenceFlow
  for (const item of bpmnFlowSet.keys()) {
    console.log('生成sequenceFlow', item);
    const [sourceRef, targetRef] = item.split(' -> ');
    const bpmnFlowId = `Flow_${Math.random().toString(36).substring(2, 10)}`;
    const sf: any = {
      tag: 'bpmn:sequenceFlow',
      attrs: {
        id: bpmnFlowId,
        sourceRef,
        targetRef,
      },
    };

    // todo 条件规则需要抽离
    // 添加执行条件
    if (targetRef.includes(':')) {
      const [targetId, caseId] = targetRef.split(':');
      sf.attrs.id = caseId;
      sf.attrs.targetRef = targetId;
      const fn = bpmnNodeMap[caseId] as GctBpmnNode.BpmnExclusive['children'][number];
      let text = '';
      if (fn.caseCfg.type) {
        if (fn.caseCfg.type === 'FORMULA') {
          const { exp, relationColumns } = fn.caseCfg.formula!;
          const json = JSON.stringify({
            exp,
            relationColumns,
          });
          text = caseXml(true, Base64.encode(json), caseId);
        } else if (fn.caseCfg.json) {
          const dataRuleConfig = JSON.parse(fn.caseCfg.json.dataRuleConfig);
          const json = caseJsonTransfer(dataRuleConfig)[0].element;
          text = caseXml(false, Base64.encode(JSON.stringify(json)), caseId);
        }
        sf.children = [
          {
            tag: 'bpmn:conditionExpression',
            attrs: {
              'xsi:type': 'bpmn:tFormalExpression',
            },
            text,
          },
        ];
      }
    }

    bpmnFlowArray.push(sf);
  }

  console.log('bpmnFlowArray', bpmnFlowArray);

  // 生成节点
  const bpmnNodeArray = bpmnNodeArrayTmp.map((n) => {
    const node = {
      ...n.data,
    };
    node.children ??= [];
    const incoming = bpmnFlowArray
      .filter((item) => item.attrs.targetRef === node.attrs.id)
      .map((item) => {
        return {
          tag: 'bpmn:incoming',
          text: item.attrs.id,
        };
      });
    const outgoing = bpmnFlowArray
      .filter((item) => item.attrs.sourceRef === node.attrs.id)
      .map((item) => {
        return {
          tag: 'bpmn:outgoing',
          text: item.attrs.id,
        };
      });

    if (n.type === BpmnNodeTypeEnum.BpmnParallel || n.type === BpmnNodeTypeEnum.BpmnExclusive) {
      node.attrs.default = outgoing[outgoing.length - 1].text;
    }

    node.children.unshift(...outgoing);
    if (n.type !== BpmnNodeTypeEnum.BpmnEndWithListener) {
      // 事件监听的结束节点，有自己的节点顺序，在自己的ts文件中维护
      node.children.unshift(...incoming);
    }
    // if (n.type === BpmnNodeTypeEnum.BpmnApproval) {
    //   const idx = node.children.findIndex((e) => e.tag === 'bpmn:extensionElements');
    //   const obj = node.children.splice(idx, 1)[0];
    //   node.children.unshift(obj);
    // }

    return node;
  });

  // 组装 xmlJson
  const xmlJson = {
    tag: 'bpmn:definitions',
    attrs: {
      id: 'Definitions',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
      'xmlns:bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
      'xmlns:dc': 'http://www.omg.org/spec/DD/20100524/DC',
      'xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
      exporter: 'eDHR',
      exporterVersion: '5.2.2',
      targetNamespace: 'http://bpmn.io/schema/bpmn',
      'xmlns:camunda': 'http://camunda.org/schema/1.0/bpmn',
    },
    children: [
      {
        tag: 'bpmn:process',
        attrs: {
          id: '__process__',
          isExecutable: 'true',
        },
        children: [...bpmnNodeArray, ...bpmnFlowArray],
      },
    ],
  };

  console.log(xmlJson);
  return xmlJson;
};

export class BpmnAdapter {
  static transfer(data, options?: ITransformOpts): ITransformResult {
    const nodes: any[] = [];
    const xmlJson = buildXmlJson(data, (node) => {
      nodes.push(node);
    });
    /** 设置流程 id */
    if (options?.processId) {
      xmlJson.children[0].attrs.id = options.processId;
    }
    const xml = buildXml(xmlJson);
    return {
      xml,
      nodes,
    };
  }
}
