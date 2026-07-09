<template>
  <i :class="[ns.b(), disabled && ns.m('disabled'), selected && ns.m('selected')]"></i>
</template>

<script lang="ts" setup>
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('checkbox-icon');

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
  $checkbox-icon: (
    icon-size: 16px,
    icon-color: var(--ant-primary-color),
    icon-default-color: #d9d9d9,
  );

  @include b(checkbox-icon) {
    @include set-component-css-var(checkbox-icon, $checkbox-icon);
    border-color: getCssVar(checkbox-icon, icon-default-color);
    box-sizing: border-box;
    position: relative;
    top: 0;
    inset-inline-start: 0;
    display: block;
    width: getCssVar(checkbox-icon, icon-size);
    height: getCssVar(checkbox-icon, icon-size);
    direction: ltr;
    background-color: #ffffff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    border-collapse: separate;
    transition: all 0.3s;
    flex-shrink: 0;

    &:hover {
      border-color: getCssVar(checkbox-icon, icon-color);
    }

    &::after {
      box-sizing: border-box;
      position: absolute;
      top: 50%;
      inset-inline-start: 21.5%;
      display: table;
      width: 5.7142857142857135px;
      height: 9.142857142857142px;
      border: 2px solid #fff;
      border-top: 0;
      border-inline-start: 0;
      transform: rotate(45deg) scale(0) translate(-50%, -50%);
      opacity: 0;
      content: '';
      transition: all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6), opacity 0.1s;
    }

    @include m(selected) {
      background-color: getCssVar(checkbox-icon, icon-color);
      border-color: getCssVar(checkbox-icon, icon-color);
      &::after {
        opacity: 1;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
      }
    }

    @include m(disabled) {
      background-color: rgba(0, 0, 0, 0.04);
      border-color: #d9d9d9;
      &::after {
        border-color: rgba(0, 0, 0, 0.25);
      }
    }
  }
</style>
