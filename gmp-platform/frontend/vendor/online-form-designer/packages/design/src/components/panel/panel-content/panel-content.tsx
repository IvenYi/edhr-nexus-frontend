import { defineComponent, computed } from 'vue';
import { IEditForm, useNamespace } from '@gct/runtime';
import { isFunction } from 'lodash-es';
import { PanelPath } from '../panel-path/panel-path';
import { PanelForm } from '../panel-form/panel-form';
import { useDesignViewController } from '../../../hooks';
import { NodeRegister } from '../../../register';
import './panel-content.scss';

export const PanelContent = defineComponent({
  name: 'PanelContent',
  props: {
    context: {
      type: Object as PropType<IContext>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const ns = useNamespace('panel-content');

    const c = useDesignViewController();

    const formModel = computed<IEditForm | null>(() => {
      if (c.store.selected) {
        const p = NodeRegister.get(c.store.selected.type, c.store.prefix);
        if (p) {
          if (isFunction(p.model)) {
            // 如果提供者的model是函数，则调用函数获取模型
            return p.model(props.context, c.store.selected);
          }
          return p.model;
        }
      }
      return null;
    });

    return { ns, c, formModel };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('paths')}>
          <PanelPath />
        </div>
        <div class={this.ns.e('content')}>
          {this.c.store.selected && this.formModel ? (
            <PanelForm
              key={this.c.store.selected.id}
              model={this.formModel!}
              node={this.c.store.selected}
              context={this.context}
            />
          ) : null}
        </div>
      </div>
    );
  },
});
