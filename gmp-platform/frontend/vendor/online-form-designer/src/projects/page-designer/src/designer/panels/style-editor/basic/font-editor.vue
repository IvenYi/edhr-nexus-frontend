<template>
  <div v-if="editor._config?.label" class="pb8px text-[#212528]">
    {{ $t(editor._config?.label || '') }}
  </div>
  <fonteditor
    :widget="widget"
    :name="editor.name"
    :options="editor._config?.options"
    :hiddenColor="editor._config?.hiddenColor"
  />
</template>

<script setup lang="ts" name="font-editor">
  import { props } from '/@page-designer/hooks/useStyleEditor';
  import fonteditor from '../common/fonteditor.vue';

  defineProps(props);
</script>

<style lang="less" scoped></style>
