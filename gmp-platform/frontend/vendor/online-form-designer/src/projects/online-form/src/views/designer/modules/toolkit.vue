<template>
  <div class="designer__toolkit">
    <a-popover
      :visible="fieldsPopoverVisible"
      overlay-class-name="toolkit__overlay toolkit__overlay_fields"
      placement="leftTop"
      trigger="click"
      v-if="showFields"
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
        :class="{
          active: fieldsPopoverVisible,
        }"
        @click="
          () => {
            setActivePopover('fields');
          }
        "
      >
        <i class="iconfont icon-ziduan2"></i>
        <span> {{ $t('sys.field') }} </span>
      </div>
    </a-popover>

    <a-popover
      :visible="widgetsPopoverVisible"
      overlay-class-name="toolkit__overlay"
      placement="leftTop"
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
        :class="{
          active: widgetsPopoverVisible,
        }"
        @click="
          () => {
            setActivePopover('widgets');
          }
        "
      >
        <i class="iconfont icon-zujian"></i>
        <span>{{ $t('sys.pageDesigner.widget') }}</span>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import ToolkitTitle from './toolkit/toolkit-title.vue';
  import ToolkitContentWidgets from './toolkit/toolkit-content-widgets/toolkit-content-widgets.vue';
  import ToolkitContentFields from './toolkit/toolkit-content-fields';

  type ActivePopoverKey = 'fields' | 'widgets' | undefined;

  withDefaults(
    defineProps<{
      showFields?: boolean;
    }>(),
    {
      showFields: false,
    },
  );

  const activePopover = ref<ActivePopoverKey>();

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
      height: 74px;
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
