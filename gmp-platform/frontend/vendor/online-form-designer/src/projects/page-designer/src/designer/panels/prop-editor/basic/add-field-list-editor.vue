<template>
  <addFieldEditor
    :modelKey="fieldModelKey"
    v-model="propValue"
    :excludeFieldType="excludeFieldType"
  />
</template>

<script setup lang="ts" name="add-field-list-editor">
  import { computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import addFieldEditor from '../../components/editor/add-field-list-editor.vue';

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { modelKey, excludeFieldType } = propConfig || {};
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const fieldModelKey = defProps.widget!.props[modelKey!];
</script>

<style scoped></style>
