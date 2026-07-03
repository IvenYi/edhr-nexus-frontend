<template>
  <a-tabs
    v-model:activeKey="activeKey"
    ref="tabRef"
    :type="['text', 'capsule', 'custom'].includes(type) ? 'card' : type"
    :tabBarGutter="computedTabBarGutter"
    :centered="centered"
    :destroyInactiveTabPane="destroyInactiveTabPane"
    :class="computedClass"
    @change="onChange"
  >
    <a-tab-pane
      :key="tab.id"
      :tab="type !== 'custom' ? tab.props.title : undefined"
      :forceRender="tab.props.forceRender"
      v-for="(tab, i) in newTabOptions"
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
      <div :style="styleAttr" :class="{ 'overflow-y-auto': !!tab.style.height }">
        <slot :children="tab.children"></slot>
      </div>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts" name="gct-tabs">
  import { Tabs } from '/@page-designer/types/web';
  import { ref, reactive, watchEffect, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IconNext } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { applyWidgetI18n } from '/@page-designer/components/widgets/hooks/utils';

  const { t } = useI18n();
  const Event = getPageEvent();
  const props = defineProps<{ widget: Tabs }>();
  const { children } = reactive(props.widget);
  const { defaultTag, type, tabBarGutter, tabBarGutterLine, centered, destroyInactiveTabPane } =
    reactive(props.widget.props);
  const tabOptions = useDependencyToShowList(children);
  const activeKey = ref(defaultTag);
  const newTabOptions = ref<LowCodeWidget.BasicSchema[]>([]);

  watch(
    tabOptions,
    (list) => {
      newTabOptions.value = list.map((i) => {
        applyWidgetI18n(i, t);
        return i;
      });
      if (!list.find((i) => i.id === activeKey.value)) {
        activeKey.value = list[0]?.id;
      }
    },
    {
      immediate: true,
    },
  );

  const styleAttr = computed(() => {
    const tab = children.filter((e) => e.id === activeKey.value)[0];
    return {
      minHeight: 'inherit',
      backgroundColor: tab.style.backgroundColor || 'transparent',
      height: tab.style.height ? tab.style.height + 'px' : 'auto',
      width: tab.style.width ? tab.style.width + 'px' : 'auto',
      paddingTop: (tab.style.paddingTop || 0) + 'px',
      paddingRight: (tab.style.paddingRight || 0) + 'px',
      paddingBottom: (tab.style.paddingBottom || 0) + 'px',
      paddingLeft: (tab.style.paddingLeft || 0) + 'px',
    };
  });

  const computedClass = computed(() => {
    return [`gct-ant-tabs-${type}`, computedTabBarGutter.value > 0 && 'tab-card-border'];
  });

  const computedTabBarGutter = computed(() => {
    if (['text', 'capsule'].includes(type)) {
      return 0;
    } else {
      return ['card', 'custom'].includes(type) ? tabBarGutter : tabBarGutterLine;
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

  const tabRef = ref(null);
  let resizeObserver = null;

  onMounted(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        tabRef.value?.$el?.querySelectorAll('.ant-tabs-tab-btn').forEach((element) => {
          element.style.maxWidth = `${width * 0.5}px`;
        });
      }
    });

    resizeObserver.observe(tabRef.value.$el);

    /**应用国际化 */
    for (let tab of tabOptions.value) {
      if (tab.i18n) {
        let i18n = tab.i18n;
        for (let k in i18n) {
          let i18nKey = i18n[k];
          tab.props[k] = t(i18nKey);
        }
      }
    }
  });

  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
  const onChange = (key) => {
    const index = tabOptions.value.findIndex((d) => {
      return d.id === key;
    });
    Event.runEventByName('afterActivatingTheTab', props.widget.events, index);
    /**保留老版本 */
    Event.runEventByName('onChange', props.widget.events, index);
  };

  defineExpose({
    setHiddenByKey(key: string, hidden: boolean) {
      children.forEach((i) => {
        if (i.id === key) {
          i.props.hidden = hidden;
        }
      });
    },
    changeTabById(id) {
      if (!id || id === activeKey.value) {
        return;
      }
      activeKey.value = id;
      onChange(id);
    },
    changeTabByIndex(index) {
      const target = tabOptions.value[index];
      if (!target || target.id === activeKey.value) {
        return;
      }
      activeKey.value = target.id;
      onChange(target.id);
    },
    getTabsOptions() {
      return tabOptions.value;
    },
    getActiveKeyInfo() {
      return {
        id: activeKey.value,
        index: tabOptions.value.findIndex((d) => {
          return d.id === activeKey.value;
        }),
      };
    },
  });
</script>

<style lang="less" scoped>
  .h300px {
    min-height: 300px;
  }

  .tip {
    text-align: center;
    // line-height: 300px;
  }

  :deep(.ant-tabs-nav .ant-tabs-nav-wrap) {
    // height: 40px;
    .ant-tabs-tab {
      margin-left: 20px;
      border-radius: 0;

      &:first-child {
        margin-left: 0;
      }

      & + .ant-tabs-tab {
        margin-left: 28px;
      }

      .ant-tabs-tab:not(:has(+ .ant-tabs-tab)) {
        margin-right: 1px;
      }
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

  :deep(.ant-tabs-content-holder) {
    // min-height: 100px;
  }

  :deep(.ant-tabs-tabpane) {
    // min-height: 300px;
    min-height: 100px;
  }

  :deep(.ant-tabs-content) {
    // min-height: 300px;
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
      // padding-right: 12px;
      // padding-left: 12px;
      // border-top: 0;
      // border-right: 0;
      // border-left: 0;
      // background-color: transparent;
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
      background-color: #fff;

      .ant-tabs-tab {
        padding: 10px 20px;
        // &:first-child {
        //   margin-left: 20px;
        // }
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

        &:not(:first-child)::before {
          content: '';
          display: block;
          width: 1px;
          height: 18px;
          margin-right: 20px;
          background-color: #e0e3ea;
        }

        &:first-child {
          margin: 0;
          padding-left: 20px;
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
      margin: 12px 0;

      &::before {
        border: none;
      }

      .ant-tabs-tab {
        padding: 0;
        border: none;

        .tab-pane-header {
          padding: 8px 16px;
          border-radius: 4px;
        }
      }
    }
  }
</style>
