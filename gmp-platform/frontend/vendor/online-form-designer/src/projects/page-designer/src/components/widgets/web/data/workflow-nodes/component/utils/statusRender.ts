import { NodeStateEnum } from '../types';

class NodeStatusComponent extends HTMLElement {
  private static readonly TEMPLATE_CACHE = new Map<string, string>();
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['status', 'type'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    // 安全地获取并清理属性值
    const status = this.sanitizeAttribute(this.getAttribute('status')) || 'default';
    const type = this.sanitizeAttribute(this.getAttribute('type')) || 'info';

    if (!this.shadowRoot) return;

    // 使用缓存提高性能
    const cacheKey = `${status}-${type}`;
    let template = NodeStatusComponent.TEMPLATE_CACHE.get(cacheKey);

    if (!template) {
      /**
       * 自定义样式和内容
       * 如果渲染逻辑复杂，可以使用外部css引入的方式
       * <link rel="stylesheet" href="./node-status.css">
       */
      template = `
        <style>
          .node-status {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            width: 56px;
            height: 24px;
            margin-top: 36px;
            position: relative;
          }
          .node-status--text {
            padding-left: 8px;
            font-size: 16px;
            color: ${this.getStatusColor(status)};
            transform: scale(.6);
          }
          .node-status--text::before {
            content: '';
            position: absolute;
            left: -6px;
            top: 50%;
            width: 10px;
            height: 10px;
            margin-right: 4px;
            background-color: ${this.getStatusColor(status)};
            border-radius: 50%;
            transform: translateY(-50%);
          }
        </style>
        
        <div class="node-status ${this.escapeHtml(type)}">
          <div class="node-status--text">${this.escapeHtml(this.getStatusSymbol(status))}</div>
        </div>
      `;
      NodeStatusComponent.TEMPLATE_CACHE.set(cacheKey, template);
    }

    this.shadowRoot.innerHTML = template;
  }

  /**
   * 安全处理属性值，防止 XSS 攻击
   */
  private sanitizeAttribute(value: string | null): string {
    if (!value) return '';

    // 移除潜在危险字符，只保留字母、数字、连字符和下划线
    return value.replace(/[^a-zA-Z0-9\-_]/g, '');
  }

  /**
   * HTML 转义函数，防止 XSS 攻击
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 根据状态获取对应的颜色
   */
  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      [NodeStateEnum.FINISHED]: '#309C41',
      [NodeStateEnum.RUNNING]: '#FCA903',
      [NodeStateEnum.WAITING]: '#838383',
      default: '#64748b',
    };
    return colors[status] || colors.default;
  }

  /**
   * 根据状态获取对应的符号
   */
  private getStatusSymbol(status: string): string {
    const symbols: Record<string, string> = {
      [NodeStateEnum.FINISHED]: '已完成',
      [NodeStateEnum.RUNNING]: '进行中',
      [NodeStateEnum.WAITING]: '未开始',
      default: '--',
    };
    return symbols[status] || symbols.default;
  }
}

// 注册组件时添加防重复注册检查
(function registerComponent() {
  if (typeof customElements !== 'undefined' && !customElements.get('node-status')) {
    customElements.define('node-status', NodeStatusComponent);
  }
})();
