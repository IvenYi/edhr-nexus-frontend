<template>
  <div class="border-icon" :class="'border-icon--' + type"></div>
</template>

<script setup lang="ts">
  import { BorderPositionEnum } from '../enums';

  withDefaults(
    defineProps<{
      type: BorderPositionEnum;
    }>(),
    {
      type: BorderPositionEnum.all,
    },
  );
</script>

<style lang="less" scoped>
  .border-icon {
    --solid-border: 1px solid #212528;
    --dashed-border: 1px dashed #c3c3c3;
    height: 13px;
    width: 13px;
    border: var(--dashed-border);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 5px;
      width: 1px;
      height: 100%;
      top: 0;
      border-right: var(--dashed-border);
    }

    &::before {
      content: '';
      position: absolute;
      top: 5px;
      height: 1px;
      width: 100%;
      left: 0;
      border-bottom: var(--dashed-border);
    }

    &--all,
    &--outer,
    &--outerBold,
    &--left {
      border-left: var(--solid-border);
    }

    &--all,
    &--outer,
    &--outerBold,
    &--top {
      border-top: var(--solid-border);
    }

    &--all,
    &--outer,
    &--outerBold,
    &--right {
      border-right: var(--solid-border);
    }

    &--all,
    &--outer,
    &--outerBold,
    &--bottom {
      border-bottom: var(--solid-border);
    }

    &--all {
      &::after {
        border-right: var(--solid-border);
      }
      &::before {
        border-bottom: var(--solid-border);
      }
    }

    &--outerBold {
      border-width: 2px;
    }
  }
</style>
