import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { Tabs } from '/@/projects/page-designer/src/types/web';
import { toRefs } from '@vueuse/core';
import { useMitt } from '/@/projects/page-designer/src/hooks/useMitt';
import './tabs-design2.scss';

export const TabsDesign2 = defineComponent({
  name: 'TabsDesign2',
  props: {
    widget: {
      type: Object as PropType<Tabs>,
      required: true,
    },
    isNewDesigner: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['tabClick'],
  setup(props, { emit }) {
    const ns = useNamespace('tabs-design2');

    const { mitt } = useMitt();

    const activeKey = ref(props.widget.props.defaultTag);

    const { type, tabBarGutter, tabBarGutterLine, centered, destroyInactiveTabPane } = toRefs(
      props.widget.props,
    );

    const computedClass = computed(() => {
      return [
        `gct-ant-tabs-${type.value}`,
        computedTabBarGutter.value > 0 && 'tab-card-border',
        ns.b(),
      ];
    });

    const computedTabBarGutter = computed(() => {
      if (['text', 'capsule'].includes(type.value)) {
        return 0;
      } else {
        return type.value === 'card' ? tabBarGutter.value : tabBarGutterLine.value;
      }
    });

    function tabClick(...args): void {
      emit('tabClick', ...args);
    }

    const tabRef = ref<any>(null);
    let resizeObserver: ResizeObserver | null = null;

    onMounted(() => {
      mitt.on('tabs-change-selected', (selectedObj) => {
        const data = selectedObj as IObject;
        if (data && data.tabId === props.widget.id && data.selectedKey) {
          activeKey.value = data.selectedKey;
        }
      });
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          tabRef.value?.$el?.querySelectorAll('.ant-tabs-tab-btn').forEach((element) => {
            element.style.maxWidth = `${width * 0.5}px`;
          });
        }
      });

      resizeObserver.observe(tabRef.value?.$el);
    });

    onBeforeUnmount(() => {
      mitt.off('tabs-change-selected');
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    const computedChild = computed(() => {
      return props.widget.children;
    });

    watch(computedChild.value, () => {
      if (tabRef?.value?.$el) {
        const { width } = tabRef.value.$el.getBoundingClientRect();

        tabRef.value?.$el?.querySelectorAll('.ant-tabs-tab-btn').forEach((element) => {
          element.style.maxWidth = `${width * 0.5}px`;
        });
      }
    });

    return {
      ns,
      activeKey,
      tabRef,
      type,
      tabBarGutter,
      tabBarGutterLine,
      centered,
      destroyInactiveTabPane,
      computedClass,
      computedTabBarGutter,
      computedChild,
      tabClick,
    };
  },
  render() {
    return this.$slots.container?.({
      parentWidget: this.widget,
      children: this.computedChild,
      config: { direction: 'horizontal' },
      content: (
        <a-tabs
          ref="tabRef"
          v-model:activeKey={this.activeKey}
          type={['text', 'capsule'].includes(this.type) ? 'card' : this.type}
          tabBarGutter={this.computedTabBarGutter}
          centered={this.centered}
          destroyInactiveTabPane={this.destroyInactiveTabPane}
          onTabClick={this.tabClick}
          class={this.computedClass}
        >
          {this.computedChild?.map((tab, i) => {
            return (
              <a-tab-pane key={tab.id} tab={tab.props.title} forceRender>
                {this.$slots.item?.({
                  parentWidget: this.widget,
                  children: this.computedChild,
                  widget: tab,
                  index: i,
                  config: { direction: 'horizontal' },
                })}
              </a-tab-pane>
            );
          })}
        </a-tabs>
      ),
    });
  },
});
