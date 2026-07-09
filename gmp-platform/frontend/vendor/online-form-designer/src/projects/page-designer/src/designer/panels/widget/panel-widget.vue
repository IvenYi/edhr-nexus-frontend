<template>
  <tag-nav />
  <div class="panel-box" v-if="showPanel" :key="selectedRef.id">
    <div> </div>
    <panel-props
      v-if="selectedAllPropEditors?.length && !selectedAllEvents?.length && !showStyle"
      style="inset: 0"
    />
    <panel-events
      v-if="!selectedAllPropEditors?.length && showEvent && !showStyle"
      style="inset: 0"
    />
    <panel-style
      v-if="!selectedAllPropEditors?.length && !selectedAllEvents?.length && showStyle"
      style="inset: 0"
    />
    <a-tabs v-model:activeKey="activeKey" v-if="showTabs" centered class="panel-editor-tabs">
      <a-tab-pane key="1">
        <template #tab>
          <div> {{ t('sys.pageDesigner.prop') }} </div>
        </template>
        <panel-props />
      </a-tab-pane>
      <a-tab-pane key="2" v-if="showEvent">
        <template #tab>
          <span> {{ t('sys.pageDesigner.event') }} </span>
        </template>
        <panel-events />
      </a-tab-pane>
      <a-tab-pane key="3" v-if="showStyle">
        <template #tab>
          <div> {{ t('sys.pageDesigner.style') }} </div>
        </template>
        <panel-style />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts" name="panel-widget">
  import { computed, ref, watch } from 'vue';
  import PanelProps from './props-tab.vue';
  import PanelStyle from './style-tab.vue';
  import PanelEvents from './events-tab.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { isEmpty, has } from 'lodash-es';
  import { BuiltinType } from '/@page-designer/enum';
  import TagNav from '/@/components/TagNav';

  const { selectedRef, selectedAllEvents, selectedAllPropEditors, selectedAllStyleEditors } =
    useSelectedWidget();

  // const showEventPanel = computed(() => {
  //   if (selectedRef.value && has(selectedRef.value.props, 'bindFieldKey')) {
  //     return false;
  //   }
  //   return true;
  // });
  const showEvent = computed(() => {
    return selectedAllEvents.value?.filter((e) => !(e.hidden && e.hidden(selectedRef.value)))
      .length;
  });
  const showStyle = computed(() => {
    return (
      (selectedRef.value.type === BuiltinType.MODAL || selectedRef.value.hasOwnProperty('style')) &&
      selectedAllStyleEditors.value?.filter((e) => !(e.hidden && e.hidden(selectedRef.value)))
        .length
    );
  });
  const { t } = useI18n();
  const activeKey = ref('1');
  const showPanel = computed(() => {
    if (isEmpty(selectedRef.value)) {
      return false;
    }
    return true;
  });

  const showTabs = computed(() => {
    return (
      (selectedAllPropEditors?.value?.length && (showEvent.value || showStyle.value)) ||
      (selectedAllEvents?.value?.length &&
        (selectedAllPropEditors?.value?.length || showStyle.value)) ||
      (showStyle.value && (showEvent.value || selectedAllPropEditors?.value?.length))
    );
  });
  watch([showEvent, showStyle], (res) => {
    if ((!res[0] && activeKey.value === '2') || (!res[1] && activeKey.value === '3')) {
      activeKey.value = '1';
    }
  });
</script>

<style lang="less" scoped>
  .bread {
    height: 48px;
    padding: 0 12px;
    border-bottom: 1px solid #eaeaea;
    font-weight: bold;
    line-height: 48px;
    text-align: left;
  }

  .panel-box {
    position: relative;
    height: calc(100% - 42px);
    font-size: 12px !important;

    .desc-row {
      padding-right: 12px;
      padding-bottom: 12px;
      padding-left: 12px;

      .title {
        color: #666;
        font-size: 12px;
      }

      .value {
        overflow: hidden;
        color: #333;
        text-align: right;
        text-overflow: ellipsis;
        text-wrap: nowrap;
      }
    }

    :deep(.scrollbar__view) {
      padding: 0 12px !important;

      .ant-form-item-label,
      .ant-form .ant-form-item .ant-form-item-label > label,
      .ant-form-item-label > label {
        color: #242424;
        font-size: 12px;
      }

      .ant-form-item-explain-error {
        font-size: 12px;
      }

      .ant-input,
      .ant-select {
        color: #666;
      }

      .ant-input-show-count-suffix {
        color: #c3c3c3;
      }

      .ant-input-affix-wrapper-sm {
        padding: 2px 7px;
      }

      .ant-input-number-sm input {
        height: 26px;
      }

      .ant-select-single.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector {
        height: 28px;
      }

      .ant-select-multiple.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector {
        min-height: 28px;
      }

      .ant-select-single.ant-select-sm:not(.ant-select-customize-input)
        .ant-select-selector
        .ant-select-selection-item,
      .ant-select-single.ant-select-sm:not(.ant-select-customize-input)
        .ant-select-selector
        .ant-select-selection-placeholder,
      .ant-select-single.ant-select-sm:not(.ant-select-customize-input)
        .ant-select-selector::after {
        line-height: 26px;
      }

      .ant-select-multiple.ant-select-sm .ant-select-selection-item {
        height: 20px;
        line-height: 17px;
      }

      .ant-select-selection-placeholder,
      .ant-input::placeholder {
        color: #c3c3c3;
      }
    }

    :deep(.ant-form .ant-form-item) {
      margin-bottom: 16px;
    }

    :deep(.in-row-no-bottom) {
      margin-bottom: 0 !important;
    }

    :deep(.ant-form-vertical .ant-form-item-label) {
      padding-bottom: 2px;
    }

    :deep(
        .ant-collapse-icon-position-right
          > .ant-collapse-item
          > .ant-collapse-header
          .ant-collapse-arrow
      ) {
      right: 12px;
    }

    :deep(
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
      ) {
      padding: 0;
    }
  }

  .panel-editor-tabs {
    & > :deep(.ant-tabs-nav) {
      .ant-tabs-nav-wrap {
        border-bottom: 1px solid @gct-modal-border-color;
      }

      .ant-tabs-nav-list {
        flex: 1;

        .ant-tabs-tab {
          flex: 1;
          justify-content: center;
        }

        .ant-tabs-tab {
          padding: 7px 0;
        }

        .ant-tabs-tab + .ant-tabs-tab {
          margin: 0;
        }

        .ant-tabs-ink-bar {
          background-color: transparent;
        }

        .ant-tabs-tab-active::after {
          content: '';
          position: absolute;
          z-index: 3;
          bottom: 0;
          width: 16px;
          height: 2px;
          background-color: var(--ant-primary-color);
        }
      }

      .ant-tabs-nav-operations {
        display: none !important;
      }
    }
  }

  :deep(.ant-collapse),
  :deep(.ant-input),
  :deep(.ant-collapse-header),
  :deep(.ant-form label),
  :deep(.ant-btn),
  :deep(.ant-select),
  :deep(.ant-form .ant-form-item),
  :deep(.ant-breadcrumb) {
    font-size: 12px;
  }

  :deep(.ant-form label) {
    color: @gct-text-main-color;
  }

  :deep(.ant-radio) {
    // top: 0.16em;
    transform: scale(0.8);
  }

  :deep(span.ant-radio + *) {
    padding-right: 8px;
    padding-left: 6px;
  }

  :deep(.ant-btn) {
    // font-size: 12px;
  }
</style>
