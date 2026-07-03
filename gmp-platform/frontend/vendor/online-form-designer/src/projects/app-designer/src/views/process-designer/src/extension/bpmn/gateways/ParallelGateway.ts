import { ConnectRule, HtmlNode, HtmlNodeModel, BaseNodeModel } from '@logicflow/core';

import { getBpmnId } from '../../../utils/getBpmnId';
import { BaseGatewayConfig, ElementViewSchema } from '../../../constants';

class Model extends HtmlNodeModel {
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Gateway_${getBpmnId()}`;
    }

    super(data, graphModel);
  }
  override setAttributes() {
    // 设置节点宽高和锚点
    const width = BaseGatewayConfig.width;
    const height = BaseGatewayConfig.height;
    this.width = width;
    this.height = height;
    this.anchorsOffset = [
      [(width - 20) / 2, -8],
      [0, height / 2 - 18],
      [-(width - 20) / 2, -8],
      [0, -height / 2 + 1],
    ];
  }

  // override getConnectedSourceRules(): ConnectRule[] {
  //   console.log('this', this);
  //   const rules = super.getConnectedSourceRules();
  //   rules.push({
  //     message: '当前节点最多只能有1个连出',
  //     validate: (source: BaseNodeModel, target: BaseNodeModel, sourceAnchor, targetAnchor) => {
  //       return source.outgoing.edges.length < 1;
  //     },
  //   });
  //   return rules;
  // }
}

class View extends HtmlNode {
  override setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
    const { _type_, title } = properties;
    console.log('type', _type_);
    const config = ElementViewSchema[_type_];
    const el = document.createElement('div');

    el.className = 'bpmn-element__gateway';

    const html = `
      <i class="iconfont ${config.icon}"></i>
      <div>${title || '--'}</div>
    `;
    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
  override getText() {
    return null;
  }
}

const ParallelGateway = {
  type: 'bpmn:parallelGateway',
  view: View,
  model: Model,
};

export { View as ParallelGatewayNode, Model as ParallelGatewayModel };
export default ParallelGateway;
