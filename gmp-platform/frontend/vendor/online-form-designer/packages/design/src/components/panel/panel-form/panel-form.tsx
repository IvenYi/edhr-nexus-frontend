import { defineComponent, computed, ref } from 'vue';
import { IEditForm, useNamespace } from '@gct/runtime';
import { IDesignNode, IDesignNodeData } from '@gct/base';
import { useDesignViewController } from '../../../hooks';
import './panel-form.scss';

export const PanelForm = defineComponent({
  name: 'PanelForm',
  props: {
    model: {
      type: Object as PropType<IEditForm>,
      required: true,
    },
    node: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const ns = useNamespace('design-panel-form');

    const c = useDesignViewController();

    const data = ref<IDesignNode>(props.node);

    const formData = computed({
      get() {
        return data.value.data as IDesignNodeData;
      },
      set(val: IDesignNodeData) {
        Object.assign(data.value.data, val);
        console.debug('[ 保存的val ] >', data.value.data);
        c.store.updateNode(data.value);
      },
    });

    return { ns, data, formData };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form
          class="h-full"
          embed
          model={this.model}
          v-model:data={this.formData}
          context={{ ...this.context, id: undefined }}
        />
      </div>
    );
  },
});
