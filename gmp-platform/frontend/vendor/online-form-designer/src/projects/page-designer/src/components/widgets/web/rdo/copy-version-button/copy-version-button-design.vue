<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" />
</template>

<script setup lang="ts" name="gct-copy-version-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
  const { title, basic } = toRefs(props.widget.props);
</script>
<style scoped lang="less"></style>
