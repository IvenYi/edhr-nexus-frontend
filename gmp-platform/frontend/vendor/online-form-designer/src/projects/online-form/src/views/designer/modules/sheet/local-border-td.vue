<template>
  <td
    v-bind="$attrs"
    :class="[
      'gct-border-td',
      isEmpty && 'gct-border-td--empty',
      showDefaultBorder && 'gct-border-td--default',
      showBorderClass,
    ]"
  >
    <div class="gct-border-td-content"><slot></slot></div>
  </td>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      border?: {
        left?: boolean;
        right?: boolean;
        top?: boolean;
        bottom?: boolean;
        boldLeft?: boolean;
        boldRight?: boolean;
        boldTop?: boolean;
        boldBottom?: boolean;
      };
      borderAttrs?: string[];
      isEmpty?: boolean;
      showDefaultBorder?: boolean;
    }>(),
    {
      borderAttrs: () => [],
    },
  );

  const showBorderClass = computed(() => {
    const arr: string[] = [...props.borderAttrs];
    if (props.border?.left) arr.push('cbl');
    if (props.border?.right) arr.push('cbr');
    if (props.border?.top) arr.push('cbt');
    if (props.border?.bottom) arr.push('cbb');
    if (props.border?.boldLeft) arr.push('bold-left');
    if (props.border?.boldRight) arr.push('bold-right');
    if (props.border?.boldTop) arr.push('bold-top');
    if (props.border?.boldBottom) arr.push('bold-bottom');
    return arr;
  });
</script>

<style lang="less" scoped>
  .gct-border-td {
    --left--border-width: 1px;
    --right--border-width: 1px;
    --top--border-width: 1px;
    --bottom--border-width: 1px;
    --bold-border-width: 2px;
    --border-color: #000;
    position: relative;
    height: 0;

    &--empty {
      padding: 0;
    }

    &::before,
    &::after,
    .gct-border-td-content::before,
    .gct-border-td-content::after {
      content: '';
      position: absolute;
      z-index: 1;
      display: block;
      box-sizing: border-box;
      border-color: transparent;
      border-style: solid;
      border-width: 0;
    }

    &--default {
      &::before,
      &::after,
      .gct-border-td-content::before,
      .gct-border-td-content::after {
        border-color: #ddd;
      }
    }

    &.cbl::before,
    &.cbr::after,
    &.cbt > .gct-border-td-content::before,
    &.cbb > .gct-border-td-content::after {
      z-index: 10;
      border-color: var(--border-color);
    }

    &::before {
      top: calc(-1 * var(--top--border-width) / 2);
      left: calc(-1 * var(--left--border-width) / 2);
      width: var(--left--border-width);
      height: calc(100% + var(--top--border-width) / 2 + var(--bottom--border-width) / 2);
      border-left-width: var(--left--border-width);
    }

    &::after {
      top: calc(-1 * var(--top--border-width) / 2);
      right: calc(-1 * var(--right--border-width) / 2);
      width: var(--right--border-width);
      height: calc(100% + var(--top--border-width) / 2 + var(--bottom--border-width) / 2);
      border-left-width: var(--right--border-width);
    }

    .gct-border-td-content {
      position: relative;
      width: 100%;
      height: 100%;

      &::before {
        top: calc(-1 * var(--top--border-width) / 2);
        left: calc(-1 * var(--left--border-width) / 2);
        width: calc(100% + var(--left--border-width) / 2 + var(--right--border-width) / 2);
        height: var(--top--border-width);
        border-top-width: var(--top--border-width);
      }

      &::after {
        bottom: calc(-1 * var(--bottom--border-width) / 2);
        left: calc(-1 * var(--left--border-width) / 2);
        width: calc(100% + var(--left--border-width) / 2 + var(--right--border-width) / 2);
        height: var(--bottom--border-width);
        border-top-width: var(--bottom--border-width);
      }
    }

    &.bold-left.cbl::before {
      border-left-width: var(--bold-border-width);
    }

    &.bold-right.cbr::after {
      border-left-width: var(--bold-border-width);
    }

    &.bold-top.cbt > .gct-border-td-content::before {
      border-top-width: var(--bold-border-width);
    }

    &.bold-bottom.cbb > .gct-border-td-content::after {
      border-top-width: var(--bold-border-width);
    }
  }
</style>
