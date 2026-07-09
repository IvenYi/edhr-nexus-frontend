<template>
  <a-tabs
    v-model:activeKey="activeKey"
    ref="tabRef"
    :type="['text', 'capsule', 'custom'].includes(type) ? 'card' : type as string"
    :tabBarGutter="computedTabBarGutter"
    :centered="centered"
    :destroyInactiveTabPane="destroyInactiveTabPane"
    @tabClick="tabClick"
    :class="computedClass"
  >
    <a-tab-pane
      :key="tab.id"
      :tab="type !== 'custom' ? tab.props.title : undefined"
      v-for="(tab, i) in computedChild"
      forceRender
    >
      <template #tab v-if="type === 'custom'">
        <span class="tab-pane-header flex items-center" :style="getCustomTabHeaderStyle(tab, i)">
          <IconNext
            :value="getCustomTabConfig(tab, i, 'logo')"
            :color="getCustomTabConfig(tab, i, 'color')"
            class="mr-2"
          />
          {{ tab.props.title }}
        </span>
      </template>
      <tabPaneDesign
        v-if="!isNewDesigner"
        :parent-drag-widgets="tab.children"
        :widget="tab"
        :parent-list="widget.children"
        :index-of-parent-list="i"
        :parent-widget="widget"
      />
      <slot
        v-if="isNewDesigner"
        name="item"
        :parentWidget="widget"
        :children="computedChild"
        :widget="tab"
        :index="i"
        :config="{ isDrag: false, isDrop: false, isDelete: false }"
      ></slot>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="tsx" name="gct-tabs">
  import { Tabs } from '/@page-designer/types/web';
  import { toRefs, ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import tabPaneDesign from './component/tab-pane-design.vue';
  import { IconNext } from '/@/components/Icon';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { useDesignerController } from '/@page-designer/hooks/useDesigner';

  const c = useDesignerController();

  const { setSelectedWidget } = useSelectedWidget();
  const props = defineProps<{ widget: Tabs; isNewDesigner: boolean }>();
  const { id, children } = props.widget;
  const { type, tabBarGutter, tabBarGutterLine, centered, destroyInactiveTabPane } = toRefs(
    props.widget.props,
  );
  const activeKey = ref(props.widget.props.defaultTag);
  const { mitt } = useMitt();

  const tabRef = ref<any>(null);
  let resizeObserver: ResizeObserver | null = null;
  const tab = children.filter((e) => e.id === activeKey.value)[0];

  onMounted(() => {
    if (!props.isNewDesigner) {
      mitt.on('tabs-change-selected', (selectedObj: any) => {
        if (selectedObj && selectedObj.tabId === id && selectedObj.selectedKey) {
          activeKey.value = selectedObj.selectedKey;
        }
      });
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width } = entry.contentRect;
          tabRef.value?.$el?.querySelectorAll('.ant-tabs-tab-btn').forEach((element) => {
            element.style.maxWidth = `${width * 0.5}px`;
          });
        }
      });

      resizeObserver.observe(tabRef.value.$el);
    }
  });

  onBeforeUnmount(() => {
    if (!props.isNewDesigner) {
      mitt.off('tabs-change-selected');
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    }
  });

  function tabClick(key) {
    if (props.isNewDesigner) {
      c.setSelect(key);
      return;
    }
    const widget = computedChild.value.find((i) => i.id === key);
    setSelectedWidget(widget);
  }

  const computedChild = computed(() => {
    return props.widget.children;
  });

  watch(computedChild.value, () => {
    if (tabRef?.value?.$el && !props.isNewDesigner) {
      const { width } = tabRef.value.$el.getBoundingClientRect();

      tabRef.value?.$el?.querySelectorAll('.ant-tabs-tab-btn').forEach((element) => {
        element.style.maxWidth = `${width * 0.5}px`;
      });
    }
  });

  const computedClass = computed(() => {
    return [`gct-ant-tabs-${type.value}`, computedTabBarGutter.value > 0 && 'tab-card-border'];
  });

  const computedTabBarGutter = computed(() => {
    if (['text', 'capsule'].includes(type.value)) {
      return 0;
    } else {
      return ['card', 'custom'].includes(type.value) ? tabBarGutter.value : tabBarGutterLine.value;
    }
  });

  const computedCustomConfigs = computed(() => {
    return props.widget.props.customConfig ?? [];
  });

  function getCustomTabHeaderStyle(tab, index) {
    return {
      color: getCustomTabConfig(tab, index, 'color'),
      background: getCustomTabConfig(tab, index, 'background'),
    };
  }

  function getCustomTabConfig(tab, index: number, type: string): string {
    const isActive = tab.id === activeKey.value;
    const configType = isActive ? 'active' : 'inactive';
    return computedCustomConfigs.value?.[index]?.[configType]?.[type];
  }
</script>

<style lang="less" scoped>
  .ant-tabs {
    min-width: 100px;
  }

  .is-selected {
    // border: 1px solid var(--ant-primary-color) !important;
    // background-color: rgb(13 170 156 / 10%) !important;
  }

  .h300px {
    min-height: 300px;
  }

  .tip {
    text-align: center;
    // line-height: 300px;
  }

  :deep(.ant-tabs-nav .ant-tabs-nav-wrap) {
    // height: 40px;
    border-top: 2px dashed #dbdbdb;
    border-left: 2px dashed #dbdbdb;
    border-right: 2px dashed #dbdbdb;
    .ant-tabs-tab {
      margin-left: 20px;

      &:first-child {
        margin-left: 0;
      }

      & + .ant-tabs-tab {
        margin-left: 28px;
      }
    }

    .ant-tabs-tab:not(:has(+ .ant-tabs-tab)) {
      margin-right: 1px;
    }
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;

    .ant-tabs-nav-more {
      padding: 0 14px;
    }
  }

  :deep(.ant-tabs-tab .ant-tabs-tab-btn) {
    max-width: 109px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.ant-tabs-tabpane) {
    min-height: 100px;

    > .gct-vue3-dnd-not-drag-item,
    > .gct-vue3-dnd-item {
      min-height: inherit;
    }
  }

  :deep(.ant-tabs-nav .ant-tabs-tab) {
    font-size: 14px;
  }

  .gct-ant-tabs-card {
    :deep(.ant-tabs-nav .ant-tabs-nav-wrap) {
      padding: 0;
    }

    :deep(.ant-tabs-nav .ant-tabs-tab) {
      padding: 0;
      padding: 9px 20px;
      border-radius: 0;
      & + .ant-tabs-tab {
        border-left-width: 0;
      }
    }

    :deep(.ant-tabs-nav .ant-tabs-tab-active) {
      border: 1px solid #f0f0f0;
      border-bottom-color: transparent;
      background-color: #fff;
    }

    :deep(.ant-tabs-content) {
      border: 1px solid #f0f0f0;
      border-top-color: transparent;
      padding-top: v-bind("(tab.style.paddingTop || 0) + 'px'");
      padding-right: v-bind("(tab.style.paddingRight || 0) + 'px'");
      padding-bottom: v-bind("(tab.style.paddingBottom || 0) + 'px'");
      padding-left: v-bind("(tab.style.paddingLeft || 0) + 'px'");
    }

    :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
      text-shadow: unset;
    }

    &.tab-card-border {
      :deep(.ant-tabs-nav .ant-tabs-tab + .ant-tabs-tab) {
        border-left-width: 1px;
      }
    }
  }

  .gct-ant-tabs-line {
    :deep(.ant-tabs-nav) {
      .ant-tabs-tab {
        padding: 10px 20px;
      }
    }
  }

  .gct-ant-tabs-text {
    :deep(.ant-tabs-nav) {
      .ant-tabs-nav-more {
        padding: 5px 9px;
      }

      &::before {
        border: none;
      }

      .ant-tabs-tab {
        padding: 5px 20px 5px 0;
        border: none;
        background: #fff;
        font-size: 14px;

        &:first-child {
          margin: 0;
          padding-left: 20px;
        }

        &:not(:first-child)::before {
          content: '';
          display: block;
          width: 1px;
          height: 18px;
          margin-right: 20px;
          background-color: #e0e3ea;
        }

        .ant-tabs-tab-btn {
          color: #797a7d;
          font-size: 14px;

          &:hover {
            color: var(--ant-primary-color);
          }
        }

        &.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--ant-primary-color);
          text-shadow: none;
        }
      }
    }
  }

  .gct-ant-tabs-capsule {
    :deep(.ant-tabs-nav) {
      .ant-tabs-nav-more {
        padding: 5px 9px;
      }

      &::before {
        border: none;
      }

      .ant-tabs-tab {
        padding: 4px 20px;
        border: 1px solid var(--ant-primary-color);
        border-right: none;
        border-radius: 0 !important;
        background-color: #fff;
        color: var(--ant-primary-color);
        font-size: 14px;

        &:first-child {
          border-top-left-radius: 4px !important;
          border-bottom-left-radius: 4px !important;
        }

        .ant-tabs-tab-btn {
          color: var(--ant-primary-color);
          font-size: 14px;
        }

        &:hover {
          background-color: hsl(from var(--ant-primary-color) h s 95%);
        }

        &.ant-tabs-tab-active {
          border-bottom: 1px solid var(--ant-primary-color);
          background-color: var(--ant-primary-color);

          .ant-tabs-tab-btn {
            color: #fff;
            text-shadow: none;
          }
        }
      }

      .ant-tabs-tab:not(:has(+ .ant-tabs-tab)) {
        border: 1px solid var(--ant-primary-color);
        border-top-right-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
      }
    }
  }

  .gct-ant-tabs-custom {
    :deep(.ant-tabs-nav) {
      &::before {
        border: none;
      }
      margin: 12px 0;

      .ant-tabs-tab {
        border: none;
        padding: 0;

        .tab-pane-header {
          padding: 8px 16px;
          border-radius: 4px;
        }
      }
    }
  }
</style>
