<template>
  <span :class="['node-arrow', expanded ? 'node-arrow--expanded' : '']">
    <svg
      focusable="false"
      class=""
      data-icon="caret-down"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 1024 1024"
    >
      <path
        d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"
      />
    </svg>
  </span>
</template>

<script lang="ts" setup name="node-arrow">
  const props = withDefaults(
    defineProps<{
      expanded?: boolean;
    }>(),
    {
      expanded: false,
    },
  );
</script>

<style lang="less" scoped>
  .node-arrow {
    --node-arrow-size: 16px;
    --node-arrow-color: #8f8f8f;

    display: inline-block;
    line-height: 0;
    vertical-align: middle;
    font-size: var(--node-arrow-size);
    color: var(--node-arrow-color);

    > svg {
      transition: transform 0.3s;
      transform: rotate(-90deg);
    }
  }

  .node-arrow--expanded {
    > svg {
      transform: rotate(0);
    }
  }
</style>
