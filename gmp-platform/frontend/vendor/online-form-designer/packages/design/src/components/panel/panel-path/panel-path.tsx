import { defineComponent, nextTick, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IDesignNode } from '@gct/base';
import { useDesignViewController } from '../../../hooks';
import './panel-path.scss';

export const PanelPath = defineComponent({
  name: 'PanelPath',
  setup() {
    const ns = useNamespace('design-panel-path');

    const rootRef = ref<HTMLDivElement | null>(null);

    const c = useDesignViewController();

    const paths = ref<IDesignNode[]>([]);

    watch(
      () => c.store.selected,
      (val) => {
        if (val) {
          paths.value = c.store.getPaths(val.id);
        } else {
          paths.value = [];
        }
      },
    );

    watch(paths, () => {
      nextTick(() => {
        if (rootRef.value) {
          rootRef.value.scrollTo(rootRef.value.scrollWidth, 0);
        }
      });
    });

    const onActive = (item) => {
      c.store.setActive(item);
    };

    const onActivePage = () => {
      c.store.setActive(c.store.pageNode);
    };

    return { ns, c, rootRef, paths, onActive, onActivePage };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        <span class={this.ns.e('item')} onClick={this.onActivePage}>
          {this.c.store.rootExpLabel}
        </span>
        {this.paths.map((item) => (
          <>
            <span class={this.ns.e('arrow')}>
              <i class="iconfont icon-a-Rightarrow" />
            </span>
            <span class={this.ns.e('item')} onClick={() => this.onActive(item)}>
              {item.label}
            </span>
          </>
        ))}
      </div>
    );
  },
});
