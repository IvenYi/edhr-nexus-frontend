<template>
  <van-tabs
    v-model:active="activeIndex"
    v-bind="computedTabsAttr"
    ref="tabRef"
    shrink
    :type="type === tabsTypeENUM.LINE ? tabsTypeENUM.LINE : tabsTypeENUM.CARD"
    :class="computedClass"
    :style="computedTabsStyle"
    @click-tab="onChange"
    :lazy-render="false"
  >
    <van-tab
      v-for="(tab, index) in tabOptions"
      :name="index"
      :title="tab.props.title"
      :key="tab.id"
      :title-style="computedTabTitleStyle"
    >
      <div
        :style="styleAttr"
        v-if="activeKey === tab.id || tab.props.forceRender || checkedKeyMaps[tab.id]"
      >
        <slot :children="tab.children"></slot>
      </div>
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts" name="gct-tabs">
  import { Tabs } from '/@page-designer/types/mobile';
  import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useDependencyToShowList } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import { tabsTypeENUM } from '/@page-designer/enum/designer';
  import { useplatSetting } from '@mobile/utils/useplatSetting';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const Event = getPageEvent();
  const props = defineProps<{ widget: Tabs }>();
  const { children } = reactive(props.widget);
  const { themeSetting } = useplatSetting();
  const checkedKeyMaps = ref({});
  const { defaultTag, type, tabBarGutter, tabBarGutterLine, centered, destroyInactiveTabPane } =
    reactive(props.widget.props);
  const tabOptions = useDependencyToShowList(children);
  const activeKey = ref(defaultTag);
  const activeIndex = ref(0);

  const enableBGColor = computed(() => props.widget.style?.enableBGColor);

  watch(
    tabOptions,
    (list) => {
      if (!list.find((i) => i.id === activeKey.value)) {
        activeKey.value = list[0]?.id;
        activeIndex.value = 0;
      } else {
        activeIndex.value = list.findIndex((i) => i.id === activeKey.value);
      }
    },
    {
      immediate: true,
    },
  );
  const styleAttr = computed(() => {
    const tab = children.filter((e) => e.id === activeKey.value)[0];
    const { defineMode, color } = ((tab?.style as any)?.background as any) || {};
    const bgColor = defineMode === 'system' ? 'var(--van-primary-color)' : color;
    if (!tab) return {};
    return {
      minHeight: 'inherit',
      backgroundColor: bgColor,
      height: tab.style.height ? tab.style.height + 'px' : 'auto',
      width: tab.style.width ? tab.style.width + 'px' : 'auto',
      paddingTop: (tab.style.paddingTop || 0) + 'px',
      paddingRight: (tab.style.paddingRight || 0) + 'px',
      paddingBottom: (tab.style.paddingBottom || 0) + 'px',
      paddingLeft: (tab.style.paddingLeft || 0) + 'px',
    };
  });
  defineExpose({
    setHiddenByKey(key: string, hidden: boolean) {
      children.forEach((i) => {
        if (i.id === key) {
          i.props.hidden = hidden;
        }
      });
    },
    getActiveIndex() {
      return activeIndex.value;
    },
  });
  const onChange = ({ name: index, title }) => {
    activeIndex.value = index;
    activeKey.value = tabOptions.value[index].id;
    Event.runEventByName('onChange', props.widget.events, index, title);
    Event.runEventByName('afterActivatingTheTab', props.widget.events, index);
    checkedKeyMaps.value[activeKey.value] = !destroyInactiveTabPane;
  };
  const computedClass = computed(() => {
    let className = `tabs-${type}-class`;
    if (centered && !isOverScreen.value) {
      className += ' gct-tabs-centered';
    }

    return className;
  });

  const computedTabsAttr = computed(() => {
    let attr = {};
    attr = {
      'title-inactive-color': getTitleInactiveColor(),
      'title-active-color': getTitleActiveColor(),
      background:
        enableBGColor.value && type !== tabsTypeENUM.CARD
          ? themeSetting.primaryColor
          : type !== tabsTypeENUM.CARD
          ? '#ffffff'
          : '#FAFAFA',
    };
    return attr;
  });

  const computedTabsStyle = computed(() => {
    let style = {};
    style = {
      '--van-tabs-default-color': getTabsDefaultColor(),
      '--van-padding-md': '0',
      '--van-tabs-bottom-bar-height': '2px',
      '--van-tabs-bottom-bar-width': '20px',
      '--van-tabs-card-height': '40px',
      '--van-tabs-bottom-bar-color': enableBGColor.value ? '#ffffff' : themeSetting.primaryColor,
    };
    return style;
  });

  const computedTabTitleStyle = computed(() => {
    let style = '';
    if (!['text', 'capsule'].includes(type)) {
      style = `margin: 0 ${(type === tabsTypeENUM.LINE ? tabBarGutterLine : tabBarGutter) / 2}px;`;
    }
    return style;
  });

  const capsuleStyle = computed(() => {
    return {
      inactiveBGColor: enableBGColor.value ? '#D8E3FF2B' : '#dbdbdb23',
      activeBGColor: enableBGColor.value ? '#ffffff' : '#3370ff38',
    };
  });

  function getTitleActiveColor() {
    if (enableBGColor.value) {
      if (type === tabsTypeENUM.CAPSULE) {
        return themeSetting.primaryColor;
      }
      return '#ffffff';
    }
    return themeSetting.primaryColor;
  }

  function getTitleInactiveColor() {
    if (enableBGColor.value) {
      if (type === tabsTypeENUM.CARD) {
        return themeSetting.primaryColor;
      }
      return '#dcdee0';
    }
    return '#333333';
  }

  function getTabsDefaultColor() {
    if (enableBGColor.value) {
      if (type === tabsTypeENUM.TEXt) {
        return themeSetting.primaryColor;
      }
      return themeSetting.primaryColor;
    }
    return '#ffffff';
  }

  const tabRef = ref(null);
  const isOverScreen = ref(false);
  let resizeObserver = null;

  onMounted(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        let totalWidth = 0;
        tabRef.value?.$el?.querySelectorAll('.van-tab').forEach((element) => {
          element.querySelector('.van-tab__text').style.maxWidth = `${width * 0.5}px`;
          totalWidth += element.getBoundingClientRect().width;
        });
        isOverScreen.value = document.body.getBoundingClientRect().width - 32 < totalWidth;
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
  .is-selected {
    border: 1px solid var(--van-primary-color) !important;
    background-color: rgb(13 170 156 / 10%) !important;
  }

  .tabs-card-class,
  .tabs-line-class {
    :deep(.van-tabs__wrap) {
      box-sizing: border-box;
      // height: 9.7vw !important;
      // padding-top: 2vw;
      // background-color: #fafafa;

      .van-tabs__nav {
        border: 0;
      }
    }

    // :deep(.van-tab--card) {
    //   height: 7.8vw;
    // }
  }

  :deep(.van-tab.van-tab--shrink) {
    border: 0;

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
    }
  }

  .tabs-line-class {
    :deep(.van-tabs__wrap::before) {
      content: '';
      position: absolute;
      top: 9.7vw;
      left: 0;
      box-sizing: border-box;
      width: 100%;
      border-bottom: 1px solid #eaeaea;
    }

    :deep(.van-tabs__wrap) {
      height: 9.7vw;
      padding-top: 0;

      .van-tabs__nav {
        height: 9.7vw;
        padding: 0 12px;
      }
    }

    :deep(.van-tabs__line) {
      bottom: 0;
      // display: none;
      // background-color: var(--van-primary-color);
    }

    // :deep(.van-tab--active) {
    //   border-bottom: 2px solid var(--van-primary-color) !important;
    // }

    :deep(.van-tab.van-tab--shrink) {
      padding-right: 0;
      padding-left: 0;
    }
  }

  .tabs-text-class,
  .tabs-capsule-class {
    :deep(.van-tabs__wrap) {
      height: 40px;

      .van-tabs__nav {
        height: 100%;
        margin: 0;
      }
    }
  }

  .tabs-text-class {
    :deep(.van-tabs__wrap) {
      .van-tabs__nav {
        border: none;

        .van-tab--card {
          border: none;
          color: #797a7d;
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
            // background-color: #fff;
            // color: var(--van-primary-color);
            text-shadow: none;
          }
        }
      }
    }
  }

  .tabs-capsule-class {
    :deep(.van-tabs__wrap) {
      height: 56px;
      border: none;

      .van-tabs__nav {
        height: 100%;
        border: none;

        .van-tab {
          margin-top: 8px;
          margin-right: 8px;
          margin-bottom: 8px;
          padding: 0 var(--van-padding-sm);
          // border: var(--van-border-width) solid var(--van-tabs-default-color);
          // border-right: none;
          // &:first-child {
          //   border-radius: 4px 0 0 4px !important;
          // }
          // &:last-child {
          //   border: var(--van-border-width) solid var(--van-tabs-default-color);
          //   border-radius: 0 4px 4px 0 !important;
          // }
          border-radius: 4px;
          background: v-bind('capsuleStyle.inactiveBGColor');

          &--active {
            background: v-bind('capsuleStyle.activeBGColor');
          }

          &:only-child {
            border-radius: 4px !important;
          }
        }
      }
    }
  }

  .tabs-card-class {
    :deep(.van-tab) {
      padding-right: 13px;
      padding-left: 13px;
    }

    :deep(.van-tab--active) {
      border: 1px solid #f0f0f0;
      border-bottom: 0;
    }

    // :deep(.van-tab--card.van-tab--active) {
    //   color: var(--van-primary-color);
    // }
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
