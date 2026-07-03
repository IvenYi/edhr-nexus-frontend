<template>
  <i :class="[ns.b(), disabled && ns.m('disabled'), selected && ns.m('selected')]"></i>
</template>

<script lang="ts" setup>
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('radio-icon');

  withDefaults(
    defineProps<{
      disabled?: boolean;
      selected?: boolean;
    }>(),
    {
      disabled: false,
      selected: false,
    },
  );
</script>

<style lang="scss" scoped>
  $radio-icon: (
    icon-size: 16px,
    icon-color: var(--ant-primary-color),
    icon-default-color: #d9d9d9,
  );

  @include b(radio-icon) {
    @include set-component-css-var(radio-icon, $radio-icon);
    box-sizing: border-box;
    position: relative;
    inset-block-start: 0;
    inset-inline-start: 0;
    display: block;
    width: getCssVar(radio-icon, icon-size);
    height: getCssVar(radio-icon, icon-size);
    background-color: #ffffff;
    border-color: getCssVar(radio-icon, icon-default-color);
    border-style: solid;
    border-width: 1px;
    border-radius: 50%;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      border-color: getCssVar(radio-icon, icon-color);
    }

    &::after {
      box-sizing: border-box;
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      display: block;
      width: getCssVar(radio-icon, icon-size);
      height: getCssVar(radio-icon, icon-size);
      margin-block-start: -8px;
      margin-inline-start: -8px;
      background-color: #fff;
      border-block-start: 0;
      border-inline-start: 0;
      border-radius: 16px;
      transform: scale(0);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
      content: '';
    }

    @include m(selected) {
      background-color: getCssVar(radio-icon, icon-color);
      border-color: getCssVar(radio-icon, icon-color);
      &::after {
        transform: scale(0.375);
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
      }
    }

    @include m(disabled) {
      background-color: rgba(0, 0, 0, 0.04);
      border-color: #d9d9d9;
      &::after {
        background-color: rgba(0, 0, 0, 0.25);
      }
    }
  }
</style>
