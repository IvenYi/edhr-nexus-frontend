<template>
  <div class="designer__toolkit" :class="{ 'designer__toolkit--hosted': hostedDesigner }">
    <button
      v-if="hostedDesigner"
      type="button"
      class="designer__toolkit-item designer__toolkit-page-toggle"
      :class="{ active: isHostedSidePanelActive('pages') }"
      title="分页缩略图"
      @click="selectSidePanel('pages')"
    >
      <span class="designer__toolkit-page-icon"></span>
      <span class="designer__toolkit-label">分页缩略图</span>
    </button>

    <button
      v-if="hostedDesigner && props.showFields"
      type="button"
      class="designer__toolkit-item"
      :title="$t('sys.field')"
      :class="{ active: isHostedSidePanelActive('fields') }"
      @click="selectSidePanel('fields')"
    >
      <span class="designer__toolkit-field-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span class="designer__toolkit-label"> {{ $t('sys.field') }} </span>
    </button>

    <a-popover
      v-if="!hostedDesigner && props.showFields"
      :visible="fieldsPopoverVisible"
      overlay-class-name="toolkit__overlay toolkit__overlay_fields"
      :placement="toolkitPlacement"
      trigger="click"
    >
      <template #content>
        <toolkit-content-fields />
      </template>
      <template #title>
        <toolkit-title
          :title="$t('sys.component.fieldTransfer.defaultModalTitle')"
          @close="
            () => {
              setActivePopover();
            }
          "
      /></template>
      <div
        class="designer__toolkit-item"
        :title="$t('sys.field')"
        :class="{
          active: fieldsPopoverVisible,
        }"
        @click="
          () => {
            setActivePopover('fields');
          }
        "
      >
        <span v-if="hostedDesigner" class="designer__toolkit-field-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <i v-else class="iconfont icon-ziduan2"></i>
        <span class="designer__toolkit-label"> {{ $t('sys.field') }} </span>
      </div>
    </a-popover>

    <button
      v-if="hostedDesigner"
      type="button"
      class="designer__toolkit-item"
      :title="$t('sys.pageDesigner.widget')"
      :class="{ active: isHostedSidePanelActive('widgets') }"
      @click="selectSidePanel('widgets')"
    >
      <span class="designer__toolkit-widget-icon">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span class="designer__toolkit-label">{{ $t('sys.pageDesigner.widget') }}</span>
    </button>

    <a-popover
      v-if="!hostedDesigner"
      :visible="widgetsPopoverVisible"
      overlay-class-name="toolkit__overlay"
      :placement="toolkitPlacement"
      trigger="click"
    >
      <template #content><toolkit-content-widgets /> </template>
      <template #title>
        <toolkit-title
          :title="$t('sys.onlineForm.commonComponents')"
          @close="
            () => {
              setActivePopover();
            }
          "
      /></template>
      <div
        class="designer__toolkit-item"
        :title="$t('sys.pageDesigner.widget')"
        :class="{
          active: widgetsPopoverVisible,
        }"
        @click="
          () => {
            setActivePopover('widgets');
          }
        "
      >
        <span v-if="hostedDesigner" class="designer__toolkit-widget-icon">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <i v-else class="iconfont icon-zujian"></i>
        <span class="designer__toolkit-label">{{ $t('sys.pageDesigner.widget') }}</span>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import ToolkitTitle from './toolkit/toolkit-title.vue';
  import ToolkitContentWidgets from './toolkit/toolkit-content-widgets/toolkit-content-widgets.vue';
  import ToolkitContentFields from './toolkit/toolkit-content-fields';

  type ActivePopoverKey = 'fields' | 'widgets' | undefined;
  type HostedSidePanelKey = 'pages' | 'fields' | 'widgets';

  const props = withDefaults(
    defineProps<{
      showFields?: boolean;
      pageThumbnailsVisible?: boolean;
      activeSidePanel?: HostedSidePanelKey;
    }>(),
    {
      showFields: false,
      pageThumbnailsVisible: false,
      activeSidePanel: 'pages',
    },
  );

  const emit = defineEmits<{
    (e: 'toggle-page-thumbnails'): void;
    (e: 'select-side-panel', panel: HostedSidePanelKey): void;
  }>();
  const activePopover = ref<ActivePopoverKey>();
  const route = useRoute();
  const hostedDesigner = computed(() => route.query.hosted === '1');
  const toolkitPlacement = computed(() => (hostedDesigner.value ? 'rightTop' : 'leftTop'));

  const isHostedSidePanelActive = (panel: HostedSidePanelKey) => {
    return props.pageThumbnailsVisible && props.activeSidePanel === panel;
  };

  const selectSidePanel = (panel: HostedSidePanelKey) => {
    emit('select-side-panel', panel);
  };

  const fieldsPopoverVisible = computed(() => {
    return activePopover.value === 'fields';
  });
  const widgetsPopoverVisible = computed(() => {
    return activePopover.value === 'widgets';
  });

  /** popover类型的标识 */
  const popoverKeys: ActivePopoverKey[] = ['fields', 'widgets'];

  const setActivePopover = (key?: ActivePopoverKey) => {
    // 空参默认关闭所有
    if (!key) {
      activePopover.value = undefined;
      return;
    }

    // popover类型点击切换显隐
    if (popoverKeys.includes(key!)) {
      activePopover.value = key === activePopover.value ? undefined : key;
    }
  };
</script>

<style lang="less" scoped>
  .designer__toolkit {
    background: #f2f4f7;
    border-left: 1px solid #e0e3ea;
    border-right: 1px solid #e0e3ea;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &-item {
      border: 0;
      background: transparent;
      height: 74px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      color: #5d6474;
      white-space: nowrap;

      &.active {
        background-color: #d4d9e2;
        color: #212528;
      }

      .iconfont,
      .gct-iconfont {
        font-size: 20px;
        display: inline-flex;
      }
    }

    &--hosted {
      background: #fff;
      border-left: 0;
      border-right: 1px solid #e0e3ea;

      .designer__toolkit-item {
        height: 54px;
        gap: 3px;
        border-radius: 0;
        color: #797a7d;
        font-size: 18px;

        &.active {
          background: #eaf6ff;
          color: #1687e8;
        }
      }

      .designer__toolkit-label {
        display: none;
      }
    }

    &-page-toggle {
      padding: 0;
    }

    &-page-icon {
      position: relative;
      display: inline-flex;
      width: 18px;
      height: 20px;
      border: 1.5px solid currentColor;
      border-radius: 2px;

      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 4px;
        right: 4px;
        height: 1.5px;
        border-radius: 2px;
        background: currentColor;
      }

      &::before {
        top: 6px;
      }

      &::after {
        top: 12px;
      }
    }

    &-field-icon {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      width: 19px;
      height: 18px;
      gap: 3px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 2px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: currentColor;
        box-shadow:
          0 6px 0 currentColor,
          0 12px 0 currentColor;
      }

      span {
        display: block;
        height: 1.5px;
        margin-left: 8px;
        border-radius: 2px;
        background: currentColor;
      }
    }

    &-widget-icon {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3px;
      width: 18px;
      height: 18px;

      span {
        display: block;
        border: 1.5px solid currentColor;
        border-radius: 2px;
      }
    }
  }
</style>

<style lang="less">
  .toolkit__overlay.toolkit__overlay_fields {
    z-index: 500;
  }

  .toolkit__overlay {
    padding-right: 0px;
    width: 248px;
    &.toolkit__overlay_fields {
      width: auto;
    }
    .ant-popover-arrow {
      display: none;
    }
    .ant-popover-title {
      padding: 0;
    }
    .ant-popover-inner-content {
      padding: 0;
      position: relative;
    }

    &.toolkit__overlay--params {
      width: 300px;
    }
  }
</style>
<style scoped>
  .text-glob {
    width: 24px;
    word-break: break-all;
    white-space: pre-wrap;
    --auto-line-break: wrap;
  }
  .text-init-data {
    width: 36px;
    text-align: center;
    word-break: break-all;
    white-space: pre-wrap;
    --auto-line-break: wrap;
  }
</style>
