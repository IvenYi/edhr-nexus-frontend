<template>
  <basic-button
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    v-bind="basic"
    :style="computedStyle"
  >
    {{ title }}
  </basic-button>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" :style="computedStyle" v-else v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-custom-button">
  import basicButton from '/@page-designer/components/widgets/web/__components__/basic_button.vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { toRefs, reactive, computed } from 'vue';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
  const { title, basic } = toRefs(props.widget.props);
  const { style } = reactive(props.widget);

  const computedStyle = computed(() => {
    const { height, width, hidden } = style;
    return {
      height: height ? `${height}px` : 'auto',
      width: width ? `${width}px` : 'auto',
      overflow: 'hidden',
      visibility: hidden ? 'hidden' : 'visible',
    };
  });
</script>

<style scoped lang="less"></style>
