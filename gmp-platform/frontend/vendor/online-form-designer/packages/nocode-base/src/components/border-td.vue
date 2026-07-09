<template>
  <td
    v-bind="$attrs"
    :class="[
      ns.b(),
      isEmpty && ns.m('empty'),
      showDefaultBorder && ns.m('default'),
      showBorderClass,
      isFirefox && ns.m('is-firefox'),
    ]"
    :data-merge="autoMerge || null"
    :data-fill-direction="fillDirection"
  >
    <div :class="[ns.b('content')]"><slot></slot></div>
  </td>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { ICellBorder } from '../types';

  const ns = useNamespace('border-td');

  const props = withDefaults(
    defineProps<{
      border?: ICellBorder;
      borderAttrs?: any;
      isEmpty?: boolean;
      showDefaultBorder?: boolean;
      autoMerge?: boolean;
      fillDirection?: 'x' | 'y';
    }>(),
    {
      borderAttrs: [],
    },
  );

  const showBorderClass = computed(() => {
    const arr: string[] = [...props.borderAttrs];
    if (props.border) {
      if (props.border.left) {
        arr.push('cbl');
      }
      if (props.border.right) {
        arr.push('cbr');
      }
      if (props.border.top) {
        arr.push('cbt');
      }
      if (props.border.bottom) {
        arr.push('cbb');
      }
      if (props.border.boldLeft) {
        arr.push('bold-left');
      }
      if (props.border.boldRight) {
        arr.push('bold-right');
      }
      if (props.border.boldTop) {
        arr.push('bold-top');
      }
      if (props.border.boldBottom) {
        arr.push('bold-bottom');
      }
    }
    return arr;
  });

  const isFirefox = computed(() => {
    return window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  });
</script>

<style lang="scss" scoped>
  @mixin borderBasic() {
    position: absolute;
    z-index: 1;
    content: '';
    border-width: 0;
    display: block;
    border-color: transparent;
    border-style: solid;
    box-sizing: border-box;
  }

  @mixin borderShowed() {
    z-index: 10;
    border-color: var(--border-color);
  }

  @include b(border-td) {
    // 边框宽度
    --left--border-width: 1px;
    --right--border-width: 1px;
    --top--border-width: 1px;
    --bottom--border-width: 1px;
    // 加粗边框宽度
    --bold-border-width: 2px;
    --border-color: black;
    position: relative;

    // 让content可以自己撑满
    height: 0;

    @include m(empty) {
      padding: 0;
    }

    @include m(is-firefox) {
      height: 100%;
    }

    // &.cbl > .#{bem('border-td','border-left')} {
    //   border-color: orange;
    // }
    // &.cbr > .#{bem('border-td','border-right')} {
    //   border-color: purple;
    // }
    // &.cbt > .#{bem('border-td','border-top')} {
    //   border-color: blue;
    // }
    // &.cbb > .#{bem('border-td','border-bottom')} {
    //   border-color: red;
    // }

    // 边框的通用样式
    &::before,
    &::after,
    .#{bem(border-td-content,'','')}::before,
    .#{bem(border-td-content,'','')}::after {
      @include borderBasic();
    }

    // 设计态默认边框的样式
    @include m(default) {
      &::before,
      &::after,
      .#{bem(border-td-content,'','')}::before,
      .#{bem(border-td-content,'','')}::after {
        border-color: #ddd;
      }
    }

    // 边框显示时样式
    &.cbl::before,
    &.cbr::after,
    &.cbt > .#{bem(border-td-content,'','')}::before,
    &.cbb > .#{bem(border-td-content,'','')}::after {
      @include borderShowed();
    }

    // 左边框独有样式
    &::before {
      // 角落缺口补全
      top: calc(-1 * var(--top--border-width) / 2);
      height: calc(100% + var(--top--border-width) / 2 + var(--bottom--border-width) / 2);
      // 粗细，消除缩放影响
      width: var(--left--border-width);
      border-left-width: var(--left--border-width);
      // 居中
      left: calc(-1 * var(--left--border-width) / 2);
    }

    // 右边框独有样式
    &::after {
      // 角落缺口补全
      top: calc(-1 * var(--top--border-width) / 2);
      height: calc(100% + var(--top--border-width) / 2 + var(--bottom--border-width) / 2);
      // 粗细，消除缩放影响
      width: var(--right--border-width);
      border-left-width: var(--right--border-width);
      // 居中
      right: calc(-1 * var(--right--border-width) / 2);
    }

    // 上边框独有样式
    .#{bem(border-td-content,'','')}::before {
      // 角落缺口补全
      left: calc(-1 * var(--left--border-width) / 2);
      width: calc(100% + var(--left--border-width) / 2 + var(--right--border-width) / 2);
      // 粗细，消除缩放影响
      height: var(--top--border-width);
      border-top-width: var(--top--border-width);
      // 居中
      top: calc(-1 * var(--top--border-width) / 2);
    }

    // 下边框独有样式
    .#{bem(border-td-content,'','')}::after {
      // 角落缺口补全
      left: calc(-1 * var(--left--border-width) / 2);
      width: calc(100% + var(--left--border-width) / 2 + var(--right--border-width) / 2);
      // 粗细，消除缩放影响
      height: var(--bottom--border-width);
      border-top-width: var(--bottom--border-width);
      // 居中
      bottom: calc(-1 * var(--bottom--border-width) / 2);
    }

    &.bold-left {
      &.cbl::before {
        border-left-width: var(--bold-border-width);
      }
    }
    &.bold-right {
      &.cbr::after {
        border-left-width: var(--bold-border-width);
      }
    }
    &.bold-top {
      &.cbt > .#{bem(border-td-content,'','')}::before {
        border-top-width: var(--bold-border-width);
      }
    }
    &.bold-bottom {
      &.cbb > .#{bem(border-td-content,'','')}::after {
        border-top-width: var(--bold-border-width);
      }
    }
  }

  @include b(border-td-content) {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
