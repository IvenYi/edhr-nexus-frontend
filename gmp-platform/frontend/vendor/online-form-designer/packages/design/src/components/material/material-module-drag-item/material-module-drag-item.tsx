import { defineComponent, onMounted } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useDrag } from 'vue3-dnd';
import { IDragDataItem } from '@gct/base';
import { DesignViewPrefix } from '../../../constant';
import { IDragCollect, IDropResult, IMaterialData } from '../../../interface';
import { NodeRegister } from '../../../register';
import { useDesignViewController } from '../../../hooks';
import { getEmptyImage } from 'react-dnd-html5-backend';
import './material-module-drag-item.scss';

export const MaterialModuleDragItem = defineComponent({
  name: 'MaterialModuleDragItem',
  props: {
    data: {
      type: Object as PropType<IMaterialData>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('material-module-drag-item');

    const c = useDesignViewController();

    const [collect, drag, preview] = useDrag<IDragDataItem, IDropResult, IDragCollect>({
      type: DesignViewPrefix.CUSTOM_HOME,
      item: () => {
        const provider = NodeRegister.get(props.data.type, c.store.prefix);
        if (!provider) {
          throw new Error(`未找到素材 ${props.data.type} 适配器`);
        }
        c.store.setDragging(true);
        const data = provider.create();
        return {
          id: data.id,
          data,
          group: '',
          index: -1,
          mode: 'create',
          types: [data.type],
        };
      },
      collect: (monitor) => {
        return {
          canDrag: monitor.canDrag(),
          isDragging: monitor.isDragging(),
        };
      },
      end: async (_, monitor) => {
        c.store.setDragging(false);
        const r = monitor.getDropResult();
        if (r && r.asyncDrop) {
          const result = await r.asyncDrop;
          if (result && result.success) {
            // 执行成功
          }
        }
        c.dropEnd();
      },
      options: {
        dropEffect: 'copy',
      },
    });

    const setDrag = (div: HTMLDivElement) => {
      drag(div);
    };

    onMounted(() => {
      if (preview) {
        preview(getEmptyImage(), { captureDraggingState: true });
      }
    });

    return { ns, setDrag, collect };
  },
  render() {
    return (
      <div
        ref={this.setDrag as any}
        class={[this.ns.b(), this.ns.is('dragging', this.collect.isDragging)]}
      >
        <div class={this.ns.e('icon')}>
          <i class={['iconfont', this.data.icon]} />
        </div>
        <div class={this.ns.e('label')}>{this.data.label}</div>
      </div>
    );
  },
});
