<template>
  <van-collapse
    v-model="activeNames"
    :style="{
      '--van-cell-vertical-padding': '0',
      '--van-cell-horizontal-padding': '0',
      '--van-padding-md': '0',
      '--van-cell-border-color': '#E0E3EA',
      '--van-collapse-item-content-padding': '0',
      '--van-cell-text-color': '#000000',
      '--van-cell-background': 'transparent',
    }"
    :class="'collapse-design'"
  >
    <van-collapse-item
      name="1"
      :readonly="props.isSupportFold === '0'"
      class="gct-vant-item"
      :style="{
        '--van-collapse-item-content-background': !widget.children[0]?.children.length
          ? '#e6e9ef'
          : 'transparent',
        '--van-cell__right-icon-right': (style.paddingRight || 12) + 'px',
        '--van-cell-border-color': 'transparent',
      }"
    >
      <template #title>
        <van-row
          :gutter="0"
          :style="{
            paddingTop: (style.paddingTop || 0) + 'px',
            paddingBottom: '0',
            paddingLeft: (style.paddingLeft || 0) + 'px',
            paddingRight: (style.paddingRight || 0) + 'px',
          }"
        >
          <van-col
            class="header-title"
            :span="props.isSupportFold === '1' ? 24 : 12"
            :style="{
              textAlign: style.labelFont?.align,
              textAlignLast: style.labelFont?.align,
              paddingRight:
                props.isSupportFold === '1' &&
                (style.labelFont?.align === 'right' || style.labelFont?.align === 'justify')
                  ? '32px'
                  : 0,
            }"
          >
            <span
              class="gct-text-overflow w100%"
              style="display: inline-block; vertical-align: middle"
            >
              <IconNext
                v-if="props.icon"
                :size="16"
                :style="titleStyleAttr"
                :value="props.icon"
                :color="props.color"
                style="margin-left: 2px; vertical-align: text-bottom"
              />
              <span class="collapse-txt" :style="titleStyleAttr">{{ props.title }}</span>
            </span>
          </van-col>
          <van-col
            v-show="props.isSupportFold === '0'"
            span="12"
            class="gct-vant-col-item pl4px"
            :style="{
              backgroundColor: !widget.children[1]?.children ? '#e6e9ef' : 'transparent',
            }"
          >
            <slot :parentWidget="widget" :children="widget.children[1]?.children"></slot>
          </van-col>
        </van-row>
      </template>
      <div :style="divStyleAttr">
        <slot
          :parentWidget="widget"
          :children="widget.children[0]?.children"
          :config="{ direction: 'horizontal' }"
        ></slot>
      </div>
    </van-collapse-item>
  </van-collapse>
</template>
<script setup lang="ts" name="gct-collapse">
  import { ref, toRefs, computed, watch } from 'vue';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { Collapse } from '/@page-designer/types/mobile';
  import { IconNext } from '/@/components/Icon';

  const activeNames = ref(['1']);
  const defProps = defineProps<{ widget: Collapse; isNewDesigner: boolean }>();
  const { props, style, children } = toRefs(defProps.widget);

  if (children?.value && children.value.length > 1) {
    const one = children.value[0];
    const two = children.value[1];
    if (one) {
      one.alias = $t('sys.pageDesigner.panelTitleBarArea');
    }
    if (two) {
      two.alias = $t('sys.pageDesigner.panelContentArea');
    }
  }

  watch(
    () => props.value.isSupportFold,
    (val) => {
      if (val === '0') activeNames.value = ['1'];
    },
  );
  const titleStyleAttr = computed(() => {
    return {
      fontSize: style.value.labelFont?.fontSize ? style.value.labelFont?.fontSize + 'px' : '16px',
      fontWeight: style.value.labelFont?.bold ? 'bold' : 'normal',
      color: style.value.labelFont?.color,
      fontStyle: style.value.labelFont?.italic ? 'italic' : 'normal',
      textDecoration: style.value.labelFont?.textDecoration,
    };
  });
  const divStyleAttr = computed(() => {
    return {
      // paddingTop: (style.value.paddingTop || 0) + 'px',
      paddingRight: (style.value.paddingRight || 0) + 'px',
      paddingBottom: (style.value.paddingBottom || 0) + 'px',
      paddingLeft: (style.value.paddingLeft || 0) + 'px',
      height: style.value.height ? style.value.height + 'px' : 'auto',
      minHeight: defProps.widget.children[0]?.children?.length ? undefined : '147px',
    };
  });
</script>
<style lang="scss" scoped>
  .collapse-design {
    --van-cell__right-icon-right: 12px;
  }

  .gct-vant-item {
    // :deep(.van-collapse-item__content) {
    //   background: transparent;
    // }

    &::before {
      content: attr(data-placeholder);
      display: flex;
      position: absolute;
      top: 0;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding-top: 56px;
      color: #bfbfbf;
      font-size: 16px;
      pointer-events: none;
    }

    :deep(.van-collapse-item__title) {
      // position: relative;
      align-items: center;

      .van-cell__right-icon {
        padding-right: 16px;
        //   position: absolute;
        //   right: 16px;
        //   bottom: 17px;
        //   // height: auto;
        //   line-height: var(--van-cell-line-height);
      }

      &.van-cell {
        padding-left: 16px;
        line-height: 1;
      }
    }

    :deep(.van-collapse-item__title.van-cell--clickable) {
      pointer-events: none;
    }
  }

  .gct-vant-col-item {
    position: relative;
    padding-bottom: 1px;
    &::before {
      content: attr(data-placeholder);
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #bfbfbf;
      font-size: 16px;
      pointer-events: none;
    }

    :deep(.gct-vue3-dnd-container) {
      > .gct-vue3-dnd-item {
        display: inline-block;
      }
    }
  }

  .header-title {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    padding: 12px 6px;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 3px;
      height: 16px;
      transform: translate(0, -50%);
      background: var(--van-primary-color);
    }

    .collapse-txt {
      margin-left: 4px;
      color: rgb(0 0 0 / 85%);
      font-size: 16px;
      font-weight: 600;
    }
  }
</style>
<style lang="scss">
  .van-hairline--top-bottom {
    &::after {
      border-width: 0 !important;
    }
  }
</style>
