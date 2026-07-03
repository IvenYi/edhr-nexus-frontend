import { defineComponent, PropType } from 'vue';
import { FieldIconMap, stopEvent, useNamespace } from '@gct/runtime';
import './toolkit-field-item.scss';

export const ToolkitFieldItem = defineComponent({
  name: 'ToolkitFieldItem',
  props: {
    element: {
      type: Object as PropType<any>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['delete', 'edit'],
  setup(props, { emit }) {
    const ns = useNamespace('toolkit-field-item');

    const t = window.$t;

    function edit(): void {
      emit('edit', props.element);
    }

    function deleteItem(): void {
      emit('delete', props.index, props.element);
    }

    return { ns, t, edit, deleteItem };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          'field-item',
          this.element.disabled ? 'widget-item--disabled' : 'widget-item--draggable',
        ]}
        data-fieldId={this.element.id}
        data-fieldType={this.element.type}
        data-preLocation={this.element.currentFormId}
        onClick={stopEvent}
      >
        <span class="field-icon">
          <i class={['iconfont', FieldIconMap[this.element.type] || 'icon-zidingyi']}></i>
        </span>
        {this.element.highlightName ? (
          <span
            class="field-title ks-col"
            title={this.element.name}
            v-html={this.element.highlightName}
          ></span>
        ) : (
          <span class="field-title" title={this.element.name}>
            {this.element.name}
          </span>
        )}
        {this.isCustom ? (
          <a-tooltip placement="top">
            {{
              title: () => this.t('sys.edit'),
              default: (
                <i
                  class="iconfont icon-bianji primary-gct-hover ml8px opt-icon"
                  onClick={this.edit}
                ></i>
              ),
            }}
          </a-tooltip>
        ) : null}
        {this.isCustom ? (
          <a-popconfirm
            placement="topLeft"
            title={this.t('sys.pageDesigner.confirmTodo')}
            onConfirm={this.deleteItem}
          >
            <a-tooltip placement="top">
              {{
                title: () => this.t('sys.delete'),
                default: () => (
                  <i class="iconfont icon-shanchu2 error-gct-hover ml8px opt-icon"></i>
                ),
              }}
            </a-tooltip>
          </a-popconfirm>
        ) : null}
      </div>
    );
  },
});
