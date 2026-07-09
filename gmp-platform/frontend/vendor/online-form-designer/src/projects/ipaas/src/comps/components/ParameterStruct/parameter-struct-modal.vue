<template>
  <div class="p24px">
    <json-editor :list="jsonEditorData" :type="type" :disabled="disabled" />
  </div>
</template>

<script setup lang="ts">
  import { ref, inject } from 'vue';
  import JsonEditor from './json-editor.vue';

  let jsonEditorData = ref();
  const modal = inject<any>('modal');

  const props = defineProps<{
    json: string;
    type: 'input' | 'output';
    disabled?: Boolean;
  }>();

  jsonEditorData.value = JSON.parse(props.json);

  modal.ok = async () => {
    try {
      return {
        ok: true,
        data: JSON.stringify(jsonEditorData.value),
      };
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style scoped lang="less"></style>
