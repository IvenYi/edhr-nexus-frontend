<template>
  <a-empty :description="description" />
</template>

<script setup lang="ts" name="gct-empty">
  import { toRefs } from 'vue';
  import { IEmpty } from './schema';

  const props = defineProps<{
    widget: IEmpty;
  }>();

  const { description } = toRefs(props.widget.props);
</script>

<style scoped lang="less"></style>
