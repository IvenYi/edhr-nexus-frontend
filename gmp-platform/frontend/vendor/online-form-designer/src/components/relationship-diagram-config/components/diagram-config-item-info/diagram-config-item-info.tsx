import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IRelationshipDiagramNode } from '../../interface';
import './diagram-config-item-info.scss';

/**
 * 节点容器
 */
export const DiagramConfigItemInfo = defineComponent({
  name: 'DiagramConfigItemInfo',
  props: {
    i: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<IRelationshipDiagramNode>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('diagram-config-item-info');

    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-select>
          <a-select-option value="1">{this.data.id}</a-select-option>
          <a-select-option value="2">{this.i}</a-select-option>
        </a-select>
      </div>
    );
  },
});

export default DiagramConfigItemInfo;
