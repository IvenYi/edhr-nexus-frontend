<template>
  <a-upload name="file">
    <baseButton :widget="widget" v-bind="widget.props" />
  </a-upload>
</template>
<script lang="ts" setup>
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';

  defineProps<{ widget }>();
</script>
