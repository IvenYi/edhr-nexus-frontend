<template>
  <basic-button v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')" v-bind="basic">
    {{ title }}
  </basic-button>
  <!-- 新版本的BaseButton -->
  <baseButton v-else v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-excute-button">
  import basicButton from '/@page-designer/components/widgets/web/__components__/basic_button.vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
  const { title, basic } = toRefs(props.widget.props);
</script>

<style scoped lang="less"></style>
