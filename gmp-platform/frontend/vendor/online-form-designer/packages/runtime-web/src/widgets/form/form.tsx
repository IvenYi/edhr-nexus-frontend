import { defineComponent, PropType, h, resolveComponent } from 'vue';
import {
  useNamespace,
  EditorRegister,
  IForm,
  IFormItemBasic,
  IFormContainer,
  IFormItem,
} from '@gct/runtime';
import { useFormController } from './form.controller';
import './form.scss';

export const AppForm = defineComponent({
  name: 'AppForm',
  props: {
    model: {
      type: Object as PropType<IForm>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('app-form');

    const c = useFormController(props.model);

    /**
     * 绘制表单项
     *
     * @author zhanghanrui
     * @date 2024-03-26 21:03:52
     * @param {IFormItem} item
     * @return {*}
     */
    const renderItem = (item: IFormItem) => {
      if (item.editor.type === 'hidden') {
        return null;
      }
      const provider = EditorRegister.get(item.editor.type);
      let content: any = null;
      if (provider) {
        if (provider.render) {
          content = provider.render(c.state.data[item.name], c.state.data, item);
        } else {
          if (provider.component) {
            content = h(
              typeof provider.component === 'string'
                ? resolveComponent(provider.component)
                : provider.component,
              {
                value: c.state.data[item.name],
                itemModel: item,
                model: item.editor,
                data: c.state.data,
                'onUpdate:value': (value: any) => {
                  console.log('onUpdate:value', value, c.state.data);
                  c.state.data[item.name] = value;
                },
              },
            );
          } else {
            console.error(
              `未找到编辑器绘制组件：${item.name} - ${item.editor.type}，请实现 component 或 render 方法`,
            );
          }
        }
      } else {
        console.error(`未找到编辑器适配器：${item.name} - ${item.editor.type}`);
      }
      return <app-form-item model={item}>{content}</app-form-item>;
    };

    /**
     * 绘制表单容器
     *
     * @author zhanghanrui
     * @date 2024-03-26 21:03:17
     * @param {IFormContainer} container
     * @return {*}
     */
    const renderContainer = (container: IFormContainer) => {
      if (container.layout === 'flex') {
        return (
          <flex-container layout={container.flex}>
            {renderChildren(container.children!)}
          </flex-container>
        );
      }
      if (container.layout === 'grid') {
        return (
          <grid-container layout={container.grid}>
            {renderChildren(container.children!)}
          </grid-container>
        );
      }
      console.error('不支持的layout类型' + container.layout);
    };

    /**
     * 绘制子元素
     *
     * @author zhanghanrui
     * @date 2024-03-26 21:03:22
     * @param {IFormItemBasic[]} children
     * @return {*}
     */
    const renderChildren = (children: IFormItemBasic[]) => {
      if (!children) {
        return null;
      }
      return children.map((item) => {
        const container = item as IFormContainer;
        if (container.children) {
          return renderChildren(container.children);
        }
        return renderItem(item as IFormItem);
      });
    };

    return { ns, c, renderItem, renderContainer, renderChildren };
  },
  render() {
    return (
      <a-form model={this.c.state.data} class={this.ns.b()}>
        {this.model.children.map((item) => this.renderContainer(item))}
      </a-form>
    );
  },
});

export default AppForm;
