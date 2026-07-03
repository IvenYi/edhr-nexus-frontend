<template>
  <div
    :class="{
      'gct-no-flex ': !activeNames?.length,
      'gct-flex-table-scroll': showBoxScroll && !style.height,
    }"
  >
    <a-collapse v-model:activeKey="activeNames" ghost class="gct-vant-item">
      <template #expandIcon>
        <down-outlined class="collapse-icon-down" />
      </template>
      <a-collapse-panel
        key="1"
        :collapsible="props.isSupportFold === '0' ? 'disabled' : ''"
        :showArrow="props.isSupportFold === '1'"
        forceRender
      >
        <template #header>
          <a-row class="w100%" type="flex" align="middle" :style="headerStyle">
            <a-col
              :span="props.isSupportFold === '1' ? 24 : 8"
              :style="{
                textAlign: style.labelFont?.align,
                textAlignLast: style.labelFont?.align,
                padding: '8px 0',
                paddingRight:
                  props.isSupportFold === '1' &&
                  (style.labelFont?.align === 'right' || style.labelFont?.align === 'justify')
                    ? '35px'
                    : 0,
              }"
            >
              <span
                class="gct-text-overflow w100% collapse-title"
                :style="titleStyleAttr"
                :title="props.title"
              >
                <IconNext
                  :size="16"
                  v-if="props.icon"
                  :value="props.icon"
                  :color="props.color"
                  style="margin-left: 2px; vertical-align: text-bottom"
                />
                <span
                  :style="{
                    textAlign: style.labelFont?.align,
                    textAlignLast: style.labelFont?.align,
                  }"
                  class="collapse-txt"
                >
                  {{ props.title }}
                  <a-tooltip v-if="!!widget.props.showExplain">
                    <template #title> {{ widget.props.explain }}</template>
                    <info-circle-outlined class="explain-icon ml5px" />
                  </a-tooltip>
                </span>
              </span>
            </a-col>
            <a-col
              v-show="props.isSupportFold === '0'"
              span="16"
              class="gct-vant-col-item pl4px"
              :style="{
                minHeight: '32px',
              }"
            >
              <slot :children="widget.children[1]?.children"></slot>
            </a-col>
          </a-row>
        </template>
      </a-collapse-panel>
    </a-collapse>
    <div
      :style="divStyleAttr"
      class="overflow-auto"
      :class="{
        'gct-no-flex hidden!': !activeNames?.length,
        'gct-flex-table-scroll': showBoxScroll && !style.height,
      }"
    >
      <slot :children="widget.children[0]?.children"></slot>
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-collapse">
  import { ref, toRefs, computed, watch } from 'vue';
  import { Collapse } from '/@page-designer/types/mobile';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { pageLayoutModeEnum } from '@gct/runtime';

  const Event = getPageEvent();
  /**页面开启内部滚动模式 */
  const showBoxScroll = Event.pageLayoutMode === pageLayoutModeEnum.SHOW_BOX_SCROLL;
  const activeNames = ref(['1']);
  const defProps = defineProps<{ widget: Collapse }>();
  const { props, style } = toRefs(defProps.widget);
  if (props.value.isSupportFold === '1' && props.value.defaultFold) activeNames.value = [];
  else activeNames.value = ['1'];

  watch(
    () => props.value.isSupportFold,
    (val) => {
      if (val === '0') activeNames.value = ['1'];
    },
  );
  const headerStyle = computed(() => {
    return {
      paddingTop: (style.value.paddingTop || 0) + 'px',
      paddingBottom: '0',
      paddingLeft: (style.value.paddingLeft || 0) + 'px',
      paddingRight: (style.value.paddingRight || 0) + 'px',
    };
  });
  const titleStyleAttr = computed(() => {
    return {
      fontSize: style.value.labelFont?.fontSize ? style.value.labelFont?.fontSize + 'px' : '14px',
      fontWeight: style.value.labelFont?.bold ? 'bold' : 'normal',
      color: style.value.labelFont?.color,
      fontStyle: style.value.labelFont?.italic ? 'italic' : 'normal',
      textDecoration: style.value.labelFont?.textDecoration,
    };
  });
  const divStyleAttr = computed(() => {
    return {
      paddingRight: (style.value.paddingRight || 0) + 'px',
      paddingBottom: (style.value.paddingBottom || 0) + 'px',
      paddingLeft: (style.value.paddingLeft || 0) + 'px',
      height: style.value.height ? style.value.height + 'px' : 'auto',
    };
  });
</script>
<style lang="less" scoped>
  :deep(.ant-collapse-header) {
    padding: 0 !important;
    // border-top: 1px solid @gct-modal-border-color;
    // border-bottom: 1px solid @gct-modal-border-color;
    .collapse-title {
      display: flex;
      position: relative;
      align-items: center;
      padding-left: 6px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 3px;
        height: 16px;
        transform: translate(0, -50%);
        background: var(--ant-primary-color);
      }

      .collapse-txt {
        // display: grid;
        flex: 1;
        margin-left: 4px;
      }
    }
  }

  :deep(.ant-collapse-item-disabled > .ant-collapse-header) {
    color: #000000d9;
    cursor: auto !important;
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0 !important;
  }

  .collapse-icon-down {
    position: absolute;
    right: 0;
    bottom: 4px;
    transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
    font-size: 16px !important;
  }

  .ant-collapse-item-active {
    .collapse-icon-down {
      transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
    }
  }
</style>
