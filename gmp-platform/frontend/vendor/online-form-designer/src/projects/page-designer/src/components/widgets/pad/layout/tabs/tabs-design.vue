<template>
  <van-tabs
    v-model:active="activeKey"
    v-bind="computedTabsAttr"
    ref="tabRef"
    shrink
    :type="type === tabsTypeENUM.LINE ? tabsTypeENUM.LINE : tabsTypeENUM.CARD"
    @click-tab="tabClick"
    :class="computedClass"
    :style="computedTabsStyle"
  >
    <van-tab
      :name="tab.id"
      :title="tab.props.title"
      v-for="(tab, index) in children"
      :key="tab.id + index"
      :title-style="computedTabTitleStyle"
      :class="{ 'min-h-187px': !tab.children?.length }"
    >
      <slot
        name="item"
        :parentWidget="widget"
        :children="widget.children"
        :widget="tab"
        :index="index"
        :config="{ isDrag: false, isDrop: false, isDelete: false }"
      ></slot>
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts" name="gct-tabs">
  import { Tabs } from '/@page-designer/types/mobile';
  import { toRefs, ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { tabsTypeENUM } from '/@page-designer/enum/designer';
  import tabPaneDesign from './component/tab-pane-design.vue';
  import { useTheme } from '/@/hooks/web/useTheme';
  import { useDesignerController } from '/@page-designer/hooks/useDesigner';

  const c = useDesignerController();

  const { themeVars } = useTheme();

  const { setSelectedWidget } = useSelectedWidget();
  const props = defineProps<{ widget: Tabs }>();
  const { children } = toRefs(props.widget);
  const { type, tabBarGutter, tabBarGutterLine, centered, destroyInactiveTabPane } = toRefs(
    props.widget.props,
  );
  const activeKey = ref(props.widget.props.defaultTag);
  const tab = children.value.filter((e) => e.id === activeKey.value)[0];

  function tabClick({ name, event }) {
    event.stopPropagation();
    const widget = children.value.find((i) => i.id === name);
    setTimeout(() => {
      c.setSelect(widget.id);
    });
  }

  const enableBGColor = computed(() => props.widget.style?.enableBGColor);

  const computedClass = computed(() => {
    let className = `tabs-${type.value}-class`;
    if (centered?.value) {
      className += ' gct-tabs-centered';
    }

    return className;
  });
  // const styleAttr = computed(() => {
  //   const tab = children.value.filter((e) => e.id === activeKey.value)[0];
  //   const { defineMode, color } = ((tab?.style as any)?.background as any) || {};
  //   const bgColor = defineMode === 'system' ? 'var(--van-primary-color)' : color;
  //   if (!tab) return {};
  //   return {
  //     minHeight: 'inherit',
  //     backgroundColor: bgColor,
  //     height: tab.style.height ? tab.style.height + 'px' : 'auto',
  //     width: tab.style.width ? tab.style.width + 'px' : 'auto',
  //     paddingTop: (tab.style.paddingTop || 0) + 'px',
  //     paddingRight: (tab.style.paddingRight || 0) + 'px',
  //     paddingBottom: (tab.style.paddingBottom || 0) + 'px',
  //     paddingLeft: (tab.style.paddingLeft || 0) + 'px',
  //   };
  // });
  const computedTabsAttr = computed(() => {
    let attr = {};
    attr = {
      'title-inactive-color': getTitleInactiveColor(),
      'title-active-color': getTitleActiveColor(),
      background:
        enableBGColor.value && type.value !== tabsTypeENUM.CARD
          ? themeVars.primaryColor
          : type.value !== tabsTypeENUM.CARD
          ? '#ffffff'
          : '#FAFAFA',
      shrink: true,
    };
    return attr;
  });

  const computedTabsStyle = computed(() => {
    let style = {};
    style = {
      '--van-tabs-default-color': getTabsDefaultColor(),
      '--van-tabs-card-height': '40px',
      '--van-padding-md': '0',
      '--van-tabs-bottom-bar-height': '2px',
      '--van-tabs-bottom-bar-width': '20px',
      '--van-tabs-bottom-bar-color': enableBGColor.value ? '#ffffff' : themeVars.primaryColor,
    };
    return style;
  });

  const computedTabTitleStyle = computed(() => {
    let style = '';
    if (!['text', 'capsule'].includes(type.value)) {
      style = `margin: 0 ${
        (type.value === tabsTypeENUM.LINE ? tabBarGutterLine.value : tabBarGutter.value) / 2
      }px;`;
    }
    return style;
  });

  const capsuleStyle = computed(() => {
    return {
      inactiveBGColor: enableBGColor.value ? '#D8E3FF2B' : '#dbdbdb23',
      activeBGColor: enableBGColor.value ? '#ffffff' : '#3370ff38',
    };
  });

  const tabRef = ref(null);
  let resizeObserver: ResizeObserver | null = null;

  function getTitleActiveColor() {
    if (enableBGColor.value) {
      return '#ffffff';
    }
    if (type.value === tabsTypeENUM.CAPSULE) {
      return '#ffffff';
    }
    return themeVars.primaryColor;
  }

  function getTitleInactiveColor() {
    if (enableBGColor.value) {
      if (type.value === tabsTypeENUM.CARD) {
        return themeVars.primaryColor;
      }
      return '#dcdee0';
    }
    if (type.value === tabsTypeENUM.CAPSULE) {
      return themeVars.primaryColor;
    }
    return '#333333';
  }

  function getTabsDefaultColor() {
    if (enableBGColor.value) {
      if (type.value === tabsTypeENUM.TEXt) {
        return themeVars.primaryColor;
      }
      return themeVars.primaryColor;
    }
    return '#ffffff';
  }

  onMounted(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        tabRef.value?.$el?.querySelectorAll('.van-tab__text').forEach((element) => {
          element.style.maxWidth = `${width * 0.5}px`;
        });
      }
    });

    resizeObserver.observe(tabRef.value.$el);
  });

  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
</script>

<style lang="less" scoped>
  .tabs-card-class,
  .tabs-line-class {
    :deep(.van-tabs__wrap) {
      box-sizing: border-box;
      height: 40px;
      border-top: 2px dashed #dbdbdb;
      border-right: 2px dashed #dbdbdb;
      border-left: 2px dashed #dbdbdb;
      // padding-top: 8px;

      .van-tabs__nav {
        border: 0;
      }
    }
  }

  :deep(.van-tab.van-tab--shrink) {
    // border: 0;

    span {
      max-width: 96px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:first-child {
      margin-left: 0 !important;
    }

    &:last-child {
      margin-right: 0 !important;
    }
  }

  :deep(.van-tabs__content) {
    // min-height: 187px;

    .van-tab__panel {
      // min-height: 187px;
      padding: v-bind("(tab.style.paddingTop || 0) + 'px'")
        v-bind("(tab.style.paddingRight || 0) + 'px'")
        v-bind("(tab.style.paddingBottom || 0) + 'px'")
        v-bind("(tab.style.paddingLeft || 0) + 'px'");

      > .gct-vue3-dnd-item {
        min-height: inherit;
      }
    }
  }

  .tabs-text-class,
  .tabs-capsule-class {
    :deep(.van-tabs__wrap) {
      .van-tabs__nav {
        height: 100%;
        margin: 0;
      }
    }
  }

  .tabs-capsule-class {
    :deep(.van-tabs__wrap) {
      height: 32px;
      border: none;

      .van-tabs__nav {
        height: 100%;
        border: none;

        .van-tab {
          // margin-top: 8px;
          // margin-bottom: 8px;
          padding: 0 20px;
          border: 1px solid var(--ant-primary-color);
          background: #fff;
          color: var(--van-primary-color);
          font-weight: 400;

          &:first-child {
            border-top-left-radius: 4px !important;
            border-bottom-left-radius: 4px !important;
          }

          &--active {
            background: var(--van-primary-color);
            color: #fff;
          }

          &:only-child {
            border-radius: 4px !important;
          }
        }

        .van-tab:not(:has(+ .van-tab)) {
          border: 1px solid var(--van-primary-color);
          border-top-right-radius: 4px !important;
          border-bottom-right-radius: 4px !important;
        }
      }
    }
  }

  .tabs-text-class {
    :deep(.van-tabs__wrap) {
      height: 33.6px;

      .van-tabs__nav {
        border: none;

        .van-tab {
          padding: 0 20px;
        }

        .van-tab--card {
          border: none;
          font-size: 14px;

          &:not(:first-child) {
            padding-left: 0;
          }

          &:not(:first-child)::before {
            content: '';
            display: block;
            width: 1px;
            height: 18px;
            margin-right: 12px;
            background-color: #e0e3ea;
          }

          &.van-tab--active {
            font-weight: 400;
            text-shadow: none;
          }
        }
      }
    }
  }

  .tabs-line-class {
    :deep(.van-tabs__wrap::before) {
      content: '';
      position: absolute;
      top: 44px;
      left: 0;
      box-sizing: border-box;
      width: 100%;
      border-bottom: 1px solid #eaeaea;
    }

    :deep(.van-tabs__wrap) {
      height: 44px;
      padding-top: 0;

      .van-tabs__nav {
        height: 42px;
        padding: 0 12px;

        .van-tab {
          padding-right: 16px;
          padding-left: 16px;
        }
      }
    }

    :deep(.van-tabs__line) {
      display: none;
      bottom: 0;
    }

    :deep(.van-tab--active) {
      border-bottom: 2px solid var(--van-primary-color) !important;
    }

    :deep(.van-tab.van-tab--shrink) {
      padding-right: 0;
      padding-left: 0;
    }
  }

  .tabs-card-class {
    :deep(.van-tabs__wrap) {
      height: 40px;
      border-bottom: 1px solid #e0e3eb;
    }

    :deep(.van-tab) {
      padding-right: 16px;
      padding-left: 16px;
      border: 1px solid #e0e3eb;
      background: #f7f8fa;
    }

    :deep(.van-tab--active) {
      border: 1px solid #f0f0f0;
      background-color: #fff;
      // border-bottom: 0;
      font-weight: normal;

      &:first-child {
        border-left: 0;
      }

      &:last-child {
        border-right: 0;
      }
    }
  }

  :deep(.van-tabs__nav--card.van-tabs__nav--shrink) {
    // card不能滑动问题
    display: flex;
  }

  .gct-tabs-centered {
    & > :deep(.van-tabs__wrap) {
      & > .van-tabs__nav {
        justify-content: center;
      }
    }
  }
</style>
