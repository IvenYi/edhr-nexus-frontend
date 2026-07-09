import { defineComponent, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IMobileHomeMenuItem } from '@gct/base';
import { useDesignViewController } from '../../../hooks';
import './design-custom-exp-menu-component.scss';

export const DesignCustomExpMenuComponent = defineComponent({
  name: 'DesignCustomExpMenuComponent',
  setup() {
    const ns = useNamespace('design-custom-exp-menu-component');

    const c = useDesignViewController();

    const tabs = computed<IMobileHomeMenuItem[]>(() => {
      const items = c.store.pageNode?.data.menus || [];
      return items.filter((_) => _.isHidden !== true);
    });

    const activeTab = computed<number>(() => {
      return -1;
    });

    const labelStyle = computed(() => {
      let fontWeight = '';
      switch (c.store.pageNode?.data.fontWeight) {
        case 1:
          fontWeight = '100';
          break;
        case 2:
          fontWeight = '300';
          break;
        case 3:
          fontWeight = '400';
          break;
        case 4:
          fontWeight = '700';
          break;
        case 5:
          fontWeight = '900';
          break;
        default:
          fontWeight = '400';
      }
      return {
        'font-weight': fontWeight,
      };
    });

    return { ns, tabs, activeTab, labelStyle };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('preview')}></div>
        <div class={this.ns.e('menus')}>
          <van-tabbar fixed={false} v-model={this.activeTab}>
            {this.tabs.map((tab) => {
              return (
                <van-tabbar-item>
                  {{
                    default: () => {
                      return (
                        <span class={this.ns.e('label')} style={this.labelStyle}>
                          {tab.label}
                        </span>
                      );
                    },
                    icon: () => {
                      if (!tab.icon) {
                        return;
                      }
                      return (
                        <span class={this.ns.e('icon')}>
                          {tab.icon.icon.startsWith('iconfont:') ? (
                            <i class={`iconfont ${tab.icon.icon.replace('iconfont:', '')}`} />
                          ) : (
                            <icon-next value={tab.icon.icon} color={tab.icon.color} size={18} />
                          )}
                        </span>
                      );
                    },
                  }}
                </van-tabbar-item>
              );
            })}
          </van-tabbar>
        </div>
      </div>
    );
  },
});
