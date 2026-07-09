import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { MaterialModuleDragContainer } from '../material-module-drag-container/material-module-drag-container';
import { MaterialRegister } from '../../../register';
import { useDesignViewController } from '../../../hooks';
import { IMaterialGroup } from '../../../interface';
import './material-module.scss';

/**
 * 素材区组件模块绘制
 */
export const MaterialModule = defineComponent({
  name: 'MaterialModule',
  components: {
    MaterialModuleDragContainer,
  },
  setup() {
    const ns = useNamespace('material-module');

    const c = useDesignViewController();

    const search = ref<string>('');

    const items = MaterialRegister.getList(c.store.prefix).filter((_) => {
      return _.children && _.children.length > 0;
    });

    const activeKey = ref<string[]>(items.map((item) => item.tag));

    const groups = computed<IMaterialGroup[]>(() => {
      const arr: IMaterialGroup[] = [];
      const val = search.value.trim();
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const children = item.children.filter((_) => {
            return _.label.includes(val);
          });
          if (children.length > 0) {
            arr.push({ ...item, children });
          }
        }
      });
      return arr;
    });

    return { ns, search, groups, activeKey };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('search')}>
          <a-input v-model:value={this.search} size="small" placeholder="搜索名称">
            {{
              suffix: () => (
                <span class={this.ns.e('search-icon')}>
                  <i class="iconfont icon-sousuo" />
                </span>
              ),
            }}
          </a-input>
        </div>
        <div class={this.ns.e('content')}>
          <a-collapse v-model:activeKey={this.activeKey} ghost>
            {{
              expandIcon: ({ isActive }) => {
                return <i class={['iconfont', isActive ? 'icon-Down' : 'icon-right']} />;
              },
              default: () => {
                return this.groups.map((_) => {
                  return (
                    <a-collapse-panel key={_.tag} header={_.label}>
                      <MaterialModuleDragContainer items={_.children} />
                    </a-collapse-panel>
                  );
                });
              },
            }}
          </a-collapse>
        </div>
      </div>
    );
  },
});
