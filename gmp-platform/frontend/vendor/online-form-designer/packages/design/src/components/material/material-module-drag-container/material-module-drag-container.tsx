import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { MaterialModuleDragItem } from '../material-module-drag-item/material-module-drag-item';
import { IMaterialData } from '../../../interface';
import './material-module-drag-container.scss';

export const MaterialModuleDragContainer = defineComponent({
  name: 'MaterialModuleDragContainer',
  components: {
    MaterialModuleDragItem,
  },
  props: {
    items: {
      type: Array<IMaterialData>,
      default: () => [],
    },
  },
  setup() {
    const ns = useNamespace('material-module-drag-container');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.items.map((item) => (
          <MaterialModuleDragItem data={item} />
        ))}
      </div>
    );
  },
});
