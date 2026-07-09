/* eslint-disable vue/no-setup-props-destructure */
import { defineComponent, PropType, h, resolveComponent, reactive, VNode, provide, ref } from 'vue';
import {
  useNamespace,
  IForm,
  IFormItemBasic,
  IFormContainer,
  IFormItem,
  IFormController,
  FORM_CONTROLLER_INJECT_TAG,
} from '@gct/runtime';
import './gct-form.scss';

export const GctForm = defineComponent({
  name: 'GctForm',
  props: {
    c: {
      type: Object as PropType<IFormController>,
      required: true,
    },
    model: {
      type: Object as PropType<IForm>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('gct-form');

    provide(FORM_CONTROLLER_INJECT_TAG, props.c);

    const formRef = ref<any>(null);

    // eslint-disable-next-line vue/no-setup-props-destructure
    const c = props.c;

    // 将所有和界面状态相关的数据转换为响应式数据，以便在界面上进行双向绑定
    const keys = Object.keys(c.item);
    keys.forEach((key) => {
      const item = c.item[key];
      item.state = reactive(item.state);
    });

    /**
     * 绘制表单项
     *
     * @author zhanghanrui
     * @date 2024-03-26 21:03:52
     * @param {IFormItem} item
     * @return {*}
     */
    const renderItem = (item: IFormItem) => {
      return (
        <gct-form-item
          class={item.class}
          style={item.style}
          count={c.state.count}
          c={c.item[item.name]}
          formModel={props.model}
          model={item}
          context={props.context}
        />
      );
    };

    /**
     * 绘制表单容器
     *
     * @author zhanghanrui
     * @date 2024-03-26 21:03:17
     * @param {IFormContainer} item
     * @return {*}
     */
    const renderContainer = (item: IFormContainer) => {
      const provider = c.provider[item.name];
      if (!provider) {
        console.error(`未找到表单项适配器实例：${item.name}`, item);
        return null;
      }
      if (provider) {
        return h(
          typeof provider.component === 'string'
            ? resolveComponent(provider.component)
            : provider.component,
          {
            key: item.name,
            model: item,
            count: c.state.count,
            c: c.item[item.name],
            data: c.state.data,
            class: item.class,
            style: item.style,
            context: props.context,
          },
          renderChildren(item.children || []),
        );
      } else {
        console.error(`未找到表单容器适配器：${item.name} - ${item.type}`);
      }
    };

    /**
     * 绘制子元素
     *
     * @author zhanghanrui
     * @date 2024-03-26 21:03:22
     * @param {IFormItemBasic[]} children
     * @return {*}
     */
    const renderChildren = (children: IFormItemBasic[]): VNode[] => {
      if (!children) {
        return [];
      }
      const nodes: any[] = [];
      children.forEach((item) => {
        if (item.type === 'hidden') {
          return null;
        }
        let node: any = null;
        const container = item as IFormContainer;
        if (
          container.type === 'container' ||
          (container as any).isContainer ||
          (container as any).container
        ) {
          node = renderContainer(container);
        } else {
          node = renderItem(item as IFormItem);
        }
        if (node) {
          nodes.push(node);
        }
      });
      return nodes;
    };

    const staticStyle: IData = {};

    if (props.model.labelWidth) {
      staticStyle[ns.cssVarName('form-item-label-width')] = props.model.labelWidth;
    }

    return { ns, formRef, staticStyle, renderItem, renderContainer, renderChildren };
  },
  render() {
    return (
      <a-form
        ref="formRef"
        layout={this.model.layout}
        model={this.c.state.data}
        count={this.c.state.count}
        class={[
          this.ns.b(),
          this.ns.is('info', this.model.info === true),
          this.model.size ? this.ns.m(this.model.size) : null,
        ]}
        autocomplete="off"
        style={this.staticStyle}
      >
        {this.model.children.map((item) => this.renderContainer(item))}
      </a-form>
    );
  },
});

export default GctForm;
