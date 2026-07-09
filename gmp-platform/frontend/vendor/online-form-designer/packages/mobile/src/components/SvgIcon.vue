<template>
  <svg
    :class="[$attrs.class, spin && 'svg-icon-spin']"
    :style="getStyle"
    aria-hidden="true"
    class="vben-svg-icon"
  >
    <use :xlink:href="symbolId" />
  </svg>
</template>
<script lang="ts" name="SvgIcon">
  import type { CSSProperties } from 'vue';
  import { defineComponent, computed } from 'vue';

  export default defineComponent({
    name: 'SvgIcon',
    props: {
      prefix: {
        type: String,
        default: 'icon',
      },
      name: {
        type: String,
        required: true,
      },
      size: {
        type: [Number, String],
        default: 16,
      },
      spin: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const symbolId = computed(() => `#${props.prefix}-${props.name}`);
      const getStyle = computed((): CSSProperties => {
        const { size } = props;
        let s = `${size}`;
        s = `${s.replace('px', '')}px`;
        return {
          width: s,
          height: s,
        };
      });
      return { symbolId, getStyle };
    },
  });
</script>
<style lang="less" scoped>
  .vben-svg-icon {
    display: inline-block;
    overflow: hidden;
    fill: currentcolor;
    vertical-align: -0.15em;
  }

  .svg-icon-spin {
    animation: loadingCircle 1s infinite linear;
  }
</style>
