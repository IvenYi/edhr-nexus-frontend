<template>
  <div class="rich-editor-modal">
    <rich-editor
      ref="richEditorRef"
      :content="contentVal"
      @created="editorCreated"
      @change="handleEmailChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { RichEditor } from '../components/rich-editor';
  import { useModal } from '@gct/runtime';

  const richEditorRef = ref<{ setHtml: (html: string) => void } | null>(null);
  const contentVal = ref('');
  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
  }>();

  onMounted(() => {
    if (!contentVal.value) {
      contentVal.value = props.value;
    }
  });
  const editorCreated = () => {
    const text = contentVal.value || props.value;
    richEditorRef.value?.setHtml(text);
  };

  const handleEmailChange = (val: string) => {
    console.log(val);
    contentVal.value = val;
    emit('update:value', val);
  };

  const onSave = () => {
    return {
      ok: true,
      params: { value: contentVal.value },
    };
  };

  useModal(onSave);
</script>

<style lang="less" scoped>
  .rich-editor-modal {
    padding: 24px 12px;
  }
</style>
