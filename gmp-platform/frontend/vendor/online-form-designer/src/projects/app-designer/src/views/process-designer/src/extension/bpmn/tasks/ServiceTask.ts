import { ConnectRule, HtmlNode, HtmlNodeModel, BaseNodeModel } from '@logicflow/core';
import { getBpmnId } from '../../../utils/getBpmnId';
import { BaseTaskConfig, ElementViewSchema } from '../../../constants';

class Model extends HtmlNodeModel {
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Activity_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
  override setAttributes() {
    this.text.editable = false; // 禁止节点文本编辑
    // 设置节点宽高和锚点
    const width = BaseTaskConfig.width;
    const height = BaseTaskConfig.height;
    this.width = width;
    this.height = height;
    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height / 2],
    ];
  }

  override getConnectedSourceRules(): ConnectRule[] {
    console.log('this', this);
    const rules = super.getConnectedSourceRules();
    rules.push({
      message: '当前节点最多只能有1个连出',
      validate: (source: BaseNodeModel, target: BaseNodeModel, sourceAnchor, targetAnchor) => {
        return source.outgoing.edges.length < 1;
      },
    });
    return rules;
  }
}

class View extends HtmlNode {
  currentProperties: string;
  setHtml(rootEl: HTMLElement) {
    const { properties, text } = this.props.model;
    const { _type_, title } = properties;
    console.log('type', _type_);
    const config = ElementViewSchema[_type_];
    const el = document.createElement('div');

    el.className = 'bpmn-element bpmn-element__task';
    const html = `
      <i class="iconfont ${config.icon}"></i>
      <div>${text.value || '--'}</div>
    `;
    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
  getText() {
    return null;
  }
}

const ServiceTask = {
  type: 'bpmn:serviceTask',
  view: View,
  model: Model,
};

export { View as ServiceTaskView, Model as ServiceTaskModel };
export default ServiceTask;
