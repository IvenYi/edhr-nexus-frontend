<template>
  <basic-button
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    type="primary"
    v-bind="basic"
  >
    {{ title }}</basic-button
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-refresh-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
  const { title, basic } = toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
