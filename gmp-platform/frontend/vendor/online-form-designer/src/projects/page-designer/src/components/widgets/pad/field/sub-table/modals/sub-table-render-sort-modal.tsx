import { defineComponent } from 'vue';
import { IRenderOptions, useNamespace, Vue3DndDraggable } from '@gct/runtime';
import { DndProvider } from 'vue3-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import './sub-table-render-sort-modal.scss';

export const SubTableRenderSortModal = defineComponent({
  name: 'SubTableRenderSortModal',
  props: {
    title: {
      type: String,
      default: '',
    },
    show: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array<any>,
      default: () => [],
    },
    column: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const ns = useNamespace('sub-table-render-sort-modal');

    console.log('sub-table-render-sort-modal', props);

    const onClose = (e: MouseEvent) => {
      e.stopPropagation();
      emit('close', props.items);
    };

    return { ns, onClose };
  },
  render() {
    return (
      <van-dialog class={this.ns.b()} teleport="body" lazy-render show={this.show}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('title')}>{this.title}</div>
          <div class={this.ns.e('close')} onClick={this.onClose}>
            完成
          </div>
        </div>
        <div class={this.ns.e('content')}>
          {this.show ? (
            <DndProvider backend={TouchBackend}>
              <Vue3DndDraggable
                items={this.items}
                opts={{
                  key: 'id_',
                  type: 'sub-table-render-sort-modal',
                  direction: 'vertical',
                  isCustomHandle: true,
                  handle: `.${this.ns.be('drag-item', 'drag')}`,
                }}
              >
                {{
                  draggableItem: ({ item }: IRenderOptions<any>) => {
                    return (
                      <div key={item.id_} class={this.ns.b('drag-item')}>
                        <span class={this.ns.be('drag-item', 'label')}>
                          {this.column.alias}:&nbsp;{item[this.column.props.field]}
                        </span>
                        <span class={this.ns.be('drag-item', 'drag')}>
                          <van-icon name="wap-nav" />
                        </span>
                      </div>
                    );
                  },
                }}
              </Vue3DndDraggable>
            </DndProvider>
          ) : null}
        </div>
      </van-dialog>
    );
  },
});
