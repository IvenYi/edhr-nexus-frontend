import { computed, defineComponent, inject, PropType } from 'vue';
import { LowCodeWidget, SCOPE, useNamespace } from '@gct/runtime';
import { useSelectedWidget } from '../../../hooks/useSelectedWidget';
import { IVue3DndItemOptions } from '../../interface';
import { DESIGN_TYPE, DesignItemAttribute } from '../../../constant';
import { clone } from 'lodash-es';
import './vue3-dnd-not-drag-item.scss';

export const Vue3DndNotDragItem = defineComponent({
  name: 'Vue3DndNotDragItem',
  props: {
    // 分组标识
    group: {
      type: String,
      required: true,
    },
    // 当前项下标
    index: {
      type: Number,
      required: true,
    },
    // 当前项数据
    item: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
      required: true,
    },
    // 父部件
    parentWidgets: {
      type: Array<LowCodeWidget.BasicSchema>,
      default: () => {
        return [];
      },
    },
    // 绘制的部件清单
    parentChildren: {
      type: Array<LowCodeWidget.BasicSchema>,
      required: true,
    },
    config: {
      type: Object as PropType<IVue3DndItemOptions>,
      required: true,
    },
    clone: {
      type: Function,
    },
    isSelect: {
      type: Boolean,
      default: true,
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const ns = useNamespace('vue3-dnd-item');

    const { setSelectedWidget, setSelectedParentWidgets, setSelectedConfig } = useSelectedWidget();

    const scope: SCOPE = inject('scope') || SCOPE.PAGE;

    const onActive = (e: MouseEvent) => {
      e.stopPropagation();
      setSelect();
    };

    const setSelect = () => {
      if (props.isSelect === false) {
        return;
      }
      setSelectedWidget(props.item, scope);
      setSelectedParentWidgets(props.parentWidgets);
      setSelectedConfig(clone(props.config));
      emit('select', props.item);
    };

    const displayName = computed(() => {
      if (props.item.formItem === true) {
        return `${props.item.alias}/${window.$t(
          `sys.component.dataConnection.modelField.${props.item.props.fieldType}`,
          ' ',
        )}`;
      }
      return props.item.alias;
    });

    return { ns, displayName, onActive };
  },
  render() {
    return (
      <div
        {...{
          [DesignItemAttribute.NODE_ID_TAG]: this.item.id,
          [DesignItemAttribute.ACTIVE_TAG]: true,
          [DesignItemAttribute.DESIGN_NAME]: this.displayName,
          [DesignItemAttribute.DRAG_GROUP_TYPE]: this.config.type ?? DESIGN_TYPE,
          [DesignItemAttribute.GROUP_TAG]: this.group,
          [DesignItemAttribute.INDEX_TAG]: this.index,
          [DesignItemAttribute.SELECTOR_INDEX]: this.config.selectorIndex ?? 0,
        }}
        class={[this.ns.b(), this.ns.is('not-drag', true)]}
        onClick={this.onActive}
      >
        {this.$slots.default?.()}
      </div>
    );
  },
});
