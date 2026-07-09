<template>
  <basic-page :class="[ns.b()]">
    <div :class="[ns.e('left')]">
      <slot name="left"></slot>
    </div>
    <div :class="[ns.e('right')]">
      <div :class="[ns.e('header')]">
        <slot name="header"></slot>
      </div>
      <div :class="[ns.e('content')]">
        <slot name="content"></slot>
      </div>
    </div>
  </basic-page>
</template>

<script lang="ts" setup name="page-layout">
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('page-layout');
</script>

<style lang="scss" scoped>
  $page-layout: (
    header-height: 62px,
  );

  @include b(page-layout) {
    @include set-component-css-var(page-layout, $page-layout);
    padding-top: 0 !important;
    border: 1px solid #eaedf1;
    height: 100%;

    :deep(.basic-page__body) {
      height: 100%;
      display: flex;
      flex: 0 0 auto;
    }

    @include e(left) {
      border-width: 0 1px 0 0;
      height: 100%;
    }

    @include e(right) {
      width: 1px; // 有这个宽度才能自适应对
      flex-grow: 1;
      padding: 0 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    @include e(header) {
      flex-shrink: 0;
    }

    @include e(content) {
      border-top: 1px solid #eaedf1;
      flex-grow: 1;
      height: 1px;
    }
  }
</style>
