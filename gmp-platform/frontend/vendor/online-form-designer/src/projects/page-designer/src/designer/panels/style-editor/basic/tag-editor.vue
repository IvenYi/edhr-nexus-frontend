<template>
  <tag-editor :tagStyle="styleValue" :widget="widget"/>
</template>

<script setup lang="ts" name="tag-editor">
  import { useStyleEditor, props } from '/@page-designer/hooks/useStyleEditor';

  import tagEditor from '../common/tageditor.vue';

  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor(defProps.editor);
</script>
