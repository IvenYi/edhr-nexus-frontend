/* eslint-disable vue/no-setup-props-destructure */
import { defineComponent, PropType, h, resolveComponent, computed } from 'vue';
import {
  useNamespace,
  IFormItem,
  IFormItemController,
  EditorRegisterConst,
  IEditForm,
} from '@gct/runtime';
import './gct-form-item.scss';

export const GctFormItem = defineComponent({
  name: 'GctFormItem',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    formModel: {
      type: Object as PropType<IEditForm>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('gct-form-item');

    const style: IParams = {};

    if (props.formModel.labelWidth) {
      style[ns.cssVarName('form-item-label-width')] = props.formModel.labelWidth;
    }
    if (props.model.labelWidth) {
      style[ns.cssVarName('form-item-label-width')] = props.model.labelWidth;
    }
    if (props.model.labelAlign) {
      style[ns.cssVarName('form-item-label-align')] = props.model.labelAlign;
    }
    if (props.model.editorAlign) {
      style[ns.cssVarName('form-item-editor-align')] = props.model.editorAlign;
    }
    if (props.model.width) {
      style[ns.cssVarName('form-item-width')] = props.model.width;
    }
    if (props.model.margin) {
      style.margin = props.model.margin;
    }
    if (props.model.padding) {
      style.padding = props.model.padding;
    }

    const required = computed(() => {
      return !!props.model.rules?.find((item) => item.required);
    });

    const renderLabelTooltip = () => {
      if (!props.model.labelTooltip) {
        return null;
      }
      return (
        <a-tooltip
          class={ns.e('label-tooltip')}
          overlayClassName={ns.e('label-tooltip-overlay')}
          overlayStyle={{ width: props.model.labelTipWidth }}
          placement="top"
          title={props.model.labelTooltip}
        >
          <span class="iconfont icon-assist ml5px text-[#bfbfbf]"></span>
        </a-tooltip>
      );
    };

    return { ns, style, required, renderLabelTooltip };
  },
  render() {
    const provider = gct.register.editor.get(EditorRegisterConst.PREFIX + this.model.editor.type);
    if (!provider) {
      console.error(
        `未找到表单项${this.model.name}的编辑器${this.model.editor.type}的适配器实例：`,
        this.model,
      );
      return null;
    }
    const labelPosition = this.model.labelPosition || 'left';
    let content: any = null;
    if (provider) {
      if (provider.render) {
        content = provider.render(this.c.editorValue, this.c.data, this.model);
      } else {
        if (provider.component) {
          content = h(
            typeof provider.component === 'string'
              ? resolveComponent(provider.component)
              : provider.component,
            {
              key: this.model.name,
              c: this.c,
              value: this.c.editorValue,
              itemModel: this.model,
              model: this.model.editor,
              data: this.c.data,
              disabled: this.c.state.disabled,
              readonly: this.c.state.readonly,
              keepalive: this.c.state.keepalive,
              visible: this.c.state.visible,
              size: this.formModel.size,
              count: this.count,
              isEmptyText: this.formModel.isEmptyText,
              context: this.context,
              class: [
                this.ns.e('editor'),
                this.ns.e(labelPosition),
                this.formModel.size ? this.ns.m(this.formModel.size) : null,
                this.model.editor.class,
              ],
              style: this.model.editor.style,
              'onUpdate:value': (value: any) => {
                // eslint-disable-next-line vue/no-mutating-props
                this.c.editorValue = value;
              },
              onBlur: () => {
                this.c.blur();
              },
            },
          );
        } else {
          console.error(
            `未找到编辑器绘制组件：${this.model.name} - ${this.model.editor.type}，请实现 component 或 render 方法`,
          );
        }
      }
    } else {
      console.error(`未找到编辑器适配器：${this.model.name} - ${this.model.editor.type}`);
    }

    if (this.model.label && labelPosition === 'top') {
      content = [
        <div class={[this.ns.e('label'), this.ns.em('label', labelPosition)]}>
          {this.model.label}
          {this.renderLabelTooltip()}
        </div>,
        content,
      ];
    }

    const itemSlots: any = {
      default: () => {
        return content;
      },
    };

    if (labelPosition === 'left' && this.model.label) {
      itemSlots.label = () => {
        return [<span>{this.model.label}</span>, this.renderLabelTooltip()];
      };
    }
    if (this.c.state.visible === false) return;
    return (
      <a-form-item
        key={this.c.model.name}
        count={this.count}
        colon={this.formModel.noColon === true ? false : this.model.noColon === true ? false : true}
        name={this.model.name.split('.')}
        label={undefined}
        class={[
          this.ns.b(),
          this.ns.is('readonly', this.model.editor.readonly === true),
          this.ns.is('required', this.required),
          // this.ns.is('hidden', this.c.state.visible === false),
          this.ns.is('hidden-label', !this.model.label),
          this.ns.m('label-' + labelPosition),
          this.ns.is(
            'hidden-error',
            this.model.hiddenError === true || this.formModel.hiddenError === true,
          ),
        ]}
        style={this.style}
        rules={this.c.state.visible === true ? this.model.rules : []}
        layout="horizontal"
      >
        {itemSlots}
      </a-form-item>
    );
  },
});

export default GctFormItem;
