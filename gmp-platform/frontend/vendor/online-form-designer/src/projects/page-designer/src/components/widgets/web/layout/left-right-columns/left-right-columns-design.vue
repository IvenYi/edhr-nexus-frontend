<template>
  <div ref="layout" class="flex overflow-y-auto" :style="style">
    <!-- left side -->
    <div
      :style="{ width: leftWidth, ...childStyle }"
      :class="[
        'left-right-columns-side',
        'shrink-0',
        'left-wrap',
        { 'columns-shadow': collapsable, 'is-reversed': isReversed },
      ]"
    >
      <drag-widget-group
        v-if="!isNewDesigner"
        :parent-drag-widgets="widget.children?.[0].children"
        :parentWidget="widget"
        :show-placeholder="true"
      />
      <slot
        v-if="isNewDesigner"
        :key="widget.id + '_left'"
        :groupId="widget.id + '_left'"
        :parentWidget="widget"
        :children="widget.children?.[0].children"
        :config="{ direction: 'horizontal' }"
      ></slot>
    </div>

    <!-- drag line -->
    <div class="dragline" :class="[resizable && 'cursor-col-resize']">
      <div
        v-show="collapsable"
        class="arrow-indicator -translate-y-1/2"
        :class="{ 'is-column-type-right rotate-180': rowType === COLUMNS_TYPE.RIGHT }"
      >
        <LeftOutlined style="font-size: 10px" />
      </div>
    </div>

    <!-- right main -->
    <div
      :class="[
        'left-right-columns-main',
        'ks-col',
        'overflow-hidden',
        'right-wrap',
        { 'is-reversed': isReversed },
      ]"
      :style="childStyle"
    >
      <drag-widget-group
        v-if="!isNewDesigner"
        :parent-drag-widgets="widget.children?.[1].children"
        :parentWidget="widget"
        :show-placeholder="true"
      />
      <slot
        v-if="isNewDesigner"
        :key="widget.id + '_right'"
        :groupId="widget.id + '_right'"
        :parentWidget="widget"
        :children="widget.children?.[1].children"
        :config="{ direction: 'horizontal' }"
      ></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-left-right-columns">
  import { computed, ref, onMounted, nextTick, toRefs } from 'vue';
  import { LayoutColumns } from '/@page-designer/types/web';
  import { COLUMNS_TYPE } from '/@page-designer/enum';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';

  const props = defineProps<{ widget: LayoutColumns; isNewDesigner: boolean }>();

  const {
    rowtype: rowType,
    rowresize: resizable,
    rowputAway: collapsable,
  } = toRefs(props.widget.props);

  const layout = ref();
  const height = ref(0);

  const leftWidth = computed(() => {
    return rowType!.value === COLUMNS_TYPE.CENTER ? '50%' : props.widget.props.rowwidth + 'px';
  });

  const isReversed = computed(() => {
    return rowType!.value === COLUMNS_TYPE.RIGHT;
  });

  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      height: height.value + 'px',
      backgroundColor: styleProp.backgroundColor || '#fff',
      flexDirection: isReversed.value ? 'row-reverse' : 'row',
    };
  });

  const childStyle = computed(() => {
    const styleProp = props.widget.style;
    return {
      paddingTop: (styleProp.paddingTop || 0) + 'px',
      paddingBottom: (styleProp.paddingBottom || 0) + 'px',
      paddingLeft: (styleProp.paddingLeft || 0) + 'px',
      paddingRight: (styleProp.paddingRight || 0) + 'px',
      backgroundColor: styleProp.backgroundColor || '#fff',
    };
  });

  onMounted(async () => {
    await nextTick();
    let el = layout.value.parentNode;

    while (!el.classList.contains('root')) {
      el = el.parentNode;
    }

    if (el.classList.contains('modal-body')) {
      height.value = el.clientHeight - 60;
      return;
    }
    if (el.parentNode?.classList?.contains('modal-body')) {
      if (el.parentNode.clientHeight == 332) {
        height.value = document.body.clientHeight * 0.6 - 32;
      } else {
        height.value = el.clientHeight - 4;
      }
      return;
    }
    height.value = document.body.clientHeight - el.getBoundingClientRect().top - 40;
  });
</script>

<style lang="less" scoped>
  .dragline {
    position: relative;
    height: 100%;
    border-right: 1px solid #e0e3eb;

    .arrow-indicator {
      cursor: pointer;
      position: absolute;
      left: 0;
      top: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9;
      color: #fff;
      height: 26px;
      width: 14px;
      background: #cfcfd2;

      &.is-column-type-right {
        margin-left: -14px;
      }

      &:hover {
        background: #b4b5b9;

        &::before {
          background: radial-gradient(circle at 100% 0, transparent 12px, #b4b5b9 12px);
        }

        &::after {
          background: radial-gradient(circle at 100% 100%, transparent 12px, #b4b5b9 12px);
        }
      }

      &::before {
        content: '';
        position: absolute;
        height: 12px;
        width: 12px;
        left: 0;
        top: -12px;
        background: radial-gradient(circle at 100% 0, transparent 12px, #cfcfd2 12px);
      }

      &::after {
        content: '';
        position: absolute;
        height: 12px;
        width: 12px;
        left: 0;
        bottom: -12px;
        background: radial-gradient(circle at 100% 100%, transparent 12px, #cfcfd2 12px);
      }

      .iconfont {
        color: #666;
        font-size: 20px;
        line-height: 1;
      }
    }
  }

  .left-wrap {
    position: relative;

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
        color: #bfbfbf;
        font-size: 16px;
        pointer-events: none;
        inset: 0;
      }
    }

    :deep(.gct-vue3-dnd-container) {
      border-right-width: 0;
    }

    &.is-reversed {
      :deep(.gct-vue3-dnd-container) {
        border-right-width: 2px;
        border-left-width: 0;
      }
    }
  }

  .right-wrap {
    position: relative;

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
        color: #bfbfbf;
        font-size: 16px;
        pointer-events: none;
        inset: 0;
      }
    }

    :deep(.gct-vue3-dnd-container) {
      border-left-width: 0;
    }

    &.is-reversed {
      :deep(.gct-vue3-dnd-container) {
        border-left-width: 2px;
        border-right-width: 0;
      }
    }
  }
</style>
